import React, { useLayoutEffect, useRef, useState } from 'react';
import { useStack } from '../nav';
import { AppFrame, Section, Group, Cell, ActionSheet } from '../ui';
import Glyph from '../icons/Glyph';
import Portrait from '../art/Portrait';
import { ART_W, ART_H } from '../art/portraitArt';
import { TRAITS, TRAIT_BY_ID, GENDER } from '../../data/traits';
import { useSeen, markSeen } from '../seen';
import { sfxTap } from '../sfx';
import { fateLine } from '../words';
import { checksKey, FIELD, answerLabel } from '../dossier';

/**
 * Contacts: everyone in the room, and what they answered at the door.
 *
 * A row is a name, a photo DEEP BLUE drew from their top and glasses, and
 * where they are. Tap it for their card: the same six answers as a plain
 * list, each one tappable so this phone can mark whether it matches what
 * you see, or what they actually tell you. The mark never leaves this
 * phone (dossier.js). My Card shows your own answers but never edits them:
 * they are written once, at arrival. Tap someone else's photo to see it full screen, every
 * detail of what they answered drawn large.
 */
export default function ContactsApp({ ctx, onClose }) {
  const { players, me, traits } = ctx;
  const { top: open, dir, push, pop } = useStack(null, `${ctx.gid}.page.contacts`);

  const person = open ? players.find((p) => p.id === open) : null;
  if (person) return <ContactCard ctx={ctx} p={person} onBack={pop} />;

  const byName = (a, b) => a.name.localeCompare(b.name);
  const alive = players.filter((p) => p.status === 'alive').sort(byName);
  const ghosts = players.filter((p) => p.status === 'ghost').sort(byName);
  const gone = players.filter((p) => p.status === 'vanished').sort(byName);

  const row = (p) => (
    <Cell
      key={p.id}
      title={`${p.name}${p.id === me.pid ? ' (you)' : ''}`}
      sub={p.status === 'alive' ? null : fateLine(p)}
      icon={<Portrait traits={traits?.[p.id]} seed={p.id} ghost={p.status !== 'alive'} size={38} rounded={6} className="os-contact__photo" />}
      chevron
      onClick={() => push(p.id)}
    />
  );

  return (
    <AppFrame title="Contacts" onBack={onClose} light enter={dir === 'pop' ? 'pop' : undefined}>
      <Section head={`In the room · ${alive.length}`}><Group>{alive.map(row)}</Group></Section>
      {ghosts.length > 0 && <Section head={`Ghosts · ${ghosts.length}`}><Group>{ghosts.map(row)}</Group></Section>}
      {gone.length > 0 && <Section head={`Went home · ${gone.length}`}><Group>{gone.map(row)}</Group></Section>}
      <div className="h-6" />
    </AppFrame>
  );
}

/** A glossy round initial, like a contact without a photo (Messages uses it). */
export function Avatar({ name, dead = false, size = 34 }) {
  const hue = [...(name ?? '?')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return (
    <span
      className="inline-grid place-items-center os-label text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        fontWeight: 700,
        background: dead
          ? 'linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0) 52%), linear-gradient(#7f8da6, #4a5870)'
          : `linear-gradient(rgba(255,255,255,0.38), rgba(255,255,255,0) 52%), linear-gradient(hsl(${hue} 62% 58%), hsl(${hue} 66% 36%))`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 0 0 1px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.3)',
        textShadow: '0 -1px 0 rgba(0,0,0,0.35)',
        borderRadius: '50%',
      }}
      aria-hidden="true"
    >
      {dead ? <Glyph name="ghost" size={Math.round(size * 0.55)} /> : (name?.[0] ?? '?').toUpperCase()}
    </span>
  );
}

// ---------------------------------------------------------------------------
// The card

