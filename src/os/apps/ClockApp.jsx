import React from 'react';
import { AppFrame, Section, Group, Cell } from '../ui';
import { useServerNow } from '../../hooks/useKillers';
import { PHASE_LABEL } from '../../data/killersCopy';

/**
 * Clock: the shape of a day, and where the room is in it. The alarm itself is
 * a takeover (takeovers.jsx) that rings on its own every morning; this app is
 * where a guest checks what comes next.
 */

// The day as the phone's clock keeps it (words.js WORLD): times, not rules.
const DAY = [
  ['night', 'Night', '01:00'],
  ['alarm', 'Alarm', '07:00'],
  ['game', 'Morning game', '07:01'],
  ['dawn', 'The board', '07:05'],
  ['investigation', 'Daylight', '09:00'],
  ['roundtable', 'Vote', '18:00'],
  ['banish', 'Verdict', '19:30'],
];
const PART_OF = { night_locked: 'night', recruit: 'night', recruit_locked: 'night', game_locked: 'game', roundtable_locked: 'roundtable', revote: 'roundtable', revote_locked: 'roundtable' };

export default function ClockApp({ ctx, onClose }) {
  const { game } = ctx;
  const now = useServerNow(game.phaseEndsAt, 1000);
  const left = game.phaseEndsAt ? Math.max(0, game.phaseEndsAt - now) : 0;
  const mm = String(Math.floor(left / 60000)).padStart(2, '0');
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
  const current = PART_OF[game.phase] ?? game.phase;

  return (
    <AppFrame title="Clock" onBack={onClose} tone="dark" dark>
      <div className="text-center pt-8 pb-6">
        <p className="os-label text-[12px] text-os-chrome">{(PHASE_LABEL[game.phase] ?? '').toUpperCase()} {game.cycle ? `· DAY ${game.cycle}` : ''}</p>
        <p className="text-[68px] leading-none font-extralight tracking-tight mt-3 text-white tabular-nums">{left ? `${mm}:${ss}` : '--:--'}</p>
        <p className="text-[14px] mt-2 text-os-chrome">{left ? 'left in this part of the day' : 'waiting for the host'}</p>
      </div>
      <Section head="A day in DEEP BLUE">
        <Group dark>
          {DAY.map(([id, title, sub]) => (
            <Cell key={id} title={title} sub={sub} on={current === id} />
          ))}
        </Group>
      </Section>
      <div className="h-8" />
    </AppFrame>
  );
}
