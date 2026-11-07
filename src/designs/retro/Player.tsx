import { useEffect, useRef, useState } from 'react';
import type { ListId, PackList, Section } from '../../data/types';
import { deriveShort } from '../../data/seed';
import type { ListActions } from '../../hooks/useLists';
import { plural, upper } from '../../data/text';
import { usePanelState } from '../../hooks/usePanelState';
import { DebouncedInput } from '../../components/DebouncedInput';
import { Window } from './Window';
import { Deck } from './Deck';
import { ListIcon, NextIcon, PencilIcon, PlayIcon, PrevIcon, ResetIcon, SpeakerIcon } from './Icons';
import styles from './Player.module.css';

interface Props {
  listId: ListId;
  list: PackList;
  actions: ListActions;
}

const doneOf = (s: Section) => s.items.reduce((n, x) => n + (x.done ? 1 : 0), 0);


/** One list as a retro media-player window. */
export function Player({ listId, list, actions }: Props) {
  const [view, setView] = usePanelState(listId);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const secs = list.sections;
  const n = secs.length;
  const found = secs.findIndex((s) => s.id === view.sec);
  const si = found < 0 ? 0 : found;
  const cur = secs[si] as Section | undefined;
  const showAll = view.all || !cur;

  const stats = secs.map((s) => {
    const d = doneOf(s);
    return { d, n: s.items.length, pct: s.items.length ? d / s.items.length : 0 };
  });
  const doneTotal = stats.reduce((a, s) => a + s.d, 0);
  const allTotal = stats.reduce((a, s) => a + s.n, 0);
  const pct = allTotal ? Math.round((doneTotal / allTotal) * 100) : 0;

  const shown = showAll ? secs : [cur!];
  let nextItem: string | null = null;
  for (const s of shown) {
    const f = s.items.find((x) => !x.done);
    if (f) {
      nextItem = f.text;
      break;
    }
  }
  const curTitle = showAll ? 'усі розділи' : cur!.title;
  const ticker = `♡ ${upper(curTitle)} ✦ ${nextItem ? `ДАЛІ: ${nextItem}` : 'УСЕ ЗІБРАНО ✧'} ✦ ${doneTotal} З ${allTotal} РЕЧЕЙ`;

  const pick = (i: number) => n && setView({ sec: secs[(i + n) % n].id, all: false });
  const sym = listId === 'her' ? '♡' : '✧';

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);
  useEffect(() => {
    if (doneTotal === 0) setConfirming(false);
  }, [doneTotal]);

  return (
    <Window title={upper(list.name)} sym={sym} heading="h2" theme={list.theme ?? listId} className={styles.player}>
      {/* fake menu bar */}
      <div aria-hidden="true" className={styles.menu}>
        <span>
          <u>С</u>писок
        </span>
        <span>
          <u>Р</u>озділи
        </span>
        <span>
          <u>В</u>игляд
        </span>
        <span>
          <u>Д</u>овідка
        </span>
        <span className={styles.viz}>ВІЗ ▾</span>
      </div>

      {/* LCD + side controls */}
      <div className={styles.top}>
        <div className={styles.lcdWrap}>
          <div aria-hidden="true" className={styles.lcdSide}>
            <span>M</span>
            <span>O</span>
            <span>V</span>
            <span>E</span>
          </div>
          <div className={styles.lcd}>
            <div className={styles.lcdTop}>
              <span aria-hidden="true" className={styles.lcdPlay}>
                ▶
              </span>
              <span className={styles.pct} aria-label={`Зібрано ${pct}%`}>
                {pct}%
              </span>
              <div className={styles.lcdStats}>
                <div className={styles.lcdLine}>
                  <span>ЗІБРАНО</span>
                  <span className={styles.tag}>{doneTotal}</span>
                  <span>УСЬОГО</span>
                  <span className={styles.tag}>{allTotal}</span>
                </div>
                <div className={styles.lcdLine} aria-hidden="true">
                  <span className={styles.tagOutline}>♡ ДУЕТ</span>
                  <span className={styles.dim}>РОЗДІЛІВ {n}</span>
                </div>
              </div>
              <div aria-hidden="true" className={styles.bars}>
                {stats.map((s, i) => (
                  <span key={secs[i].id} style={{ height: `${Math.max(4, Math.round(s.pct * 46))}px` }} />
                ))}
              </div>
            </div>
            <div className={styles.ticker}>
              <span className={styles.mq}>
                <span>{ticker}</span>
                <span aria-hidden="true">{ticker}</span>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.side}>
          <div className={styles.sideRow}>
            <button
              type="button"
              className={styles.knob}
              aria-pressed={editing}
              aria-label="Редагувати список"
              onClick={() => setEditing((v) => !v)}
            >
              <PencilIcon />
            </button>
            <span aria-hidden="true" className={styles.led} data-on={editing || undefined} />
            <span aria-hidden="true" className={styles.sideLabel}>
              {editing ? 'ГОТОВО' : 'РЕДАГ.'}
            </span>
          </div>
          <div className={styles.sideRow}>
            <button
              type="button"
              className={styles.knob}
              role="switch"
              aria-checked={showAll}
              aria-label="Показати всі розділи"
              onClick={() => setView({ all: !view.all })}
            >
              <ListIcon />
            </button>
            <span aria-hidden="true" className={styles.led} data-on={showAll || undefined} />
            <span aria-hidden="true" className={styles.sideLabel}>
              УСІ РОЗД.
            </span>
          </div>
          <div className={styles.sideRow}>
            <button
              type="button"
              className={styles.knob}
              aria-label="Скинути всі відмітки"
              aria-expanded={confirming}
              disabled={doneTotal === 0}
              onClick={() => setConfirming((v) => !v)}
            >
              <ResetIcon />
            </button>
            <span aria-hidden="true" className={styles.led} data-on={confirming || undefined} />
            <span aria-hidden="true" className={styles.sideLabel}>
              СКИНУТИ
            </span>
          </div>
        </div>
      </div>

      {/* position slider = overall progress */}
      <div aria-hidden="true" className={styles.seek}>
        <div className={styles.seekTrack}>
          <div className={styles.seekFill} style={{ width: `${pct}%` }} />
        </div>
        <span className={styles.seekThumb} style={{ left: `${pct}%` }} />
      </div>

      {confirming && (
        <div className={styles.confirm} role="group" aria-label="Підтвердження скидання">
          <span className={styles.confirmText}>
            ЗНЯТИ {doneTotal} {upper(plural(doneTotal, 'відмітку', 'відмітки', 'відміток'))}?
          </span>
          <button
            ref={confirmRef}
            type="button"
            className={`${styles.pill} ${styles.pillAccent}`}
            onClick={() => {
              actions.reset(listId);
              setConfirming(false);
            }}
          >
            ТАК, СКИНУТИ
          </button>
          <button type="button" className={styles.pill} onClick={() => setConfirming(false)}>
            НІ
          </button>
        </div>
      )}

      {/* transport */}
      <div className={styles.transport}>
        <div className={styles.transportBtns}>
          <button type="button" className={styles.tBtn} aria-label="Попередній розділ" onClick={() => pick(si - 1)}>
            <PrevIcon />
          </button>
          <button
            type="button"
            className={`${styles.tBtn} ${styles.tPlay}`}
            aria-label="Відмітити наступну річ"
            disabled={!nextItem}
            onClick={() => actions.collectNext(listId, shown.map((s) => s.id))}
          >
            <PlayIcon />
          </button>
          <button type="button" className={styles.tBtn} aria-label="Наступний розділ" onClick={() => pick(si + 1)}>
            <NextIcon />
          </button>
        </div>
        <div aria-hidden="true" className={styles.volume}>
          <span className={styles.volIcon}>
            <SpeakerIcon />
          </span>
          <div className={styles.volBody}>
            <div className={styles.volDots}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span key={i} data-on={i >= 3 || undefined} />
              ))}
            </div>
            <div className={styles.volTrack}>
              <span />
            </div>
          </div>
        </div>
        <div aria-hidden="true" className={styles.config}>
          <span>КОНФІГ</span>
          <span className={styles.grip} />
        </div>
      </div>

      {/* equalizer = per-section progress, click to open a section */}
      <div className={styles.eqPanel}>
        <div aria-hidden="true" className={styles.eqLeds}>
          <div>
            <span className={styles.eqPill}>УВІМК</span>
            <span className={styles.eqLed} data-on />
          </div>
          <div>
            <span className={styles.eqPill}>АВТО</span>
            <span className={styles.eqLed} />
          </div>
          <div>
            <span className={styles.eqPill}>ПАМ'ЯТЬ</span>
          </div>
        </div>
        <div className={styles.eqBody}>
          <div aria-hidden="true" className={styles.eqScale}>
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
          </div>
          <div role="group" aria-label="Прогрес розділів" className={styles.eq}>
            {secs.map((s, i) => {
              const on = i === si && !showAll;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={styles.eqBtn}
                  aria-label={`${s.title}: ${stats[i].d} з ${stats[i].n}`}
                  aria-pressed={on}
                  onClick={() => pick(i)}
                >
                  <span className={styles.eqTrack}>
                    <span className={styles.eqFill} style={{ height: `${Math.round(stats[i].pct * 96)}px` }} />
                    <span className={styles.eqKnob} style={{ top: `${Math.round((1 - stats[i].pct) * 82)}px` }} />
                  </span>
                  <span className={styles.eqTag} data-on={on || undefined}>
                    {s.short || deriveShort(s.title)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* deck: items + section info + tabs */}
      <div className={styles.deckPanel}>
        <div className={styles.deckRow}>
          <Deck listId={listId} sections={shown} showHeaders={showAll} editing={editing} actions={actions} />

          <div className={styles.info}>
            <div className={styles.infoText}>
              {editing && !showAll && cur ? (
                <div className={styles.infoEdit}>
                  <label className={styles.infoLabel}>
                    <span>НАЗВА РОЗДІЛУ</span>
                    <DebouncedInput
                      className={styles.infoTitleInput}
                      value={cur.title}
                      onSave={(t) => actions.setSectionTitle(listId, cur.id, t)}
                      enterKeyHint="done"
                    />
                  </label>
                  <label className={styles.infoLabel}>
                    <span>МІТКА ЕКВАЛАЙЗЕРА</span>
                    <DebouncedInput
                      className={styles.infoShortInput}
                      value={cur.short || deriveShort(cur.title)}
                      onSave={(t) => actions.setSectionShort(listId, cur.id, t)}
                      maxLength={6}
                      enterKeyHint="done"
                    />
                  </label>
                </div>
              ) : (
                <h3 className={styles.infoTitle}>{showAll ? '✦ усе' : `${cur!.sym} ${cur!.title}`}</h3>
              )}
              <div className={styles.infoCount}>
                {showAll ? `${doneTotal} / ${allTotal}` : `${stats[si].d} / ${stats[si].n}`}
              </div>
              {(showAll || cur?.note) && (
                <p className={styles.infoNote}>{showAll ? 'Усі розділи одним списком.' : cur!.note}</p>
              )}
            </div>
            <div aria-hidden="true" className={styles.infoSyms}>
              <span>♡</span>
              <span className={styles.small}>✧</span>
              <span>⋆</span>
              <span className={styles.small}>₊˚</span>
              <span>✦</span>
            </div>
          </div>
        </div>

        {!showAll && (
          <div role="group" aria-label="Розділи" className={styles.tabs}>
            {secs.map((s, i) => (
              <button key={s.id} type="button" className={styles.tab} aria-pressed={i === si} onClick={() => pick(i)}>
                {upper(s.title)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div aria-hidden="true" className={styles.foot}>
        <span>▲</span>
      </div>
    </Window>
  );
}
