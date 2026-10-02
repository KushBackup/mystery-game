import React, { useState } from 'react';
import { useStack } from '../nav';
import { AppFrame, Section, Group, Cell, ActionSheet } from '../ui';
import Glyph from '../icons/Glyph';
import Portrait from '../art/Portrait';
import { TRAITS, TRAIT_BY_ID } from '../../data/traits';
import { updateMyTrait } from '../../firebase/game';
import { useSeen, markSeen } from '../seen';
import { sfxSent, sfxDeny } from '../sfx';
import { fateLine } from '../words';
import { checksKey, FIELD, answerLabel } from '../dossier';

/**
 * Contacts: everyone in the room, and what they answered at the door.
 *
 * A row is a name, a photo DEEP BLUE drew from their top and glasses, and
 * where they are. Tap it for their card: the same six answers as a plain
 * list, each one tappable so this phone can mark whether it matches what
 * you see, or what they actually tell you. The mark never leaves this
 * phone (dossier.js).
 */
export default function ContactsApp({ ctx, onClose }) {
  const { players, me, traits } = ctx;
  const { top: open, dir, push, pop } = useStack();

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
      icon={<Portrait traits={traits?.[p.id]} ghost={p.status !== 'alive'} size={38} rounded={6} className="os-contact__photo" />}
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
  const { gid, me, role, traits: all } = ctx;
  const self = p.id === me.pid;
  const file = all?.[p.id];
  const dead = p.status !== 'alive';
  const checks = useSeen(checksKey(gid), {});
  const mine = checks[p.id] ?? {};
  const setCheck = (trait, v) => markSeen(checksKey(gid), { ...checks, [p.id]: { ...mine, [trait]: v ?? undefined } });
  const [sheet, setSheet] = useState(null); // a trait id being checked or fixed
  const [fixError, setFixError] = useState('');

  // Before the deal your own answers can still be fixed (the rules agree: traits freeze when a role exists).
  const canFix = self && role === null && Boolean(file);
  const fix = (trait, value) => updateMyTrait(gid, me.pid, trait, value)
    .then(() => { sfxSent(); setFixError(''); })
    .catch(() => { sfxDeny(); setFixError('Too late: your answers locked when the roles were dealt.'); });

  const trait = sheet ? TRAIT_BY_ID[sheet] : null;
  const overlay = trait ? (
    canFix ? (
      <ActionSheet
        title={trait.prompt}
        options={trait.options.map((o) => ({ id: o.id, label: o.label, on: file[trait.id] === o.id }))}
        onPick={(v) => { setSheet(null); if (v !== file[trait.id]) fix(trait.id, v); }}
        onCancel={() => setSheet(null)}
      />
    ) : (
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
    )
  ) : null;

  const field = (t) => {
    const answer = answerLabel(t.id, file?.[t.id]);
    const mark = mine[t.id];
    const markLine = !mark || self ? null : mark === 'ok'
      ? <span className="os-field__ok"><Glyph name="check" size={11} /> {t.visible ? 'Checks out' : 'Told you the same'}</span>
      : <span className="os-field__bad"><Glyph name="cross" size={10} /> {mark === 'other' ? (t.visible ? 'Not what you see' : 'Told you something else') : `${t.visible ? 'You see' : 'Told you'}: ${answerLabel(t.id, mark)}`}</span>;
    const tappable = Boolean(file) && (self ? canFix : true);
    const body = (
      <>
        <span className="os-field__label">{FIELD[t.id]}</span>
        <span className="os-field__value">
          <span className={`block ${answer ? '' : 'opacity-50'}`}>{answer ?? 'Not answered'}</span>
          {markLine}
        </span>
        {tappable && <span className="os-cell__chev"><Glyph name={self ? 'forward' : 'eye'} size={self ? 12 : 14} /></span>}
      </>
    );
    return tappable
      ? <button key={t.id} type="button" className="os-field" onClick={() => setSheet(t.id)}>{body}</button>
      : <div key={t.id} className="os-field">{body}</div>;
  };

  return (
    <AppFrame title={self ? 'My Card' : 'Info'} onBack={onBack} backLabel="Contacts" light enter="push" overlay={overlay}>
      <div className="flex items-center gap-4 px-4 pt-5">
        <Portrait traits={file} ghost={dead} size={64} rounded={6} />
        <div className="min-w-0">
          <p className="text-[24px] leading-tight truncate text-os-ink">{p.name}{self ? ' (you)' : ''}</p>
          {dead && <p className="text-[15px] text-os-steel">{fateLine(p)}</p>}
        </div>
      </div>

      <Section
        head="Their answers"
        foot={self
          ? (canFix ? 'Wrong? Tap one to fix it. Answers lock when the roles are dealt.' : 'Locked since the roles were dealt. Every phone in the room can read this.')
          : 'Tap one to mark whether it matches what you see or what they tell you.'}
      >
        <Group>{TRAITS.map(field)}</Group>
      </Section>
      {fixError && <p className="os-section__foot px-6 text-[#b8160c]">{fixError}</p>}
      <div className="h-8" />
    </AppFrame>
  );
}
