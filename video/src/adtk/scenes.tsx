/**
 * scenes.tsx — the reel's layers and its overlay library (16:9, 1920×1080 canvas).
 *
 * Built as independent tracks, bottom to top:
 *
 *   LayerTrack   the footage: full-frame shots and three-way split screens, hard cuts
 *   Overlays     game tiles, knives, role phone, target, game row, board, clue banners,
 *                the brand lockup and the event card
 *   StepChip     "How it works · n/5" across the five steps
 *   Captions     the on-screen script, each word popping as it is spoken
 *   Film         grain and vignette
 *
 * Overlay frames are ABSOLUTE; every cue comes from CUE in ./timeline.ts.
 * Every icon is drawn here (no emoji, no screenshots, no game logos): the six
 * games are named, never shown with their trademarks.
 *
 * FACT DISCIPLINE — names on the board are redaction bars; the event card says
 * only what the user supplied (no time, on purpose).
 */

import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ASSET_DIR, C } from "./theme";
import { Phone, glitch, impact, prog } from "./fx";
import { CAP_SHADOW, Captions, Film, Flash, SANS, Shot, StepChip } from "./kit";
import { BANNERS, BOARD, BRAND, EVENT, GAMES, ROLES } from "./content";
import { CAPTIONS, CUE, H, LAYERS, LAYOUT, PANE_W, SHOTS, STEPS, W } from "./timeline";
import type { Layer } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const inRange = (f: number, r: { from: number; to: number }) => f >= r.from && f < r.to;

/** A rise-and-settle for graphics: critically damped, no wobble. */
const rise = (frame: number, at: number, fps: number, y = 60) => {
  const s = spring({ frame: frame - at, fps, config: { damping: 200 }, durationInFrames: 14 });
  return { opacity: interpolate(s, [0, 0.4], [0, 1], clamp), translate: `0px ${((1 - s) * y).toFixed(2)}px` };
};
/** A pop with a little overshoot, for tiles and stamps. */
const pop = (frame: number, at: number, fps: number) => spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 220, mass: 0.6 } });

// ================================================================== footage ===

const LayerMedia: React.FC<{ L: Layer }> = ({ L }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: L.x0, top: 0, width: L.width, height: H, overflow: "hidden", backgroundColor: C.ink }}>
      {L.card ? (
        <GameCard k={L.card} f={f - L.lightAt} fps={fps} />
      ) : (
        <Shot frame={f} src={L.src} dur={L.dur} grade={f < L.lightAt ? "dim" : L.grade} origin={L.origin} push={L.push} zoom={L.zoom} />
      )}
      {/* A pane waiting for its word sits dimmed, then lights up on it with a small flash. */}
      {L.lightAt > 0 ? <Flash frame={f} at={L.lightAt} color={C.bone} peak={0.3} tau={3} /> : null}
    </div>
  );
};

const LayerTrack: React.FC = () => (
  <>
    {LAYERS.map((L) => (
      <Sequence key={L.key} name={L.key} from={L.from} durationInFrames={L.dur} layout="absolute-fill">
        <LayerMedia L={L} />
      </Sequence>
    ))}
  </>
);

/** Ink gutters between the panes of a split screen, and a section flash on the cut in. */
const ShotDressing: React.FC<{ f: number }> = ({ f }) => {
  const s = SHOTS.find((x) => f >= x.from && f < x.from + x.dur);
  if (!s) return null;
  return (
    <>
      {s.kind === "panes"
        ? [1, 2].map((i) => <div key={i} style={{ position: "absolute", left: i * PANE_W - 3, top: 0, width: 6, height: H, background: C.ink }} />)
        : null}
      {s.section ? <Flash frame={f - s.from} at={0} color={C.bone} peak={0.26} tau={3} /> : null}
    </>
  );
};

// =================================================================== icons ===

