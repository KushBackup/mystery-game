import React, { useRef, useState } from 'react';
import { AppFrame, Section, Group, Cell, Hold, Empty, Btn } from '../ui';
import Glyph from '../icons/Glyph';
import { Face } from '../art/Portrait';
import { prefersLessMotion } from '../nav';

/**
 * Board: the latest morning scoreboard, one tap from the home screen.
 *
 * News still plays the board's reveal at dawn (the podium, "…and last place",
 * TAKEN). This app is the board at rest, to open any time after: where you
 * landed, the top three, who was taken, and every row.
 *
 * It never shows a board before the room has seen its reveal: while the dawn
 * reveal is still holding back the death (`news.held`, beats.js), it waits.
 * The pieces below are shared with News's reveal.
 */

/** Who the board's own morning took, or null (a board from an earlier day took nobody today). */
const takenOn = (game) => (game.dawn?.cycle === game.board?.cycle ? (game.dawn?.taken ?? game.dawn?.victims?.[0] ?? null) : null);

export default function BoardApp({ ctx, onClose }) {
  const { game, news } = ctx;
  const scrollRef = useRef(null);
  const rows = game.board?.rows ?? [];
  const held = news.held && game.phase === 'dawn';

  let body;
  if (held) {
    body = (
      <Hold label="POSTING THE BOARD…">
        <div className="mt-6 px-10"><Btn tone="dark" small onClick={() => ctx.open('news')}>Watch it in News</Btn></div>
      </Hold>
    );
  } else if (!rows.length) {
    body = <Empty glyph="trophy" title="NO BOARD YET" line="The first board goes up after the first morning game." />;
  } else {
    body = <BoardPage ctx={ctx} scrollRef={scrollRef} />;
  }
  return <AppFrame title="Board" onBack={onClose} tone="dark" dark bodyRef={scrollRef}>{body}</AppFrame>;
}

function BoardPage({ ctx, scrollRef }) {
  const { game, me, nameOf } = ctx;
  const meRef = useRef(null);
  const board = game.board;
  const rows = board.rows ?? [];
  const taken = takenOn(game);
  const takenRow = taken ? rows.find((r) => r.pid === taken) : null;

  // Bring your own row to the middle of the list. scrollTop on the app's own
  // scroller, never scrollIntoView (Lessons 2026-10-03).
  const toMe = () => {
    const box = scrollRef.current;
    const row = meRef.current;
    if (!box || !row) return;
    const top = row.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - box.clientHeight / 2 + row.offsetHeight / 2;
    box.scrollTo({ top: Math.max(0, top), behavior: prefersLessMotion() ? 'auto' : 'smooth' });
  };

  return (
    <div className="pb-8">
      <div className="os-boardhead">
        <p className="os-label text-[11px] text-os-chrome">MORNING BOARD</p>
        <p className="os-boardhead__day">Day {board.cycle}</p>
        <p className="text-[13px] text-os-chrome">{rows.length} players</p>
      </div>

      <MyPlace rows={rows} me={me} takenPid={taken} cycle={board.cycle} ghosts={board.ghosts} shield={board.shield ?? 0} onTap={rows.some((r) => r.pid === me.pid) ? toMe : null} />

      <Podium ctx={ctx} rows={rows} takenPid={taken} />

      {takenRow && (
        <div className="os-boardtaken mx-3 mt-4">
          <Face traits={ctx.traits} pid={taken} ghost size={36} round />
          <div className="min-w-0 flex-1">
            <p className="os-label text-[11px] text-os-chrome">LAST PLACE</p>
            <p className="text-[17px] font-bold truncate">{nameOf(taken)}{taken === me.pid ? ' (you)' : ''}</p>
          </div>
          <span className="os-board-score !text-os-red">{takenRow.score}</span>
          <span className="os-taken !text-[12px]">KILLED</span>
        </div>
      )}

      <BoardList ctx={ctx} meRef={meRef} />
    </div>
  );
}

