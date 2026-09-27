import React, { useState } from 'react';
import { submitAction, submitDen } from '../../firebase/game';
import { useDen, useDenMeta, useMyAction, useKillerIds } from '../../hooks/useKillers';
import { GuestPicker, Hold } from './parts';
import ChatPanel from './ChatPanel';

/**
 * The night: everyone acts, on their phone, at once.
 *
 * Every choice saves the moment it is tapped and can be changed until the
 * host locks the night. There is no "submit" to forget, which matters in a
 * bar: a guest who picks and then gets pulled into a conversation has still
 * acted. Anyone who does nothing at all is treated as searching (engine/
 * night.js), so no role is ever wasted on a distracted phone.
 */

const Section = ({ title, children }) => (
  <section className="mt-6">
    <p className="er-mono er-mono--wide">{title}</p>
    {children}
  </section>
);

const save = (fn) => fn().catch((e) => console.warn('[night] not saved:', e.code ?? e.message));

// --- Faithful, Medium, Detective ---------------------------------------------------

function FaithfulNight({ gid, game, me, role, living, nameOf }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const canCheck = role.role === 'detective' && (role.checksLeft ?? 0) > 0;
  const [mode, setMode] = useState(null);
  const kind = mode ?? action?.kind ?? null;
  const others = living.filter((g) => g.pid !== me.pid);

  const choose = (k, target = null) => save(() => submitAction(gid, game.cycle, me.pid, { kind: k, target }));

  return (
    <>
      <div className={`grid ${canCheck ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mt-6`}>
        {[
          ['watch', 'Watch', 'a guest'],
          ['scour', 'Search', 'the scene'],
          ...(canCheck ? [['check', 'Check', `${role.checksLeft} left`]] : []),
        ].map(([k, label, sub]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setMode(k);
              if (k === 'scour') choose('scour');
            }}
            className={`er-touch er-press border px-2 py-4 ${kind === k ? 'border-signal bg-ink-hover' : 'border-line bg-ink-raised'}`}
            aria-pressed={kind === k}
          >
            <span className="block font-typewriter text-[18px] text-bone">{label}</span>
            <span className="block er-mono mt-1">{sub}</span>
          </button>
        ))}
      </div>

      {kind === 'scour' && (
        <p className="font-typewriter text-[17px] text-bone mt-6 er-fade">You&rsquo;ll search the scene. A clue arrives at dawn.</p>
      )}
      {(kind === 'watch' || kind === 'check') && (
        <Section title={kind === 'watch' ? 'Who do you watch?' : 'Who do you check?'}>
          <GuestPicker guests={others} value={action?.kind === kind ? action.target : null} onPick={(pid) => choose(kind, pid)} />
        </Section>
      )}
      {action && (
        <p className="er-mono er-mono--bone mt-6">
          Locked in: {action.kind === 'scour' ? 'searching' : `${action.kind} ${nameOf(action.target)}`}. You can change it.
        </p>
      )}
    </>
  );
}

// --- Doctor ---------------------------------------------------------------------------

function DoctorNight({ gid, game, me, living, nameOf }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const last = useMyAction(gid, game.cycle - 1, me.pid);
  const barred = last?.kind === 'protect' ? last.target : null;
  return (
    <Section title="Who do you protect tonight?">
      <GuestPicker
        guests={living}
        value={action?.target}
        disabled={(g) => g.pid === barred}
        note={(g) => (g.pid === barred ? 'Protected last night' : g.pid === me.pid ? 'You' : null)}
        onPick={(pid) => save(() => submitAction(gid, game.cycle, me.pid, { kind: 'protect', target: pid }))}
      />
      {action && <p className="er-mono er-mono--bone mt-4">Protecting {nameOf(action.target)}.</p>}
    </Section>
  );
}

// --- Killers ---------------------------------------------------------------------------