/** The six games as drawn marks (never their logos). 100×100 viewBox, bone strokes. */
const GameIcon: React.FC<{ k: string; size: number; color?: string }> = ({ k, size, color = C.bone }) => {
  const st = { fill: "none", stroke: color, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  let body: React.ReactNode = null;
  if (k === "mafia")
    // a fedora
    body = (
      <>
        <path d="M14 64 C30 74 70 74 86 64" {...st} />
        <path d="M28 64 C28 40 34 26 50 32 C66 26 72 40 72 64" {...st} />
        <path d="M29 54 H71" {...st} />
      </>
    );
  else if (k === "among")
    // an emergency button
    body = (
      <>
        <path d="M22 70 H78 V80 H22 Z" {...st} />
        <path d="M30 70 C30 44 70 44 70 70" fill={C.red} stroke={color} strokeWidth={7} />
        <path d="M50 22 V34 M30 28 L36 38 M70 28 L64 38" {...st} />
      </>
    );
  else if (k === "under")
    // sunglasses under a brim
    body = (
      <>
        <path d="M18 40 H82" {...st} />
        <path d="M32 40 C32 26 68 26 68 40" {...st} />
        <path d="M18 58 C18 72 44 72 44 58 Z M56 58 C56 72 82 72 82 58 Z" fill={color} stroke={color} strokeWidth={5} />
        <path d="M44 60 C47 56 53 56 56 60" {...st} />
      </>
    );
  else if (k === "pict")
    // a pencil
    body = (
      <>
        <path d="M24 76 L30 58 L68 20 L80 32 L42 70 Z" {...st} />
        <path d="M60 28 L72 40" {...st} />
        <path d="M24 76 L36 72" {...st} />
      </>
    );
  else if (k === "flappy")
    // a little bird
    body = (
      <>
        <circle cx={46} cy={52} r={24} {...st} />
        <path d="M30 54 C22 46 22 62 34 62" {...st} />
        <circle cx={54} cy={44} r={4} fill={color} />
        <path d="M68 52 L84 56 L68 60" {...st} />
      </>
    );
  else if (k === "cluedo")
    // a magnifier
    body = (
      <>
        <circle cx={42} cy={42} r={22} {...st} />
        <path d="M58 58 L80 80" stroke={color} strokeWidth={10} strokeLinecap="round" />
      </>
    );
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {body}
    </svg>
  );
};

/** A kitchen knife, point up. 60×200 viewBox. */
const Knife: React.FC<{ h: number; color?: string }> = ({ h, color = C.bone }) => (
  <svg width={h * 0.3} height={h} viewBox="0 0 60 200">
    <path d="M30 4 C44 30 48 70 46 112 L14 112 C14 70 18 30 30 4 Z" fill={color} />
    <path d="M30 14 C38 36 40 70 39 104" stroke="rgba(12,13,15,.25)" strokeWidth={4} fill="none" />
    <rect x={8} y={112} width={44} height={10} rx={4} fill={C.ink3} />
    <rect x={17} y={122} width={26} height={72} rx={9} fill={C.red} />
    <circle cx={30} cy={142} r={3.5} fill={C.bone} />
    <circle cx={30} cy={168} r={3.5} fill={C.bone} />
  </svg>
);

/**
 * A drawn card in the middle pane. In the hook, one per game: "GAME n / 6",
 * the game's mark on a red tile, and (from the caption layer) its name. In the
 * clue beat, "sneakers": a clue photo with a drawn sneaker — the footage has
 * no feet in it, so the clue is drawn rather than faked.
 */
