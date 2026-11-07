import { useCallback, useEffect, useRef, useState } from 'react';
import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type DocumentReference,
} from 'firebase/firestore';
import { db, missingConfig } from '../firebase';
import { buildSections, LIST_NAMES, migrateSections } from '../data/seed';
import { LIST_IDS, type Item, type ListId, type PackList, type Section } from '../data/types';
import { uid } from '../data/uid';

type Lists = Record<ListId, PackList>;

export type ListsState =
  | { status: 'loading'; waitingForNetwork: boolean }
  | { status: 'error'; message: string }
  | { status: 'ready'; lists: Lists; offline: boolean; pending: boolean };

const listRef = (id: ListId) =>
  doc(db!, 'households', 'main', 'lists', id) as DocumentReference<PackList>;

function describe(err: unknown): string {
  const code = (err as { code?: string })?.code;
  if (code === 'permission-denied') return 'немає доступу до бази — перевір правила Firestore';
  if (code === 'unavailable') return 'сервер недоступний — спробуй трохи пізніше';
  if (code === 'not-found') return 'базу Firestore не знайдено — її треба створити в консолі';
  return (err as Error)?.message || String(err);
}

interface DocState {
  data: PackList | null;
  exists: boolean;
  fromCache: boolean;
  pending: boolean;
}