/** The top three on blocks, second · first · third. `animate` pops them in one by one (the reveal). */
export function Podium({ ctx, rows, takenPid, animate = false }) {
  const { nameOf } = ctx;
  const top = rows.filter((x) => x.pid !== takenPid);
  return (
    <div className="grid grid-cols-3 items-end gap-2 px-3 pt-4">
      {[1, 0, 2].map((i) => {
        const r = top[i];
        if (!r) return <div key={i} />;
        return (
          <div key={r.pid} className={`text-center ${animate ? 'os-pop' : ''}`} style={animate ? { animationDelay: `${i * 350}ms` } : undefined}>
            <div className="inline-block"><Face traits={ctx.traits} pid={r.pid} size={i === 0 ? 56 : 44} round className={i === 0 ? 'os-face--gold' : ''} /></div>
            <p className="text-[14px] mt-1 truncate">{nameOf(r.pid)}{r.pid === ctx.me.pid ? ' (you)' : ''}</p>
            <div className="mt-1 mx-auto rounded-t-md bg-os-deep border border-os-chrome/30 grid place-items-center" style={{ height: [80, 64, 54][i] }}>
              <div>
                <p className="os-arcade text-os-gold text-[18px]">{r.score}</p>
                <p className="os-label text-[11px] text-os-chrome mt-1">#{i + 1}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Where you landed, in one line: the first thing every guest looks for on a
 * leaderboard. Near the bottom it says so, because tomorrow the bottom kills.
 * A ghost (not on the board) sees their place on the ghost board, if `ghosts`
 * is passed. With `onTap` the card is a button that finds your row.
 */
export function MyPlace({ rows, me, takenPid, cycle, ghosts, shield = 0, onTap }) {
  const mine = rows.find((r) => r.pid === me.pid);
  const ghostAt = !mine && ghosts ? ghosts.findIndex((r) => r.pid === me.pid) : -1;
  if (!mine && ghostAt < 0) return null;
  if (!mine) {
    return (
      <div className="os-myplace mx-3 mt-4">
        <span className="os-myplace__score">{ghosts[ghostAt].score}</span>
        <div className="min-w-0">
          <p className="os-label text-[11px] opacity-80">GHOST BOARD · DAY {cycle}</p>
          <p className="text-[17px] font-bold leading-snug">#{ghostAt + 1} of {ghosts.length} ghosts.</p>
        </div>
      </div>
    );
  }
  const n = rows.length;
  const fromDeep = n - mine.rank - (takenPid && rows.at(-1)?.pid === takenPid ? 1 : 0);
  let tone = 'calm';
  let line = `#${mine.rank} of ${n}. Safe, for today.`;
  if (mine.pid === takenPid) {
    tone = 'edge';
    line = `#${mine.rank} of ${n}. Killed.`;
  } else if (mine.rank <= 3) {
    tone = 'top';
    line = `#${mine.rank} of ${n}. Locked, and DEEP BLUE sent you a photo.`;
  } else if (mine.rank <= shield) {
    tone = 'top';
    line = `#${mine.rank} of ${n}. Locked. The Killers couldn’t touch you.`;
  } else if (fromDeep <= 0) {
    tone = 'edge';
    line = `#${mine.rank} of ${n}. Nobody honest scored lower.`;
  } else if (fromDeep <= 2) {
    tone = 'edge';
    line = `#${mine.rank} of ${n}. ${fromDeep === 1 ? 'One place' : 'Two places'} above last place.`;
  }
  const body = (
    <>
      <span className="os-myplace__score">{mine.score}</span>
      <div className="min-w-0 flex-1 text-left">
        <p className="os-label text-[11px] opacity-80">YOUR SCORE · DAY {cycle}</p>
        <p className="text-[17px] font-bold leading-snug">{line}</p>
      </div>
      {onTap && <span className="os-myplace__find">Find me <Glyph name="forward" size={10} /></span>}
    </>
  );
  return onTap
    ? <button type="button" className={`os-myplace os-myplace--${tone} os-myplace--tap mx-3 mt-4`} onClick={onTap}>{body}</button>
    : <div className={`os-myplace os-myplace--${tone} mx-3 mt-4`}>{body}</div>;
}

/** The whole board, you highlighted, the taken row marked. `meRef` lands on your row. */
export function BoardList({ ctx, meRef }) {
  const { game, me, nameOf } = ctx;
  const [ghostsOpen, setGhostsOpen] = useState(false);
  const rows = game.board?.rows ?? [];
  const ghosts = game.board?.ghosts ?? [];
  const taken = takenOn(game);
  const shield = game.board?.shield ?? 0;
  return (
    <>
      <Section head={`Day ${game.board?.cycle ?? ''} board · ${rows.length} players`}>
        <div className="os-group os-group--dark !p-0">
          {rows.map((r) => (
            <React.Fragment key={r.pid}>
            <div ref={r.pid === me.pid ? meRef : undefined} className={`os-board-row ${r.pid === me.pid ? 'os-board-row--me' : ''} ${r.rank <= 3 && r.pid !== taken ? 'os-board-row--top' : ''} ${r.pid === taken ? 'os-board-row--dead' : ''}`}>
              <span className="os-board-rank">{r.rank <= 3 && r.pid !== taken ? <Glyph name={r.rank === 1 ? 'crown' : 'star'} size={14} /> : `#${r.rank}`}</span>
              <span className="truncate text-[16px] flex items-center gap-2 min-w-0"><Face traits={ctx.traits} pid={r.pid} size={24} round ghost={r.pid === taken} /><span className="truncate">{nameOf(r.pid)}{r.pid === me.pid ? ' (you)' : ''}{!r.played && r.pid !== taken ? <span className="text-os-chrome text-[13px]"> · didn’t play</span> : null}</span></span>
              <span className="flex items-center gap-2">{r.pid === taken && <span className="os-taken !text-[12px]">KILLED</span>}<span className="os-board-score">{r.score}</span></span>
            </div>
            {r.rank === shield && r.rank < rows.length && <p className="os-board-lock"><Glyph name="lock" size={11} /> LOCKED ABOVE THIS LINE · THE KILLERS CAN’T REACH IT</p>}
            </React.Fragment>
          ))}
        </div>
      </Section>
      {ghosts.length > 0 && (
        <Section>
          <button type="button" className="os-btn os-btn--dark os-btn--sm" onClick={() => setGhostsOpen((v) => !v)}>{ghostsOpen ? 'Hide' : 'Show'} the ghost board ({ghosts.length})</button>
          {ghostsOpen && (
            <Group dark className="mt-2">
              {ghosts.map((r, i) => <Cell key={r.pid} title={`${i + 1}. ${nameOf(r.pid)}${r.pid === me.pid ? ' (you)' : ''}`} value={<span className="os-arcade text-[14px] text-os-chrome">{r.score}</span>} />)}
            </Group>
          )}
        </Section>
      )}
    </>
  );
}