const GameCard: React.FC<{ k: string; f: number; fps: number }> = ({ k, f, fps }) => {
  const L = LAYOUT.card;
  // `f` is relative to the card's own moment (it may wait, dimmed, for its word).
  const p = f < 0 ? 0 : pop(f, 0, fps);
  const n = GAMES.findIndex((g) => g.key === k);
  if (k === "sneakers") {
    return (
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${C.ink3} 0%, ${C.ink} 75%)`, fontFamily: SANS }}>
        <div
          style={{
            position: "absolute",
            left: PANE_W / 2 - 210,
            top: 190,
            width: 420,
            padding: "26px 26px 70px",
            background: C.bone,
            borderRadius: 10,
            rotate: `${(-4 + (1 - p) * 10).toFixed(2)}deg`,
            scale: `${(0.7 + 0.3 * p).toFixed(4)}`,
            opacity: interpolate(p, [0, 0.25], [0, 1], clamp),
            boxShadow: "0 30px 60px rgba(0,0,0,.6)",
          }}
        >
          <div style={{ height: 368, background: C.ink2, display: "grid", placeItems: "center" }}>
            <Sneaker size={300} />
          </div>
          <div style={{ position: "absolute", left: 26, bottom: 18, fontWeight: 900, fontSize: 30, color: C.ink, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Clue photo
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 38%, ${C.ink3} 0%, ${C.ink} 78%)`, fontFamily: SANS, color: C.bone }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontWeight: 800, fontSize: 26, letterSpacing: "0.3em", color: C.dim }}>
        GAME {n + 1} / 6
      </div>
      <div
        style={{
          position: "absolute",
          left: PANE_W / 2 - L.icon / 2,
          top: L.iconTop,
          width: L.icon,
          height: L.icon,
          borderRadius: 56,
          background: C.red,
          display: "grid",
          placeItems: "center",
          scale: `${(0.6 + 0.4 * p).toFixed(4)}`,
          rotate: `${((1 - p) * -12).toFixed(2)}deg`,
          boxShadow: "0 26px 60px rgba(0,0,0,.55)",
        }}
      >
        <GameIcon k={k} size={L.icon * 0.72} />
      </div>
    </AbsoluteFill>
  );
};

/** A sneaker, drawn. 100×100 viewBox. */
const Sneaker: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M8 74 L8 52 C22 52 32 42 38 30 L50 34 C54 46 66 52 88 57 C94 58 95 70 91 74 Z" fill="none" stroke={C.bone} strokeWidth={5} strokeLinejoin="round" />
    <path d="M8 74 H91" stroke={C.red} strokeWidth={7} strokeLinecap="round" />
    <path d="M40 38 L48 42 M36 45 L45 49 M32 51 L41 55" stroke={C.bone} strokeWidth={4} strokeLinecap="round" />
  </svg>
);

// ================================================================ overlays ===

/** HOOK — six tiles across the top, one per game as it is named; lit one at a time, then all six at once. */
const GameTiles: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const T = CUE.tiles;
  if (!inRange(f, T)) return null;
  const L = LAYOUT.tiles;
  const width = 6 * L.size + 5 * L.gap;
  const x0 = W / 2 - width / 2;
  // "one at a time": a single red tile walks the row; "all six": every tile goes red together.
  const walk = T.oneAt <= f && f < T.allSix ? Math.min(5, Math.floor(interpolate(f, [T.oneAt, T.timeAt + 8], [0, 5.99], clamp))) : -1;
  const all = f >= T.allSix;
  const slam = impact(f, T.six, 5);
  const out = prog(f, T.to - 8, 8);
  return (
    <>
      {GAMES.map((g, i) => {
        const p = pop(f, T.pops[i], fps);
        if (f < T.pops[i]) return null;
        const lit = all || walk === i;
        // "all six" pulls the row together, as if into one game.
        const squeeze = all ? prog(f, T.allSix, 10) : 0;
        const cx = x0 + i * (L.size + L.gap) + L.size / 2;
        const toward = (W / 2 - cx) * 0.06 * squeeze;
        return (
          <div
            key={g.key}
            style={{
              position: "absolute",
              left: cx - L.size / 2 + toward,
              top: L.top - out * 40,
              width: L.size,
              opacity: (1 - out) * interpolate(p, [0, 0.3], [0, 1], clamp),
              scale: `${(0.6 + 0.4 * p + slam * 0.12).toFixed(4)}`,
              textAlign: "center",
              fontFamily: SANS,
            }}
          >
            <div
              style={{
                width: L.size,
                height: L.size,
                borderRadius: 30,
                background: lit ? C.red : "rgba(12,13,15,.72)",
                border: `2px solid ${lit ? C.red : "rgba(237,231,218,.28)"}`,
                display: "grid",
                placeItems: "center",
                boxShadow: "0 14px 32px rgba(0,0,0,.45)",
              }}
            >
              <GameIcon k={g.key} size={L.size * 0.72} />
            </div>
            <div style={{ marginTop: 8, fontWeight: 800, fontSize: 19, color: C.bone, textShadow: CAP_SHADOW, whiteSpace: "nowrap" }}>{g.label}</div>
          </div>
        );
      })}
    </>
  );
};

