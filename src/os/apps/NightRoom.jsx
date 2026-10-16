import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Face, Figure } from '../art/Portrait';
import { MoveGlyph } from '../art/NightArt';
import { TABLE_W, TABLE_H, TABLE_FOOT } from '../art/loungeArt';
import { loungeLayout, figureWidth, figureHeight } from '../art/loungeLayout';
import { roomBitmap, tableBitmap, TABLE_KINDS } from '../art/loungeCache';
import { dprOf } from '../art/portraitCache';
import { lookLine } from '../dossier';
import Glyph from '../icons/Glyph';
import { NIGHT } from '../../data/killersCopy';
import { NightFind } from './nightFind';
import { prefersLessMotion } from '../nav';
import { sfxTap } from '../sfx';

/**
 * The Night app's lounge: the party seen from high up, every guest standing
 * at a table as their own drawn figure, the bar along the back wall and the
 * computer in the corner. A tap on a guest, or on the computer, asks the role
 * screen (NightApp.jsx) what can be done there, and it answers with a sheet.
 *
 * The room is the same picture on every phone. What differs is small: the
 * markers over a guest (the move you made on them, a partner's vote) and the
 * sheet. Killed guests stay where they stood, faded, and can't be tapped;
 * a guest who went home leaves an empty spot, so nobody else moves.
 *
 *   markers   { [pid]: { kind, mine, faces } }: `kind` is a MoveArt picture
 *             ('watch', 'protect', 'trace', 'hunt', 'pass',
 *             'recruit'), `mine` makes it green (sent) instead of blue
 *             (choosing), `faces` are partners' pids pinned over the guest.
 *   computer  the computer's marker, the same shape, or null.
 *   line      two pids joined by a dotted line (the Detective's trace).
 *   tag       (pid) => { kind, label } or null: a name tag drawn another way
 *             ('mate', a red dot, for a Killer's partner; 'barred', dashed, for the
 *             Doctor's guest of last night), `label` read out to a screen reader.
 */

const first = (name) => String(name ?? '').trim().split(/\s+/)[0] || '?';

