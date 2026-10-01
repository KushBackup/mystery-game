import React from 'react';
import { useStack } from '../nav';
import { AppFrame, Section, Group, Cell } from '../ui';
import Glyph from '../icons/Glyph';
import { fateLine } from '../words';

/**
 * Contacts: everyone in the room, alive first. Tap a name for their card: table,
 * what happened to them, and where they sat on the last board. This is the
 * only roster a guest has, so it answers "who is still playing?" at a glance.
 */
export default function ContactsApp({ ctx, onClose }) {
  const { players, me, game } = ctx;
  const { top: open, dir, push, pop } = useStack();
  const byName = (a, b) => a.name.localeCompare(b.name);
  const alive = players.filter((p) => p.status === 'alive').sort(byName);
  const ghosts = players.filter((p) => p.status === 'ghost').sort(byName);
  const gone = players.filter((p) => p.status === 'vanished').sort(byName);

  const person = open ? players.find((p) => p.id === open) : null;
  if (person) return <ContactCard p={person} me={me} game={game} onBack={pop} />;

  const row = (p) => (
    <Cell
      key={p.id}
      title={`${p.name}${p.id === me.pid ? ' (you)' : ''}`}
      sub={p.status === 'alive' ? (p.table ? `Table ${p.table}` : 'In the room') : fateLine(p)}
      icon={<Avatar name={p.name} dead={p.status !== 'alive'} />}
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

/** A glossy round initial, like a contact without a photo. */
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

function ContactCard({ p, me, game, onBack }) {
  const row = game.board?.rows?.find((r) => r.pid === p.id);
  return (
    <AppFrame title={p.name} onBack={onBack} backLabel="Contacts" light enter="push">
      <div className="flex items-center gap-4 px-4 pt-5">
        <Avatar name={p.name} dead={p.status !== 'alive'} size={64} />
        <div className="min-w-0">
          <p className="text-[24px] leading-tight truncate text-os-ink">{p.name}{p.id === me.pid ? ' (you)' : ''}</p>
          <p className="text-[15px] text-os-steel">{p.status === 'alive' ? 'Still playing' : fateLine(p)}</p>
        </div>
      </div>
      <Section>
        <Group>
          <Cell title="Table" value={p.table || '—'} />
          <Cell title="Status" value={p.status === 'alive' ? 'Alive' : p.status === 'ghost' ? 'Ghost' : 'Went home'} />
          {row && <Cell title={`Board, day ${game.board.cycle}`} value={`#${row.rank} · ${row.score}`} />}
        </Group>
      </Section>
      {p.status === 'alive' && p.id !== me.pid && (
        <p className="os-section__foot px-6 mt-2">Ask them what they were drinking. Ask them when their birthday is. Watch how they answer.</p>
      )}
    </AppFrame>
  );
}