/** Three knives, one per pane / one per killer, slammed in on a word. */
const Knives: React.FC<{ f: number; fps: number; from: number; to: number; hit: number; spread?: number; high?: boolean }> = ({
  f,
  fps,
  from,
  to,
  hit,
  spread = 220,
  high = false,
}) => {
  if (f < from || f >= to) return null;
  const K = high ? LAYOUT.knivesHigh : LAYOUT.knives;
  return (
    <>
      {[-1, 0, 1].map((d, i) => {
        const p = pop(f, hit + i * 3, fps);
        if (f < hit + i * 3) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: W / 2 + d * spread - K.size * 0.15,
              top: K.top,
              rotate: `${d * 14}deg`,
              translate: `0px ${((1 - p) * -120).toFixed(2)}px`,
              opacity: interpolate(p, [0, 0.25], [0, 1], clamp),
              filter: "drop-shadow(0 10px 18px rgba(0,0,0,.55))",
            }}
          >
            <Knife h={K.size} />
          </div>
        );
      })}
    </>
  );
};

/** STEP 1 — a sealed role card on a phone. The slot lands on Killer? Doctor? Detective? as each is said. */
const RolePhone: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const R = CUE.role;
  if (!inRange(f, R) || f < R.phoneIn) return null;
  const P = LAYOUT.phone;
  const up = rise(f, R.phoneIn, fps, 200);
  const k = P.width / 520;
  const slot = R.slots.filter((s) => f >= s).length - 1;
  return (
    <div style={{ position: "absolute", inset: 0, ...up }}>
      <Phone width={P.width} style={{ left: P.left, top: P.top, rotate: "4deg" }}>
        <div style={{ position: "absolute", left: 40 * k, right: 40 * k, top: 120 * k, fontFamily: SANS }}>
          <div style={{ fontWeight: 800, fontSize: 30 * k, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sealed message</div>
          <div style={{ marginTop: 30 * k, borderRadius: 30 * k, background: C.ink2, border: `1px solid ${C.line}`, padding: `${36 * k}px ${30 * k}px ${44 * k}px` }}>
            <div style={{ fontWeight: 700, fontSize: 34 * k, color: C.dim }}>Your role</div>
            <div style={{ position: "relative", height: 120 * k, marginTop: 18 * k, overflow: "hidden" }}>
              {slot < 0 ? (
                <div style={{ position: "absolute", inset: `${14 * k}px 0`, borderRadius: 16 * k, background: C.red }} />
              ) : (
                <div
                  key={slot}
                  style={{
                    fontWeight: 900,
                    fontSize: 64 * k,
                    lineHeight: `${120 * k}px`,
                    color: slot === 0 ? C.red : C.bone,
                    letterSpacing: "-0.04em",
                    translate: `0px ${((1 - pop(f, R.slots[slot], fps)) * 60 * k).toFixed(2)}px`,
                    ...glitch(f, R.slots[slot], 4),
                  }}
                >
                  {ROLES[slot]}?
                </div>
              )}
            </div>
            <div style={{ fontWeight: 700, fontSize: 30 * k, color: C.bone, marginTop: 26 * k }}>Tap to open. Show no one.</div>
          </div>
        </div>
      </Phone>
    </div>
  );
};

/** STEP 2 — a red reticle drifts across the dark room and locks on "target". */
const Target: React.FC<{ f: number }> = ({ f }) => {
  const N = CUE.night;
  if (!inRange(f, N)) return null;
  const T = LAYOUT.target;
  const lockP = prog(f, N.lock - 14, 14, Easing.bezier(0.3, 0, 0.2, 1));
  const x = interpolate(lockP, [0, 1], [T.fromX, T.x]);
  const y = interpolate(lockP, [0, 1], [T.fromY, T.y]);
  const locked = f >= N.lock;
  const r = locked ? 70 - 14 * prog(f, N.lock, 6) : 70;
  const appear = prog(f, N.from + 6, 10);
  return (
    <>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: appear }}>
      <g style={{ filter: "drop-shadow(0 0 10px rgba(224,49,39,.6))" }}>
        <circle cx={x} cy={y} r={r} fill="none" stroke={C.red} strokeWidth={5} strokeDasharray={locked ? "0" : "18 12"} />
        {[0, 90, 180, 270].map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={x + Math.cos(rad) * (r + 10)}
              y1={y + Math.sin(rad) * (r + 10)}
              x2={x + Math.cos(rad) * (r + 34)}
              y2={y + Math.sin(rad) * (r + 34)}
              stroke={C.red}
              strokeWidth={5}
              strokeLinecap="round"
            />
          );
        })}
        {locked ? <circle cx={x} cy={y} r={6} fill={C.red} /> : null}
      </g>
    </svg>
    {locked ? <Flash frame={f} at={N.lock} color={C.red} peak={0.25} tau={4} /> : null}
    </>
  );
};

