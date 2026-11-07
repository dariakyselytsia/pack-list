import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Item, ListId, PackList, Section } from '../../data/types';
import { plural, upper } from '../../data/text';
import type { ListActions } from '../../hooks/useLists';
import { usePanelState } from '../../hooks/usePanelState';
import { DebouncedInput } from '../../components/DebouncedInput';
import { AsciiSphere } from './AsciiSphere';
import { hearts, ruler } from './ascii';
import styles from './Terminal.module.css';

interface Props {
  listId: ListId;
  list: PackList;
  actions: ListActions;
}

const doneOf = (s: Section) => s.items.reduce((n, x) => n + (x.done ? 1 : 0), 0);

/** One list as a glowing terminal panel. */
export function Terminal({ listId, list, actions }: Props) {
  const [view, setView] = usePanelState(listId);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const secs = list.sections;
  const n = secs.length;
  const found = secs.findIndex((s) => s.id === view.sec);
  const si = found < 0 ? 0 : found;
  const showAll = view.all || n === 0;
  const shown = showAll ? secs : [secs[si]];

  const stats = secs.map((s) => ({ d: doneOf(s), n: s.items.length }));
  const doneTotal = stats.reduce((a, s) => a + s.d, 0);
  const allTotal = stats.reduce((a, s) => a + s.n, 0);
  const ratio = allTotal ? doneTotal / allTotal : 0;
  const pct = Math.round(ratio * 100);
  const left = allTotal - doneTotal;
  const status = left === 0 ? 'УСЕ ЗІБРАНО ✓' : ratio >= 0.5 ? 'ПАКУВАННЯ: ПОНАД ПОЛОВИНУ' : 'ПАКУВАННЯ ТРИВАЄ…';

  const pick = (i: number) => n && setView({ sec: secs[(i + n) % n].id, all: false });

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);
  useEffect(() => {
    if (doneTotal === 0) setConfirming(false);
  }, [doneTotal]);

  return (
    <section className={styles.panel} data-theme={list.theme ?? listId} aria-label={list.name}>
      {/* stats */}
      <div className={styles.stats}>
        <div className={styles.progress}>
          <div className={styles.nameRow}>
            <h2 className={styles.name}>{upper(list.name.replace(/\s*[♡✧]\s*$/, ''))}</h2>
            <span className={styles.user}>/// {listId === 'her' ? 'USER_01' : 'USER_02'}</span>
          </div>
          <div className={styles.packRow} aria-label={`Зібрано ${doneTotal} з ${allTotal} (${pct}%)`}>
            <span aria-hidden="true" className={styles.packText}>
              Пакування..
            </span>
            <span aria-hidden="true" className={styles.packTrack}>
              <span className={styles.packFill} style={{ width: `${pct}%` }} />
            </span>
            <span aria-hidden="true" className={styles.packText}>
              {doneTotal}/{allTotal}
            </span>
          </div>
          <div aria-hidden="true" className={styles.hearts}>
            {hearts(ratio)}
          </div>
          <pre aria-hidden="true" className={styles.ruler}>
            {ruler(ratio)}
          </pre>
        </div>

        <div className={styles.statusCell}>
          <div className={styles.statusText}>
            <span className={styles.statusTitle}>СТАТУС</span>
            <span>{status}</span>
            <span className={styles.dimText}>РОЗДІЛІВ: {n}</span>
            <span className={styles.dimText}>ЗАЛИШИЛОСЬ: {left}</span>
          </div>
          <AsciiSphere className={styles.sphere} />
        </div>
      </div>

      {/* section list + items */}
      <div className={styles.body}>
        <nav className={styles.nav} aria-label="Розділи">
          <div className={styles.navCount}>{n} РОЗДІЛІВ</div>
          <div className={styles.navTitle}>/* СПИСОК */</div>
          <div className={styles.tabs}>
            {secs.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={styles.tab}
                aria-pressed={i === si && !showAll}
                onClick={() => pick(i)}
              >
                <span className={styles.tabLabel}>
                  <span aria-hidden="true">{i === si && !showAll ? '> ' : '  '}</span>
                  {upper(s.title)}
                </span>
                <span className={styles.tabCount}>
                  {stats[i].d}/{stats[i].n}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.allBtn}
            role="switch"
            aria-checked={showAll}
            onClick={() => setView({ all: !view.all })}
          >
            <span>УСІ РОЗДІЛИ</span>
            <span aria-hidden="true">{showAll ? '[x]' : '[ ]'}</span>
          </button>
        </nav>

        <div className={styles.groups}>
          {shown.map((s) => (
            <Group key={s.id} listId={listId} section={s} editing={editing} actions={actions} />
          ))}
        </div>
      </div>

      {/* controls */}
      <div className={styles.controls}>
        <button type="button" className={styles.ctl} aria-label="Попередній розділ" onClick={() => pick(si - 1)}>
          <span aria-hidden="true" className={styles.ctlKey}>
            (&lt;&lt;)
          </span>
          <span aria-hidden="true" className={styles.ctlLabel}>
            НАЗАД
          </span>
        </button>
        <pre aria-hidden="true" className={styles.deco}>
          {'\\\\\\:::|| >< ||:::///\n \\\\\\::|| >< ||::///\n  \\\\\\:|| >< ||:///'}
        </pre>
        <button
          type="button"
          className={styles.ctl}
          aria-label="Скинути всі відмітки"
          aria-expanded={confirming}
          disabled={doneTotal === 0}
          onClick={() => setConfirming((v) => !v)}
        >
          <span aria-hidden="true" className={styles.ctlKey}>
            (0%)
          </span>
          <span aria-hidden="true" className={styles.ctlLabel}>
            СКИНУТИ
          </span>
        </button>
        <button
          type="button"
          className={styles.ctl}
          aria-pressed={editing}
          aria-label="Редагувати список"
          onClick={() => setEditing((v) => !v)}
        >
          <span aria-hidden="true" className={styles.ctlKey}>
            (~/)
          </span>
          <span aria-hidden="true" className={styles.ctlLabel}>
            {editing ? 'ГОТОВО' : 'РЕДАГ.'}
          </span>
        </button>
        <button type="button" className={styles.ctl} aria-label="Наступний розділ" onClick={() => pick(si + 1)}>
          <span aria-hidden="true" className={styles.ctlKey}>
            (&gt;&gt;)
          </span>
          <span aria-hidden="true" className={styles.ctlLabel}>
            ДАЛІ
          </span>
        </button>
      </div>

      {confirming && (
        <div className={styles.confirm} role="group" aria-label="Підтвердження скидання">
          <span className={styles.confirmText}>
            &gt; ЗНЯТИ {doneTotal} {upper(plural(doneTotal, 'відмітку', 'відмітки', 'відміток'))}?
            <span aria-hidden="true" className={styles.caret}>
              _
            </span>
          </span>
          <button
            ref={confirmRef}
            type="button"
            className={`${styles.cmd} ${styles.cmdSolid}`}
            onClick={() => {
              actions.reset(listId);
              setConfirming(false);
            }}
          >
            [ ТАК ]
          </button>
          <button type="button" className={styles.cmd} onClick={() => setConfirming(false)}>
            [ НІ ]
          </button>
        </div>
      )}
    </section>
  );
}