function ContactCard({ ctx, p, onBack }) {
  const { gid, me, traits: all } = ctx;
  const self = p.id === me.pid;
  const file = all?.[p.id];
  const dead = p.status !== 'alive';
  const checks = useSeen(checksKey(gid), {});
  const mine = checks[p.id] ?? {};
  const setCheck = (trait, v) => markSeen(checksKey(gid), { ...checks, [p.id]: { ...mine, [trait]: v ?? undefined } });
  const [sheet, setSheet] = useState(null); // a trait id being checked
  const [zoom, setZoom] = useState(false); // their photo, full screen

  // Your own answers are never editable here: they were written once, at
  // arrival (firestore.rules). Leaving before the deal is the way to redo them.
  const trait = sheet ? TRAIT_BY_ID[sheet] : null;
  const viewer = zoom ? <PhotoViewer file={file} p={p} dead={dead} onClose={() => setZoom(false)} /> : null;
  const overlay = viewer ?? (trait ? (
    <ActionSheet
      title={`${FIELD[trait.id][0].toUpperCase()}${FIELD[trait.id].slice(1)} on their file: ${answerLabel(trait.id, file?.[trait.id]) ?? 'nothing'}. ${trait.visible ? 'What do you see?' : 'What did they tell you?'}`}
      options={[
        { id: 'ok', label: trait.visible ? 'Matches what I see' : 'Same as their file', on: mine[trait.id] === 'ok' },
        ...trait.options.filter((o) => o.id !== file?.[trait.id]).map((o) => ({ id: o.id, label: `${trait.visible ? 'I see' : 'They said'}: ${o.label}`, tone: 'red', on: mine[trait.id] === o.id })),
        { id: 'other', label: trait.visible ? 'Something not on the list' : 'An answer not on the list', tone: 'red', on: mine[trait.id] === 'other' },
        ...(mine[trait.id] ? [{ id: 'clear', label: 'Clear my mark' }] : []),
      ]}
      onPick={(v) => { setCheck(trait.id, v === 'clear' ? null : v); setSheet(null); }}
      onCancel={() => setSheet(null)}
    />
  ) : null);

  const field = (t) => {
    const answer = answerLabel(t.id, file?.[t.id]);
    const mark = mine[t.id];
    const markLine = !mark || self ? null : mark === 'ok'
      ? <span className="os-field__ok"><Glyph name="check" size={11} /> {t.visible ? 'Checks out' : 'Told you the same'}</span>
      : <span className="os-field__bad"><Glyph name="cross" size={10} /> {mark === 'other' ? (t.visible ? 'Not what you see' : 'Told you something else') : `${t.visible ? 'You see' : 'Told you'}: ${answerLabel(t.id, mark)}`}</span>;
    const tappable = Boolean(file) && !self;
    const body = (
      <>
        <span className="os-field__label">{FIELD[t.id]}</span>
        <span className="os-field__value">
          <span className={`block ${answer ? '' : 'opacity-50'}`}>{answer ?? 'Not answered'}</span>
          {markLine}
        </span>
        {tappable && <span className="os-cell__chev"><Glyph name="eye" size={14} /></span>}
      </>
    );
    return tappable
      ? <button key={t.id} type="button" className="os-field" onClick={() => setSheet(t.id)}>{body}</button>
      : <div key={t.id} className="os-field">{body}</div>;
  };

  return (
    <AppFrame title={self ? 'My Card' : 'Info'} onBack={onBack} backLabel="Contacts" light enter="push" overlay={overlay}>
      <div className="flex items-end gap-4 px-4 pt-5">
        {self ? (
          <div className="os-photo shrink-0"><Portrait traits={file} seed={p.id} ghost={dead} full size={116} rounded={3} /></div>
        ) : (
          <button type="button" className="os-photo os-photo--tap shrink-0" aria-label={`See ${p.name}'s photo full screen`} onClick={() => { sfxTap(); setZoom(true); }}>
            <Portrait traits={file} seed={p.id} ghost={dead} full size={116} rounded={3} />
          </button>
        )}
        <div className="min-w-0 pb-1">
          <p className="text-[24px] leading-tight truncate text-os-ink">{p.name}{self ? ' (you)' : ''}</p>
          {dead && <p className="text-[15px] text-os-steel">{fateLine(p)}</p>}
        </div>
      </div>

      <Section
        head={self ? 'Your answers' : 'Their answers'}
        foot={self ? 'How every phone sees you. These can’t be changed.' : 'Tap an answer to mark it.'}
      >
        <Group>{TRAITS.map(field)}</Group>
      </Section>
      {self && (
        // gender draws your photo and is never a clue, so only your own card shows it
        <Section head="Your photo" foot="Drawn from this. Never a clue.">
          <Group>
            <Cell title="Drawn as" value={GENDER.options.find((o) => o.id === file?.gender)?.label ?? 'Not set'} />
          </Group>
        </Section>
      )}
      <div className="h-8" />
    </AppFrame>
  );
}

/**
 * A guest's photo full screen, like opening a picture in Photos: black, the
 * whole drawing fitted to the phone, their name in a glass bar. Tap anywhere
 * to put it down. The canvas is drawn at the fitted size, so the details stay
 * sharp rather than scaled up from the card's thumbnail.
 */
function PhotoViewer({ file, p, dead, onClose }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fit = () => {
      const { width: w, height: h } = el.getBoundingClientRect();
      // 3:4 photo inside the stage, with a little air
      setWidth(Math.max(0, Math.floor(Math.min(w - 16, ((h - 16) * ART_W) / ART_H))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const close = () => { sfxTap(); onClose(); };
  return (
    <div className="os-viewer" role="dialog" aria-modal="true" aria-label={`${p.name}'s photo`} onClick={close}>
      <header className="os-viewer__bar">
        <span />
        <p className="os-viewer__title">{p.name}</p>
        <span className="os-nav__side os-nav__side--right">
          <button type="button" className="os-barbtn os-barbtn--glass" onClick={(e) => { e.stopPropagation(); close(); }}>Done</button>
        </span>
      </header>
      <div ref={ref} className="os-viewer__stage">
        {width > 0 && <Portrait traits={file} seed={p.id} ghost={dead} full size={width} rounded={2} />}
      </div>
    </div>
  );
}