/** STEP 3 — the three morning games pop as they're named. */
const GameRow: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const G = CUE.games;
  if (!inRange(f, G)) return null;
  const L = LAYOUT.games;
  const keys = ["under", "pict", "flappy"];
  const labels = ["Undercover", "Pictionary", "Flappy Bird"];
  const width = 3 * L.size + 2 * L.gap;
  const x0 = L.cx - width / 2;
  return (
    <>
      {keys.map((k, i) => {
        if (f < G.pops[i]) return null;
        const p = pop(f, G.pops[i], fps);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: x0 + i * (L.size + L.gap),
              top: L.top,
              width: L.size,
              textAlign: "center",
              scale: `${(0.55 + 0.45 * p).toFixed(4)}`,
              opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
              rotate: `${(i - 1) * 4}deg`,
              fontFamily: SANS,
            }}
          >
            <div
              style={{
                width: L.size,
                height: L.size,
                borderRadius: 44,
                background: C.red,
                display: "grid",
                placeItems: "center",
                boxShadow: "0 22px 46px rgba(0,0,0,.5)",
              }}
            >
              <GameIcon k={k} size={L.size * 0.7} />
            </div>
            <div style={{ marginTop: 14, fontWeight: 800, fontSize: 30, color: C.bone, textShadow: CAP_SHADOW }}>{labels[i]}</div>
          </div>
        );
      })}
    </>
  );
};