function Group({
  listId,
  section: s,
  editing,
  actions,
}: {
  listId: ListId;
  section: Section;
  editing: boolean;
  actions: ListActions;
}) {
  const done = doneOf(s);
  return (
    <div className={styles.group} role="group" aria-label={s.title}>
      <div className={styles.groupHead}>
        {editing ? (
          <span className={styles.titleEdit}>
            <span aria-hidden="true">C:\</span>
            <DebouncedInput
              className={`${styles.input} ${styles.titleInput}`}
              value={s.title}
              onSave={(t) => actions.setSectionTitle(listId, s.id, t)}
              aria-label="Назва розділу"
              enterKeyHint="done"
            />
            <span aria-hidden="true">&gt;</span>
          </span>
        ) : (
          <h3 className={styles.groupTitle}>
            <span aria-hidden="true">C:\</span>
            {upper(s.title)}
            <span aria-hidden="true">&gt;</span>
          </h3>
        )}
        <span className={styles.groupCount}>
          {done}/{s.items.length}
        </span>
      </div>
      {s.note && <div className={styles.note}>/* {s.note} */</div>}

      {s.items.map((it) =>
        editing ? (
          <EditRow
            key={it.id}
            item={it}
            onSave={(t) => actions.setText(listId, s.id, it.id, t)}
            onRemove={() => actions.remove(listId, s.id, it.id)}
          />
        ) : (
          <Row key={it.id} item={it} onToggle={() => actions.toggle(listId, s.id, it.id)} />
        ),
      )}
      {!editing && s.items.length === 0 && <div className={styles.note}>/* ПОРОЖНЬО */</div>}
      {editing && <AddRow onAdd={(t) => actions.add(listId, s.id, t)} />}
    </div>
  );
}

function Row({ item, onToggle }: { item: Item; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={styles.row}
      data-sub={item.sub || undefined}
      data-done={item.done || undefined}
      aria-pressed={item.done}
      onClick={onToggle}
    >
      <span aria-hidden="true" className={styles.box}>
        {item.done ? '[x]' : '[ ]'}
      </span>
      <span className={styles.text}>
        {item.text}
        <span aria-hidden="true"> _</span>
      </span>
      <span aria-hidden="true" className={styles.mark}>
        {item.done ? 'OK' : '..'}
      </span>
    </button>
  );
}

function EditRow({ item, onSave, onRemove }: { item: Item; onSave: (t: string) => void; onRemove: () => void }) {
  return (
    <div className={styles.editRow} data-sub={item.sub || undefined}>
      <span aria-hidden="true" className={styles.prompt}>
        &gt;
      </span>
      <DebouncedInput className={styles.input} value={item.text} onSave={onSave} aria-label="Назва пункту" enterKeyHint="done" />
      <button type="button" className={styles.cmd} aria-label={`Видалити «${item.text}»`} onClick={onRemove}>
        [×]
      </button>
    </div>
  );
}

function AddRow({ onAdd }: { onAdd: (text: string) => boolean }) {
  const [draft, setDraft] = useState('');
  const submit = () => {
    if (onAdd(draft)) setDraft('');
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };
  return (
    <div className={styles.addRow}>
      <span aria-hidden="true" className={styles.prompt}>
        &gt;<span className={styles.caret}>_</span>
      </span>
      <input
        className={`${styles.input} ${styles.draft}`}
        value={draft}
        placeholder="новий пункт…"
        aria-label="Новий пункт у розділі"
        enterKeyHint="enter"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <button
        type="button"
        className={`${styles.cmd} ${styles.cmdSolid}`}
        aria-label="Додати пункт"
        disabled={!draft.trim()}
        onClick={submit}
      >
        [+]
      </button>
    </div>
  );
}
