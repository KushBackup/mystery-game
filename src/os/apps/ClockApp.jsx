import React from 'react';
import { AppFrame, Section, Group, Cell } from '../ui';
import { useWorldClock } from '../hooks';
import { useServerNow } from '../../hooks/useKillers';
import { PHASE_LABEL } from '../../data/killersCopy';
import { dayKit } from '../../data/packs/index.js';
import { daySchedule, fmtClock, clockNow, ANCHORS } from '../../lib/engine/clock.js';

/**
 * Clock: the time inside the game, and today's schedule on it. The game
 * clock runs faster than real time (engine/clock.js), and every part of the
 * day starts when it says: the host's console moves the room on by it. Before
 * the deal it shows real time.
 */

// Games made before the game clock: the day as a fixed table, times only.
const FIXED_DAY = [
  ['night', 'Night', '01:00'],
  ['alarm', 'Alarm', '07:00'],
  ['game', 'Morning game', '07:01'],
  ['dawn', 'The board', '07:05'],
  ['investigation', 'Daylight', '09:00'],
  ['roundtable', 'Vote', '18:00'],
  ['banish', 'Verdict', '19:30'],
];
const PART_OF = { night_locked: 'night', recruit: 'night', recruit_locked: 'night', game_locked: 'game', roundtable_locked: 'roundtable', revote: 'roundtable', revote_locked: 'roundtable' };
const TITLE = { night: 'Night', alarm: 'Alarm', dawn: 'The board', investigation: 'Daylight', roundtable: 'Vote', banish: 'Verdict' };

export default function ClockApp({ ctx, onClose }) {
  const { game, pack } = ctx;
  const clock = useWorldClock(game);
  const now = useServerNow(game.phaseEndsAt, 1000);
  const current = PART_OF[game.phase] ?? game.phase;
  const speed = game.config?.clock?.speed;
  const plan = daySchedule(game, now);
  const today = dayKit(pack).dayGames[game.minigame ?? 'run']?.title ?? 'The run';
  const title = (id) => (id === 'game' ? `Morning game · ${today}` : TITLE[id]);
  const t = clockNow(game, now);

  // The one line under the time: what the clock is counting towards.
  let next = '';
  if (game.phase === 'lobby') next = speed ? 'The game clock starts when the host deals.' : '';
  else if (game.phase === 'casting' && speed) next = `Night 1 falls at ${fmtClock(ANCHORS.night)}.`;
  else if (plan && t != null) {
    if (current === 'game' || current === 'alarm') {
      next = `Play ${today} before ${fmtClock(plan.parts.find((p) => p.id === 'dawn').at)}.`;
    } else {
      const up = plan.parts.find((p) => p.at > t + 0.5);
      next = up ? `${title(up.id)} at ${fmtClock(up.at)}.` : `Night falls at ${fmtClock(ANCHORS.night)}.`;
    }
  }

  return (
    <AppFrame title="Clock" onBack={onClose} tone="dark" dark>
      <div className="text-center pt-8 pb-6 px-4">
        <p className="os-label text-[12px] text-os-chrome">{(PHASE_LABEL[game.phase] ?? '').toUpperCase()} {game.cycle ? `· DAY ${game.cycle}` : ''}</p>
        <p className="text-[68px] leading-none font-extralight tracking-tight mt-3 text-white tabular-nums">{clock}</p>
        {next && <p className="text-[15px] mt-3 text-os-chrome os-balance">{next}</p>}
      </div>
      {plan ? (
        <Section head={`Day ${game.cycle}`} foot={speed ? `Game time runs about ${Math.round(speed)}× faster than real time.` : undefined}>
          <Group dark>
            {plan.parts.map((p) => (
              <Cell key={p.id} title={title(p.id)} value={fmtClock(p.at)} on={current === p.id} />
            ))}
          </Group>
        </Section>
      ) : !speed && (
        <Section head="A day in DEEP BLUE">
          <Group dark>
            {FIXED_DAY.map(([id, name, sub]) => (
              <Cell key={id} title={name} value={sub} on={current === id} />
            ))}
          </Group>
        </Section>
      )}
      <div className="h-8" />
    </AppFrame>
  );
}