/** STEP 3 — the morning board. "Lowest score dies": the last row is flagged. "Rig the board": one row drops to last, its score to 0. */
const Board: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const B = CUE.board;
  if (!inRange(f, B)) return null;
  const L = LAYOUT.board;
  const up = rise(f, B.from, fps, 80);
  const rigP = prog(f, B.rig, 12, Easing.bezier(0.6, 0, 0.2, 1));
  const n = BOARD.rows.length;
  // Order: before the rig, by score; after, the target row slides to the bottom.
  const slotOf = (i: number) => {
    if (i === BOARD.target) return interpolate(rigP, [0, 1], [i, n - 1]);
    if (i > BOARD.target) return interpolate(rigP, [0, 1], [i, i - 1]);
    return i;
  };
  const lowestRow = rigP > 0.5 ? BOARD.target : n - 1;
  const flag = f >= B.dies;
  return (
    <div
      style={{
        position: "absolute",
        left: L.left,
        top: L.top,
        width: L.width,
        borderRadius: 30,
        background: "rgba(20,21,24,.94)",
        border: `1px solid ${C.line}`,
        boxShadow: "0 30px 70px rgba(0,0,0,.55)",
        padding: "26px 28px 30px",
        fontFamily: SANS,
        ...up,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: "0.12em", textTransform: "uppercase", color: C.dim }}>{BOARD.title}</div>
        <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: "0.12em", textTransform: "uppercase", color: C.dim }}>Score</div>
      </div>
      <div style={{ position: "relative", height: n * L.rowH }}>
        {BOARD.rows.map((r, i) => {
          const isTarget = i === BOARD.target;
          const score = isTarget ? Math.round(interpolate(rigP, [0, 1], [r.score, 0])) : r.score;
          const isLowest = flag && i === lowestRow;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: slotOf(i) * L.rowH,
                height: L.rowH - 14,
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "0 22px",
                borderRadius: 18,
                background: isLowest ? C.red : "rgba(237,231,218,.06)",
                zIndex: isTarget ? 2 : 1,
                ...(isTarget ? glitch(f, B.rig, 6) : {}),
              }}
            >
              <div style={{ width: 40, fontWeight: 900, fontSize: 34, color: isLowest ? C.bone : C.dim }}>{Math.round(slotOf(i)) + 1}</div>
              <div style={{ width: 54, height: 54, borderRadius: 27, background: isLowest ? "rgba(12,13,15,.35)" : C.ink3, flexShrink: 0 }} />
              <div style={{ width: r.name, height: 26, borderRadius: 8, background: isLowest ? "rgba(237,231,218,.85)" : "rgba(237,231,218,.32)" }} />
              <div style={{ marginLeft: "auto", fontWeight: 900, fontSize: 40, color: C.bone, letterSpacing: "-0.02em" }}>{score}</div>
              {isLowest ? (
                <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase", color: C.bone, marginLeft: 10 }}>{BOARD.lowest}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** STEP 4 — clue photos land on a phone, stacking like a lock screen. */
const Banners: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const Cl = CUE.clues;
  if (!inRange(f, Cl)) return null;
  const L = LAYOUT.banners;
  return (
    <>
      {BANNERS.map((text, i) => {
        const at = Cl.cards[i];
        if (f < at) return null;
        const s = spring({ frame: f - at, fps, config: { damping: 15, stiffness: 180 } });
        const push = Cl.cards.slice(i + 1).reduce((acc, c) => acc + spring({ frame: f - c, fps, config: { damping: 200 }, durationInFrames: 12 }), 0);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: L.left,
              width: L.width,
              top: L.top + push * 150,
              translate: `0px ${((1 - s) * -120).toFixed(2)}px`,
              opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
              display: "flex",
              gap: 22,
              alignItems: "center",
              padding: "20px 24px",
              borderRadius: 30,
              background: "rgba(28,30,34,.94)",
              border: `1px solid ${C.line}`,
              boxShadow: "0 22px 46px rgba(0,0,0,.45)",
              fontFamily: SANS,
            }}
          >
            <div style={{ width: 84, height: 84, borderRadius: 20, background: C.red, flexShrink: 0, display: "grid", placeItems: "center" }}>
              <GameIcon k="cluedo" size={60} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 22, color: C.dim }}>
                <span>Photos</span>
                <span>now</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 36, lineHeight: 1.15, color: C.bone, marginTop: 4 }}>{text}</div>
              <div style={{ width: 230 - i * 40, height: 16, borderRadius: 6, background: "rgba(237,231,218,.22)", marginTop: 10 }} />
            </div>
          </div>
        );
      })}
    </>
  );
};