function KillerDen({ gid, game, me, living, nameOf }) {
  const mates = useKillerIds(gid, true) ?? [];
  const den = useDen(gid, game.cycle, true) ?? [];
  const meta = useDenMeta(gid, true);
  const mine = den.find((d) => d.pid === me.pid) ?? {};
  const livingMates = living.filter((g) => mates.includes(g.pid));
  const targets = living.filter((g) => !mates.includes(g.pid));
  const recruitNight = Boolean(meta?.recruitDue && meta?.cycle === game.cycle);
  const canFrame = meta && !meta.plantUsed && !recruitNight;
  // The frame is a rare, deliberate move, so its list stays folded away until asked for.
  const [framing, setFraming] = useState(false);

  const pickCount = (key) => (pid) => {
    const n = den.filter((d) => d[key] === pid).length;
    return n ? `${n} of ${livingMates.length} chose` : null;
  };
  const set = (patch) => save(() => submitDen(gid, game.cycle, me.pid, patch));

  return (
    <>
      {recruitNight ? (
        <Section title="Recruit night: who joins you?">
          <p className="font-body text-[14px] text-dim mt-2">A Killer left. Invite one guest. If they refuse, they die.</p>
          <GuestPicker guests={targets} value={mine.recruit} note={pickCount('recruit')} onPick={(pid) => set({ recruit: pid })} />
        </Section>
      ) : (
        <Section title="Who dies tonight?">
          <GuestPicker guests={targets} value={mine.victim} note={pickCount('victim')} onPick={(pid) => set({ victim: pid })} />
        </Section>
      )}

      <Section title="Who strikes?">
        <p className="font-body text-[14px] text-dim mt-2">Tonight&rsquo;s clues will describe them.</p>
        <GuestPicker guests={livingMates} value={mine.hand} note={pickCount('hand')} onPick={(pid) => set({ hand: pid })} />
      </Section>

      {canFrame && !framing && !mine.frame && (
        <button type="button" onClick={() => setFraming(true)} className="er-touch er-mono er-mono--hot mt-6">
          Frame someone tonight (once per game) &rarr;
        </button>
      )}
      {canFrame && (framing || mine.frame) && (
        <Section title="Frame someone (once per game)">
          <p className="font-body text-[14px] text-dim mt-2">One of tonight&rsquo;s clues will fit them instead. Tap again to cancel.</p>
          <GuestPicker
            guests={targets.filter((g) => g.pid !== mine.victim)}
            value={mine.frame}
            note={pickCount('frame')}
            onPick={(pid) => set({ frame: mine.frame === pid ? null : pid })}
          />
        </Section>
      )}

      <Section title="The den">
        <ChatPanel gid={gid} channel="denChat" me={me} canSend compact placeholder="Only Killers see this" />
      </Section>
      {mine.victim || mine.recruit ? (
        <p className="er-mono er-mono--bone mt-4">
          Your pick: {nameOf(mine.victim ?? mine.recruit)}. The majority decides; ties break by fate.
        </p>
      ) : null}
    </>
  );
}

// --- Ghosts ------------------------------------------------------------------------------

function GhostNight({ gid, game, me, living, pack, nameOf }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  const [word, setWord] = useState(null);
  const chosen = word ?? action?.word ?? null;
  const send = (target) => chosen && save(() => submitAction(gid, game.cycle, me.pid, { kind: 'whisper', word: chosen, target }));
  return (
    <>
      <Section title="Your word">
        <div className="flex flex-wrap gap-2 mt-3">
          {pack.whispers.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWord(w)}
              className={`er-touch er-press px-3 py-2 border font-typewriter text-[16px] ${chosen === w ? 'border-signal bg-ink-hover' : 'border-line bg-ink-raised'}`}
            >
              {w}
            </button>
          ))}
        </div>
      </Section>
      {chosen && (
        <Section title={`Who hears “${chosen}”?`}>
          <GuestPicker guests={living} value={action?.target} onPick={send} />
        </Section>
      )}
      {action?.target && <p className="er-mono er-mono--bone mt-4">{nameOf(action.target)} will hear &ldquo;{action.word}&rdquo; at dawn.</p>}
    </>
  );
}

// --- The recruit beat ---------------------------------------------------------------------

export function RecruitScreen({ gid, game, me, offered }) {
  const action = useMyAction(gid, game.cycle, me.pid);
  if (!offered) return <Hold label="The night is long…" />;
  const answer = (accept) => save(() => submitAction(gid, game.cycle, me.pid, { kind: 'recruitAnswer', accept }));
  return (
    <section className="bg-signal text-bone p-6 mt-6 er-stamp">
      <p className="er-mono text-bone">An offer</p>
      <h1 className="er-title text-[44px] mt-2 text-bone">Join the Killers?</h1>
      <p className="font-typewriter text-[18px] mt-4">Say yes and you play for them from now on. Say no, and you die tonight.</p>
      <div className="grid grid-cols-2 gap-2 mt-6">
        <button type="button" onClick={() => answer(true)} className={`er-touch er-press py-4 font-mono uppercase tracking-[0.18em] border ${action?.accept === true ? 'bg-ink text-bone border-ink' : 'border-bone'}`}>Yes</button>
        <button type="button" onClick={() => answer(false)} className={`er-touch er-press py-4 font-mono uppercase tracking-[0.18em] border ${action?.accept === false ? 'bg-ink text-bone border-ink' : 'border-bone'}`}>No</button>
      </div>
      <p className="font-mono text-[12px] mt-4">Silence counts as no.</p>
    </section>
  );
}

// --- Router ------------------------------------------------------------------------------------

export default function Night({ gid, game, me, role, players, pack, nameOf }) {
  const living = players.filter((p) => p.status === 'alive').map((p) => ({ ...p, pid: p.id }));
  const props = { gid, game, me, role, living, pack, nameOf };
  if (me.status === 'ghost') return <GhostNight {...props} />;
  if (!role) return <Hold label="Your role is on its way…" />;
  if (role.role === 'killer') return <KillerDen {...props} />;
  if (role.role === 'doctor') return <DoctorNight {...props} />;
  return <FaithfulNight {...props} />;
}

