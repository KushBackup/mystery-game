import React from 'react';
import { AppFrame, Section, Group, Cell } from '../ui';
import { useStack } from '../nav';
import { ROLE_CARD } from '../../data/killersCopy';
import { TRAITS } from '../../data/traits';
import { useMyTraits, useKillerIds } from '../../hooks/useKillers';
import { useSeen, markSeen, noteKey } from '../seen';

/**
 * Notes: the three things a guest needs to look up privately. Their role
 * (the card from casting, always re-readable), their own six answers (the
 * truth they'll be asked about), and a notepad that stays on this phone.
 */
export default function NotesApp({ ctx, onClose }) {
  const { top: open, dir, push, pop } = useStack();
  const { role } = ctx;
  if (open === 'role') return <RoleNote ctx={ctx} onBack={pop} />;
  if (open === 'traits') return <TraitsNote ctx={ctx} onBack={pop} />;
  if (open === 'pad') return <Pad ctx={ctx} onBack={pop} />;
  const notes = [
    ['role', 'Who I am', role ? 'my secret' : 'arrives at the deal', Boolean(role)],
    ['traits', 'My answers', 'what I told DEEP BLUE', true],
    ['pad', 'Suspicions', 'only on this phone', true],
  ];
  return (
    <AppFrame title={`Notes (${notes.length})`} onBack={onClose} bodyClass="os-legal" enter={dir === 'pop' ? 'pop' : undefined}>
      {/* iOS 6 Notes: the list is the pad itself, one note per ruled line. */}
      <ul className="pl-10 pr-3 pt-[3px] text-[18px] leading-[26px] text-[#2a2208]">
        {notes.map(([id, title, sub, ok]) => (
          <li key={id} className="h-[52px]">
            <button type="button" disabled={!ok} onClick={() => push(id)} className="w-full h-full flex items-end pb-[5px] justify-between gap-3 text-left active:bg-[#f3e37a] disabled:opacity-50">
              <span className="truncate">{title}</span>
              <span className="shrink-0 text-[13px] opacity-60">{sub}  ›</span>
            </button>
          </li>
        ))}
      </ul>
    </AppFrame>
  );
}

function Pad({ ctx, onBack }) {
  const key = noteKey(ctx.gid);
  const saved = useSeen(key, '');
  return (
    <AppFrame title="Suspicions" onBack={onBack} backLabel="Notes" bodyClass="os-legal" enter="push">
      <textarea
        className="block w-full min-h-full bg-transparent outline-none resize-none pl-10 pr-4 pt-[3px] text-[18px] leading-[26px] text-[#2a2208] os-selectable"
        style={{ fontFamily: 'var(--font-pixel)', minHeight: '100%' }}
        placeholder="Who lied about their drink?"
        value={saved}
        onChange={(e) => markSeen(key, e.target.value.slice(0, 4000))}
        aria-label="Your private notes"
      />
    </AppFrame>
  );
}

function TraitsNote({ ctx, onBack }) {
  const traits = useMyTraits(ctx.gid, ctx.me.pid);
  return (
    <AppFrame title="My answers" onBack={onBack} backLabel="Notes" light enter="push">
      <Section head="What I answered at the door" foot="Clues describe the killer in these terms. Killers answered too, before they knew. They can lie about the hidden ones out loud.">
        <Group>
          {TRAITS.map((t) => (
            <Cell
              key={t.id}
              title={t.options.find((o) => o.id === traits?.[t.id])?.label ?? '…'}
              sub={`${t.prompt}${t.visible ? ' · visible' : ' · hidden'}`}
            />
          ))}
        </Group>
      </Section>
    </AppFrame>
  );
}

/** The role, on a legal pad. Killers see their partners; the Detective their checks. */
function RoleNote({ ctx, onBack }) {
  const { role, gid, nameOf } = ctx;
  const isKiller = role?.role === 'killer';
  const mates = useKillerIds(gid, isKiller);
  const card = ROLE_CARD[role?.role] ?? ROLE_CARD.faithful;
  const partners = (mates ?? []).filter((p) => p !== role?.id && p !== ctx.me.pid);
  return (
    <AppFrame title="Who I am" onBack={onBack} backLabel="Notes" bodyClass="os-legal" enter="push">
      <div className="pl-10 pr-4 pt-[3px] text-[18px] leading-[26px] text-[#2a2208]">
        <p>You are</p>
        <p className={`os-arcade text-[26px] leading-[26px] ${isKiller ? 'text-os-red' : ''}`}>{card.title.toUpperCase()}</p>
        <p className="mt-[26px]">{card.line}</p>
        <p className="mt-[26px] opacity-80">{card.tip}</p>
        {isKiller && partners.length > 0 && <p className="mt-[26px]">Partners: <b>{partners.map(nameOf).join(', ')}</b></p>}
      </div>
    </AppFrame>
  );
}