/**
 * The Astral mark's "ASTRAL" is slate, built for a mid-tone ground: a light
 * edge keeps it legible on ink without recolouring the logo.
 */
const LOGO_EDGE =
  "drop-shadow(0 0 1.5px rgba(237,231,218,1)) drop-shadow(0 0 1.5px rgba(237,231,218,1)) drop-shadow(0 0 1px rgba(237,231,218,.9)) drop-shadow(0 0 16px rgba(237,231,218,.35))";

/** The brand lockup: the name on "Three", then "by" Astral Project × SideQuest Club as each is said. */
const Brand: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const B = CUE.brand;
  if (!inRange(f, B)) return null;
  const t = pop(f, B.title, fps);
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 250, textAlign: "center", fontFamily: SANS, color: C.bone }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 26, marginBottom: 18 }}>
        {[-1, 0, 1].map((d, i) => (
          <div key={i} style={{ rotate: `${d * 12}deg`, opacity: interpolate(pop(f, B.title + i * 2, fps), [0, 0.3], [0, 1], clamp), filter: "drop-shadow(0 8px 14px rgba(0,0,0,.5))" }}>
            <Knife h={120} />
          </div>
        ))}
      </div>
      <div
        style={{
          fontWeight: 900,
          fontSize: 150,
          lineHeight: 0.95,
          letterSpacing: "-0.05em",
          textTransform: "uppercase",
          textShadow: CAP_SHADOW,
          scale: `${(0.8 + 0.2 * t).toFixed(4)}`,
          opacity: interpolate(t, [0, 0.3], [0, 1], clamp),
        }}
      >
        Three Knives <span style={{ background: C.red, borderRadius: 22, padding: "0 0.12em" }}>Out</span>
      </div>
      <div style={{ marginTop: 46, display: "flex", justifyContent: "center", alignItems: "center", gap: 40, minHeight: 170 }}>
        <div style={{ fontWeight: 800, fontSize: 40, color: C.dim, ...rise(f, B.by, fps, 30) }}>{BRAND.by}</div>
        <Img
          src={staticFile(`${ASSET_DIR}/${BRAND.logoA}`)}
          style={{
            height: 74,
            ...rise(f, B.astral, fps, 40),
            filter: LOGO_EDGE,
          }}
        />
        <div style={{ fontWeight: 800, fontSize: 52, color: C.dim, ...rise(f, B.sidequest, fps, 30) }}>×</div>
        <Img src={staticFile(`${ASSET_DIR}/${BRAND.logoB}`)} style={{ height: 170, ...rise(f, B.sidequest, fps, 40) }} />
      </div>
    </div>
  );
};