export default function NightRoom({ players, me, traits, nameOf, canTap, onGuest, onComputer, markers = {}, computer = null, line = null, tag, selected = null, fresh = false }) {
  const { finding, done: onFindDone } = useContext(NightFind);
  const box = useRef(null);
  const [w, setW] = useState(0);
  const [q, setQ] = useState('');

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const measure = () => setW(Math.round(el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Everyone dealt in has a spot; only those still in the room are drawn.
  const ids = useMemo(() => players.map((p) => p.id), [players]);
  const L = useMemo(() => (w ? loungeLayout(ids, w) : null), [ids, w]);
  const shown = players.filter((p) => p.status === 'alive' || p.status === 'ghost');
  const fw = w ? figureWidth(w) : 30;
  const fh = w ? figureHeight(w) : 80;

  // The find field opens from the header's search button; closed, it filters nothing.
  const s = finding ? q.trim().toLowerCase() : '';
  const match = (p) => !s || String(nameOf(p.id) ?? p.name ?? '').toLowerCase().includes(s);
  const hits = s ? shown.filter(match) : [];
  const firstHit = hits[0]?.id ?? null;
  useEffect(() => {
    if (!firstHit || !box.current) return;
    box.current.querySelector(`[data-pid="${CSS.escape(firstHit)}"]`)?.scrollIntoView({ behavior: prefersLessMotion() ? 'auto' : 'smooth', block: 'center' });
  }, [firstHit]);

  return (
    <div className="os-nt-room-wrap">
      {finding && (
        <div className="os-nt-find">
          <label className="os-nt-find__field">
            <Glyph name="search" size={13} />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={NIGHT.room.find} aria-label={NIGHT.room.find} enterKeyHint="search" />
            {s && <span className="os-nt-find__n" aria-live="polite">{hits.length ? NIGHT.room.found(hits.length) : NIGHT.room.none}</span>}
          </label>
          <button type="button" className="os-nt-find__done" onClick={() => { sfxTap(); setQ(''); onFindDone?.(); }}>{NIGHT.room.done}</button>
        </div>
      )}
      <div ref={box} className={`os-nt-room ${s ? 'is-finding' : ''}`} style={{ height: L?.height ?? 600 }}>
        {L && <RoomArt L={L} />}
        {L?.tables.map((t) => <TableArt key={t.id} t={t} />)}
        {L && shown.map((p) => {
          const at = L.spots[p.id];
          if (!at) return null;
          const ghost = p.status === 'ghost';
          const mark = markers[p.id];
          const tapOk = !ghost && canTap(p.id);
          const extra = tag?.(p.id);
          const hitW = Math.max(46, fw + 14);
          const isMe = p.id === me.pid;
          return (
            <button
              key={p.id}
              type="button"
              data-pid={p.id}
              className={[
                'os-nt-fig',
                at.back ? 'is-back' : '',
                ghost ? 'is-ghost' : '',
                selected === p.id ? 'is-sel' : '',
                mark ? (mark.mine ? 'is-mine' : 'is-marked') : '',
                s && !match(p) ? 'is-dim' : '',
                s && match(p) ? 'is-hit' : '',
              ].join(' ')}
              style={{ left: at.x - hitW / 2, top: at.y - fh, width: hitW, height: fh + 6, zIndex: Math.round(at.y) + 1 }}
              disabled={!tapOk}
              aria-label={`${nameOf(p.id)}${isMe ? `, ${NIGHT.room.you}` : ''}${ghost ? `, ${NIGHT.room.killed}` : ''}${extra ? `, ${extra.label}` : ''}`}
              onClick={() => { sfxTap(); onGuest(p.id); }}
            >
              <span className="os-nt-fig__shadow" aria-hidden="true" />
              <span className="os-nt-fig__body" style={{ width: fw, height: fh }}>
                <Figure traits={traits} pid={p.id} size={fw} ghost={ghost} />
              </span>
              <span className={`os-nt-fig__tag ${isMe ? 'is-me' : ''} ${extra ? `is-${extra.kind}` : ''}`}>
                {isMe ? NIGHT.room.you : first(nameOf(p.id))}
              </span>
              {mark && <Marker mark={mark} traits={traits} fresh={fresh && mark.mine} />}
            </button>
          );
        })}
        {L && (
          <button
            type="button"
            className={`os-nt-pc ${computer ? (computer.mine ? 'is-mine' : 'is-marked') : ''}`}
            style={{ left: L.computer.x, top: L.computer.y, width: L.computer.w, height: L.computer.h, zIndex: 2 }}
            disabled={!onComputer}
            aria-label={NIGHT.room.computer.title}
            onClick={() => { sfxTap(); onComputer(); }}
          >
            <span className="os-nt-pc__glow" aria-hidden="true" />
            <span className="os-nt-pc__tag">{NIGHT.room.computer.tag}</span>
            {computer && <Marker mark={computer} traits={traits} fresh={fresh && computer.mine} />}
          </button>
        )}
        {L && line && <TraceLine L={L} pair={line} fh={fh} mine={Boolean(markers[line[0]]?.mine)} />}
      </div>
    </div>
  );
}

/** The painted room: from the cache, painted after the first frame the first time. */
function RoomArt({ L }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return undefined;
    const dpr = dprOf();
    c.width = Math.round(L.w * dpr);
    c.height = Math.round(L.height * dpr);
    const g = c.getContext('2d');
    let raf = requestAnimationFrame(() => {
      raf = 0;
      g.drawImage(roomBitmap(L, dpr), 0, 0);
    });
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [L]);
  return <canvas ref={ref} className="os-nt-room__art" style={{ width: L.w, height: L.height }} aria-hidden="true" />;
}

function TableArt({ t }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = dprOf();
    c.width = Math.round(TABLE_W * dpr);
    c.height = Math.round(TABLE_H * dpr);
    c.getContext('2d').drawImage(tableBitmap(t.id % TABLE_KINDS, dpr), 0, 0);
  }, [t.id]);
  return (
    <canvas
      ref={ref}
      className="os-nt-table"
      style={{ left: t.x - TABLE_FOOT[0], top: t.y - TABLE_FOOT[1], width: TABLE_W, height: TABLE_H, zIndex: Math.round(t.y) }}
      aria-hidden="true"
    />
  );
}

/** A move's icon pinned over a guest (or the computer), and partners' faces beside it. */
function Marker({ mark, traits, fresh }) {
  return (
    <span className={`os-nt-mark ${mark.mine ? 'is-mine' : ''} ${fresh ? 'is-fresh' : ''}`} aria-hidden="true">
      {mark.kind && <span className="os-nt-mark__dot"><MoveGlyph kind={mark.kind} size={15} /></span>}
      {mark.faces?.map((pid) => <Face key={pid} traits={traits} pid={pid} size={18} round className="os-nt-mark__face" />)}
    </span>
  );
}