export function useLists() {
  const [docs, setDocs] = useState<Partial<Record<ListId, DocState>>>({});
  const [error, setError] = useState<string | null>(null);
  const [writeError, setWriteError] = useState<string | null>(null);
  const latest = useRef<Partial<Lists>>({});
  const seeding = useRef(false);

  // Realtime subscription to both list documents.
  useEffect(() => {
    if (!db) return;
    const unsubs = LIST_IDS.map((id) =>
      onSnapshot(
        listRef(id),
        { includeMetadataChanges: true },
        (snap) => {
          const data = snap.exists() ? snap.data() : null;
          if (data) latest.current[id] = data;
          setDocs((prev) => ({
            ...prev,
            [id]: {
              data,
              exists: snap.exists(),
              fromCache: snap.metadata.fromCache,
              pending: snap.metadata.hasPendingWrites,
            },
          }));
        },
        (err) => setError(describe(err)),
      ),
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  // First run: the server confirmed a list is missing → seed it from the design.
  // The transaction re-reads both docs, so two devices can't seed twice.
  useEffect(() => {
    if (!db || seeding.current) return;
    const missing = LIST_IDS.some((id) => docs[id] && !docs[id]!.exists && !docs[id]!.fromCache);
    if (!missing) return;
    seeding.current = true;
    runTransaction(db, async (tx) => {
      const snaps = await Promise.all(LIST_IDS.map((id) => tx.get(listRef(id))));
      snaps.forEach((snap, i) => {
        if (snap.exists()) return;
        const id = LIST_IDS[i];
        tx.set(listRef(id), {
          name: LIST_NAMES[id],
          theme: id,
          sections: buildSections(id),
          updatedAt: serverTimestamp() as PackList['updatedAt'],
        });
      });
    })
      .catch((err) => setError(describe(err)))
      .finally(() => {
        seeding.current = false;
      });
  }, [docs]);

  /** Read-modify-write of one list's sections. Works offline: the write is
   *  queued in the local cache and the UI updates immediately. */
  const mutate = useCallback((id: ListId, fn: (sections: Section[]) => Section[]) => {
    const cur = latest.current[id];
    if (!db || !cur) return;
    const sections = fn(cur.sections);
    if (sections === cur.sections) return;
    latest.current[id] = { ...cur, sections };
    updateDoc(listRef(id), { sections, updatedAt: serverTimestamp() }).catch((err) =>
      setWriteError(describe(err)),
    );
  }, []);

  // Lists seeded by the first design lack `short` labels → migrate once,
  // only from server data so we don't act on a stale cache.
  const migrated = useRef<Partial<Record<ListId, boolean>>>({});
  useEffect(() => {
    LIST_IDS.forEach((id) => {
      const d = docs[id];
      if (!d?.data || d.fromCache || migrated.current[id]) return;
      migrated.current[id] = true;
      mutate(id, migrateSections);
    });
  }, [docs, mutate]);

  const patchSection = useCallback(
    (id: ListId, secId: string, fn: (s: Section) => Section) =>
      mutate(id, (secs) => {
        const i = secs.findIndex((s) => s.id === secId);
        if (i < 0) return secs;
        const next = fn(secs[i]);
        return next === secs[i] ? secs : secs.map((s, j) => (j === i ? next : s));
      }),
    [mutate],
  );

  const patchItems = useCallback(
    (id: ListId, secId: string, fn: (items: Item[]) => Item[]) =>
      mutate(id, (secs) => {
        let changed = false;
        const next = secs.map((s) => {
          if (s.id !== secId) return s;
          const items = fn(s.items);
          if (items === s.items) return s;
          changed = true;
          return { ...s, items };
        });
        return changed ? next : secs;
      }),
    [mutate],
  );

  const actions = {
    toggle: (id: ListId, secId: string, itemId: string) =>
      patchItems(id, secId, (xs) => xs.map((x) => (x.id === itemId ? { ...x, done: !x.done } : x))),

    setText: (id: ListId, secId: string, itemId: string, text: string) => {
      const t = text.trim();
      if (!t) return; // never store empty items
      patchItems(id, secId, (xs) =>
        xs.some((x) => x.id === itemId && x.text !== t)
          ? xs.map((x) => (x.id === itemId ? { ...x, text: t } : x))
          : xs,
      );
    },

    remove: (id: ListId, secId: string, itemId: string) =>
      patchItems(id, secId, (xs) => (xs.some((x) => x.id === itemId) ? xs.filter((x) => x.id !== itemId) : xs)),

    add: (id: ListId, secId: string, text: string) => {
      const t = text.trim();
      if (!t) return false;
      patchItems(id, secId, (xs) => [...xs, { id: uid(), text: t, sub: false, done: false }]);
      return true;
    },

    setSectionTitle: (id: ListId, secId: string, title: string) => {
      const t = title.trim();
      if (!t) return;
      patchSection(id, secId, (s) => (s.title === t ? s : { ...s, title: t }));
    },

    setSectionShort: (id: ListId, secId: string, short: string) => {
      const t = short.trim().toUpperCase();
      if (!t) return;
      patchSection(id, secId, (s) => (s.short === t ? s : { ...s, short: t }));
    },

    /** Mark the first unchecked item among the given sections (in order). */
    collectNext: (id: ListId, secIds: string[]) => {
      const secs = latest.current[id]?.sections ?? [];
      for (const secId of secIds) {
        const item = secs.find((s) => s.id === secId)?.items.find((x) => !x.done);
        if (item) {
          patchItems(id, secId, (xs) => xs.map((x) => (x.id === item.id ? { ...x, done: true } : x)));
          return;
        }
      }
    },

    reset: (id: ListId) =>
      mutate(id, (secs) =>
        secs.some((s) => s.items.some((x) => x.done))
          ? secs.map((s) => ({ ...s, items: s.items.map((x) => (x.done ? { ...x, done: false } : x)) }))
          : secs,
      ),
  };

  let state: ListsState;
  if (!db) {
    state = { status: 'error', message: `немає конфігу Firebase у .env: ${missingConfig.join(', ')}` };
  } else if (error) {
    state = { status: 'error', message: error };
  } else if (LIST_IDS.every((id) => docs[id]?.data)) {
    state = {
      status: 'ready',
      lists: { her: docs.her!.data!, his: docs.his!.data! },
      offline: LIST_IDS.some((id) => docs[id]!.fromCache),
      pending: LIST_IDS.some((id) => docs[id]!.pending),
    };
  } else {
    // Missing and only known from cache → no network on the very first run.
    const waitingForNetwork = LIST_IDS.some((id) => docs[id] && !docs[id]!.exists && docs[id]!.fromCache);
    state = { status: 'loading', waitingForNetwork };
  }

  return { state, actions, writeError, clearWriteError: () => setWriteError(null) };
}

export type ListActions = ReturnType<typeof useLists>['actions'];