/** EVENT — Friday · 16 October · Backroom, Anjuna, both logos, and the button. Supplied by the user. */
const Event: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const E = CUE.event;
  if (!inRange(f, E)) return null;
  const btn = pop(f, E.book, fps);
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 150, textAlign: "center", fontFamily: SANS, color: C.bone }}>
      <div style={{ ...rise(f, E.from, fps, 30), display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
        <span style={{ display: "inline-block", background: C.red, borderRadius: 999, padding: "10px 24px 9px", fontWeight: 800, fontSize: 26, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {EVENT.kicker}
        </span>
        <span style={{ fontWeight: 900, fontSize: 40, letterSpacing: "-0.03em", textTransform: "uppercase", textShadow: CAP_SHADOW }}>{BRAND.name}</span>
      </div>
      <div style={{ ...rise(f, E.friday, fps, 50), marginTop: 30, fontWeight: 800, fontSize: 84, lineHeight: 1, letterSpacing: "-0.03em", textShadow: CAP_SHADOW }}>{EVENT.day}</div>
      <div style={{ ...rise(f, E.date, fps, 60), fontWeight: 900, fontSize: 200, lineHeight: 1.0, letterSpacing: "-0.05em", textShadow: CAP_SHADOW }}>{EVENT.date}</div>
      <div
        style={{
          ...rise(f, E.place, fps, 50),
          marginTop: 8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          fontWeight: 800,
          fontSize: 68,
          letterSpacing: "-0.03em",
          textShadow: CAP_SHADOW,
        }}
      >
        <svg width={48} height={62} viewBox="0 0 50 64">
          <path d="M25 60 C25 60 4 36 4 22 A21 21 0 0 1 46 22 C46 36 25 60 25 60 Z" fill={C.red} />
          <circle cx={25} cy={22} r={8} fill={C.bone} />
        </svg>
        {EVENT.place}
      </div>
      <div style={{ ...rise(f, E.place + 8, fps, 30), marginTop: 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 40 }}>
        <Img
          src={staticFile(`${ASSET_DIR}/${EVENT.logoA}`)}
          style={{ height: 60, filter: LOGO_EDGE }}
        />
        <span style={{ fontWeight: 800, fontSize: 40, color: C.dim }}>×</span>
        <Img src={staticFile(`${ASSET_DIR}/${EVENT.logoB}`)} style={{ height: 128 }} />
      </div>
      <div
        style={{
          marginTop: 40,
          display: "inline-flex",
          alignItems: "center",
          gap: 18,
          background: C.red,
          borderRadius: 999,
          padding: "22px 56px",
          fontWeight: 900,
          fontSize: 54,
          letterSpacing: "-0.03em",
          boxShadow: "0 18px 44px rgba(224,49,39,.35), 0 14px 28px rgba(0,0,0,.45)",
          opacity: interpolate(btn, [0, 0.3], [0, 1], clamp),
          scale: `${(0.8 + 0.2 * btn).toFixed(4)}`,
        }}
      >
        {EVENT.cta}
        <svg width={40} height={30} viewBox="0 0 50 36">
          <path d="M2 18 H42 M28 4 L44 18 L28 32" fill="none" stroke={C.bone} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

// ================================================================== layers ===

export const Layers: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = STEPS.find((s) => inRange(f, s));
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <LayerTrack />
      <ShotDressing f={f} />

      {/* The cards sit on a darker plate than the footage's own grade. */}
      {f >= CUE.brand.from ? <AbsoluteFill style={{ background: "rgba(12,13,15,.45)" }} /> : null}
      <GameTiles f={f} fps={fps} />
      <Knives f={f} fps={fps} from={CUE.killers.from} to={CUE.killers.to} hit={CUE.killers.hit} high />
      <Knives f={f} fps={fps} from={CUE.title.from} to={CUE.title.to} hit={CUE.title.hit} spread={200} />
      <RolePhone f={f} fps={fps} />
      <Target f={f} />
      <GameRow f={f} fps={fps} />
      <Board f={f} fps={fps} />
      <Banners f={f} fps={fps} />
      <Knives f={f} fps={fps} from={CUE.knives.from} to={CUE.knives.to} hit={CUE.knives.hit} spread={200} />
      <Brand f={f} fps={fps} />
      <Event f={f} fps={fps} />
      {inRange(f, { from: CUE.die, to: CUE.die + 14 }) ? <Flash frame={f} at={CUE.die} color={C.red} peak={0.4} tau={5} /> : null}
      {inRange(f, { from: CUE.event.from, to: CUE.event.from + 12 }) ? <Flash frame={f} at={CUE.event.from} color={C.bone} peak={0.2} tau={3} /> : null}

      {step ? <StepChip frame={f - step.from} step={step.step} first={step.step === 1} /> : null}
      <Captions frame={f} caps={CAPTIONS} fps={fps} />
      <Film frame={f} />
    </AbsoluteFill>
  );
};