/** The Detective's two guests, joined at the chest by a dotted line. */
function TraceLine({ L, pair, fh, mine }) {
  const [a, b] = pair.map((pid) => L.spots[pid]);
  if (!a || !b) return null;
  const y = (p) => p.y - fh * 0.58;
  const mx = (a.x + b.x) / 2, my = Math.min(y(a), y(b)) - 34;
  return (
    <svg className={`os-nt-trace ${mine ? 'is-mine' : ''}`} width={L.w} height={L.height} viewBox={`0 0 ${L.w} ${L.height}`} aria-hidden="true">
      <path d={`M${a.x} ${y(a)} Q${mx} ${my} ${b.x} ${y(b)}`} />
    </svg>
  );
}

/**
 * What a tap opens: a light sheet over the night with the guest (or the
 * computer) and the moves that can be made there, one row each, saying what
 * it does and what dawn brings, with the full "how it works" folded under
 * them. A tap on a row makes the move. `children` replaces the rows for a
 * second step (a ghost's photo or word).
 */
export function NightSheet({ pid, traits, nameOf, title, sub, note, options = [], how, children, onCancel }) {
  const [open, setOpen] = useState(false);
  const name = title ?? nameOf?.(pid) ?? NIGHT.room.computer.title;
  const look = sub ?? (pid ? lookLine(traits?.[pid]) : null);
  return (
    <div className="os-ns" role="dialog" aria-modal="true" aria-label={name}>
      <button type="button" className="os-ns__scrim" aria-label={NIGHT.room.cancel} onClick={onCancel} />
      <div className="os-ns__panel">
        <span className="os-ns__grab" aria-hidden="true" />
        <header className="os-ns__who">
          {pid ? <Face traits={traits} pid={pid} size={46} round className="os-ns__face" /> : <span className="os-ns__icon os-ns__icon--pc"><MoveGlyph kind="scour" size={24} /></span>}
          <div className="min-w-0 flex-1">
            <h3 className="os-ns__name">{name}</h3>
            {look && <p className="os-ns__look">{look}</p>}
          </div>
          <button type="button" className="os-ns__x" aria-label={NIGHT.room.cancel} onClick={() => { sfxTap(); onCancel(); }}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </header>
        <div className="os-ns__body">
          {note && <p className="os-ns__note">{note}</p>}
          {children ?? (options.length > 0 && (
            <div className="os-ns__opts">
              {options.map((o) => (
                <button key={o.id ?? o.kind} type="button" className={`os-ns__opt ${o.on ? 'is-on' : ''}`} disabled={Boolean(o.off)} aria-pressed={Boolean(o.on)} onClick={() => { sfxTap(); o.onPick(); }}>
                  <span className={`os-ns__icon os-ns__icon--${o.kind}`}><MoveGlyph kind={o.kind} size={22} /></span>
                  <span className="os-ns__main">
                    <span className="os-ns__top">
                      <span className="os-ns__title">{o.title}</span>
                      {o.odds && !o.off && <>{' '}<span className="os-ns__tag">{o.odds}</span></>}
                    </span>
                    {o.short && <span className="os-ns__short">{o.short}</span>}
                    {o.off
                      ? <span className="os-ns__meta">{o.off}</span>
                      : o.dawn && <span className="os-ns__meta"><Sun />{o.dawn}</span>}
                  </span>
                  <span className="os-ns__go" aria-hidden="true">
                    {o.on
                      ? <svg viewBox="0 0 24 24" width="14" height="14"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
                      : <svg viewBox="0 0 24 24" width="14" height="14"><path d="m9 5 7 7-7 7" /></svg>}
                  </span>
                </button>
              ))}
            </div>
          ))}
          {how?.length > 0 && (
            <div className={`os-ns__how ${open ? 'is-open' : ''}`}>
              <button type="button" className="os-ns__howbtn" aria-expanded={open} onClick={() => { sfxTap(); setOpen(!open); }}>
                <span>{NIGHT.room.how}</span>
                <span className="os-ns__plus" aria-hidden="true" />
              </button>
              {open && (
                <dl className="os-ns__rows">
                  {how.map(([label, text], k) => (
                    <div key={`${label}${k}`} className="os-ns__row">
                      <dt>{label}</dt>
                      <dd>{text}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Sun = () => (
  <svg className="os-ns__sun" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
  </svg>
);
