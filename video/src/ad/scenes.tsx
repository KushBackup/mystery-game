/**
 * scenes.tsx — the eight shots of the 15s Meta promo.
 *
 *   HOOK      0–60   "SOMEONE AT THIS PARTY IS THE KILLER." — topic in 2s
 *   IDENTITY  60–135 You get a character, and a secret that rips open
 *   RIDDLE    135–180  montage 1/3 — crack a riddle, a clue unseals
 *   TRADE     180–225  montage 2/3 — a code flies phone to phone
 *   BOARD     225–270  montage 3/3 — pins, thread, a circled suspect
 *   VOTE      270–330 Seven rounds, a live tally, the lead changes hands
 *   TWIST     330–375 Silence. "THE KILLER COULD BE YOU."
 *   END       375–450 The brand, one line, one CTA — holds ~2s clean
 *
 * FACT DISCIPLINE: everything claimed is true of the shipped game — 7 rounds
 * (00–06), played in the browser on each guest's phone (a PWA, nothing to
 * install), riddles that unseal clues, spoken codes that unseal the same clue
 * on another phone, a vote every round, and a killer team drawn from the
 * players. Nothing on screen is from the live case: the riddle is a real,
 * case-neutral deck entry; the code word, character and card lines are
 * invented; suspect names are redaction bars. No price, date, rating or
 * attendance claim appears and none may be added.
 *
 * All frame numbers are ABSOLUTE and come from ./timeline.ts, which the
 * soundtrack also reads.
 */

import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { BOARD, END, HOOK, IDENTITY, RIDDLE, SCENE, TRADE, TWIST, VOTE } from "./timeline";
import {
  Camera,
  Ghost,
  Kicker,
  MaskLine,
  Padlock,
  Phone,
  Redact,
  SAFE,
  Stage,
  Tag,
  WhipIn,
  disp,
  glitch,
  impact,
  mono,
  prog,
  scramble,
  useAbs,
} from "./kit";
import { useSafeZone } from "./safeZone";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const X = SAFE.left;
const INNER = SAFE.right - SAFE.left;
/**
 * Montage headlines start rising this many frames BEFORE their cut, so the cut
 * frame already shows type mid-reveal. Starting on the cut left 1-3 near-empty
 * frames that read as a dropout in the encode.
 */
const LEAD = 4;

/** Critically damped landing (spring, damping 200) from an absolute frame. */
const useLand = () => {
  const { fps } = useVideoConfig();
  return (frame: number, at: number, dur = 20) =>
    spring({ fps, frame: frame - at, config: { damping: 200 }, durationInFrames: dur });
};

/** A montage headline: mono kicker, a bone verb, a red noun. */
const ShotHead: React.FC<{ frame: number; at: number; kicker: string; verb: string; noun: string }> = ({
  frame,
  at,
  kicker,
  verb,
  noun,
}) => (
  <div style={{ position: "absolute", left: X, top: 286 }}>
    <MaskLine frame={frame} at={at} dur={7}>
      <Kicker size={23}>{kicker}</Kicker>
    </MaskLine>
    <div style={{ height: 22 }} />
    <MaskLine frame={frame} at={at + 1} dur={8}>
      <div style={disp(158)}>{verb}</div>
    </MaskLine>
    <MaskLine frame={frame} at={at + 4} dur={8}>
      <div style={disp(158, C.red)}>{noun}</div>
    </MaskLine>
  </div>
);

// =================================================================== HOOK ===

export const Hook: React.FC = () => {
  const f = useAbs(SCENE.hook[0]);
  const safe = useSafeZone();
  const lines = ["SOMEONE", "AT THIS", "PARTY", "IS THE"];
  const hits = [...HOOK.words.map((w) => Math.max(0, w + 1)), HOOK.killerIn];

  return (
    <Stage frame={f} lampY={760} safeZone={safe}>
      <Camera frame={f} from={0} to={SCENE.hook[1]} push={0.07} hits={hits} kick={0.028} origin="30% 60%">
        <Ghost frame={f} from={0} word="Whodunit" />
        <div style={{ position: "absolute", left: X, top: 292 }}>
          <MaskLine frame={f} at={-5} dur={8}>
            <Kicker size={24}>Tonight&apos;s case · Classified</Kicker>
          </MaskLine>
        </div>

        <div style={{ position: "absolute", left: X - 6, top: 384 }}>
          {lines.map((l, i) => (
            <MaskLine key={l} frame={f} at={HOOK.words[i]} dur={8}>
              <div style={disp(174)}>{l}</div>
            </MaskLine>
          ))}
          <div style={{ marginTop: 14 }}>
            <Redact frame={f} on={HOOK.killerIn} open={HOOK.killerOpen} dur={11} pad="-1% -2% 1% -2%">
              <span style={{ ...disp(292, C.red), display: "inline-block", ...glitch(f, HOOK.killerOpen + 11, 4) }}>
                KILLER.
              </span>
            </Redact>
          </div>
        </div>
      </Camera>
    </Stage>
  );
};

// =============================================================== IDENTITY ===

export const Identity: React.FC = () => {
  const f = useAbs(SCENE.identity[0]);
  const safe = useSafeZone();
  const land = useLand();
  const s = land(f, IDENTITY.phoneIn, 24);
  const k = 560 / 520;
  const secretLit = prog(f, IDENTITY.secretOpen + 6, 8);

  return (
    <Stage frame={f} lampY={900} safeZone={safe}>
      <Camera frame={f} from={SCENE.identity[0]} to={SCENE.identity[1]} push={0.05} hits={[IDENTITY.secretOpen]} kick={0.02} origin="50% 62%">
        <div style={{ position: "absolute", left: X, top: 286 }}>
          <MaskLine frame={f} at={SCENE.identity[0]} out={IDENTITY.headSwap} dur={8}>
            <div style={disp(128)}>You&apos;re someone</div>
          </MaskLine>
          <MaskLine frame={f} at={SCENE.identity[0] + 3} out={IDENTITY.headSwap} dur={8}>
            <div style={disp(128)}>else tonight.</div>
          </MaskLine>
        </div>
        <div style={{ position: "absolute", left: X, top: 286 }}>
          <MaskLine frame={f} at={IDENTITY.headSwap + 6} dur={8}>
            <div style={disp(128)}>With a</div>
          </MaskLine>
          <MaskLine frame={f} at={IDENTITY.headSwap + 9} dur={8}>
            <div style={disp(128, C.red)}>secret.</div>
          </MaskLine>
        </div>

        <Phone
          width={560}
          style={{
            left: (1080 - 560) / 2,
            top: 548,
            opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
            translate: `0px ${((1 - s) * 620).toFixed(2)}px`,
            rotate: `${(-9 + 6.5 * s).toFixed(3)}deg`,
          }}
        >
          <div style={{ padding: `${86 * k}px ${40 * k}px 0` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={mono(17, C.dim2)}>Astral · Round 00</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    background: C.red,
                    opacity: 0.55 + 0.45 * Math.sin(f / 4),
                  }}
                />
                <span style={mono(17, C.dim)}>Live</span>
              </span>
            </div>
            <div style={{ height: 1, background: C.line, margin: "22px 0 26px" }} />
            <div style={mono(20, C.red)}>Your identity</div>
            <div style={{ marginTop: 14 }}>
              <Redact frame={f} open={IDENTITY.nameOpen} dur={9}>
                <span style={disp(86)}>The Dealmaker</span>
              </Redact>
            </div>

            <div style={{ marginTop: 34, borderTop: `1px solid ${C.line}`, paddingTop: 18 }}>
              <div style={mono(16, C.dim2)}>Alibi</div>
              <div style={{ fontFamily: F.read, fontStyle: "italic", fontWeight: 300, fontSize: 31, color: C.bone, marginTop: 8, lineHeight: 1.3 }}>
                In the garden all evening.
              </div>
            </div>

            <div
              style={{
                marginTop: 24,
                borderTop: `1px solid ${C.line}`,
                paddingTop: 18,
                paddingLeft: 18 * secretLit,
                borderLeft: `${(5 * secretLit).toFixed(2)}px solid ${C.red}`,
              }}
            >
              <div style={mono(16, secretLit > 0.5 ? C.red : C.dim2)}>Secret</div>
              <div style={{ marginTop: 10 }}>
                <Redact frame={f} open={IDENTITY.secretOpen} dur={11} pad="-4% -2%">
                  <span style={{ fontFamily: F.read, fontStyle: "italic", fontWeight: 400, fontSize: 33, color: C.bone, lineHeight: 1.3, display: "inline-block" }}>
                    You were upstairs when
                    <br />
                    the lights went out.
                  </span>
                </Redact>
              </div>
            </div>
          </div>
        </Phone>
      </Camera>
    </Stage>
  );
};

// ================================================================= RIDDLE ===

export const Riddle: React.FC = () => {
  const f = useAbs(SCENE.riddle[0]);
  const safe = useSafeZone();
  const land = useLand();
  const s = land(f, SCENE.riddle[0] + 2, 18);
  const typed = RIDDLE.typeAt.filter((t) => f >= t).length;
  const solved = f >= RIDDLE.unlock;
  const stamp = prog(f, RIDDLE.unlock + 1, 8, Easing.bezier(0.34, 1.7, 0.64, 1));
  const caretOn = !solved && Math.floor(f / 4) % 2 === 0;

  return (
    <Stage frame={f} lampY={900} safeZone={safe}>
      <WhipIn frame={f} at={SCENE.riddle[0]}>
        <Camera frame={f} from={SCENE.riddle[0]} to={SCENE.riddle[1]} push={0.04} hits={[RIDDLE.unlock]} kick={0.02}>
          <Ghost frame={f} from={SCENE.riddle[0]} word="Riddle" top={1300} dir={-1} />
          <ShotHead frame={f} at={SCENE.riddle[0] - LEAD} kicker="Solve it · earn a clue" verb="Crack" noun="riddles." />

          <div
            style={{
              position: "absolute",
              left: 84,
              top: 700,
              width: 912,
              background: C.bone,
              padding: "40px 44px 44px",
              boxShadow: "0 40px 90px rgba(0,0,0,.7)",
              transformOrigin: "50% 0%",
              opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
              translate: `0px ${((1 - s) * 160).toFixed(2)}px`,
              rotate: `${(-7 + 5.6 * s).toFixed(3)}deg`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `3px solid ${C.ink}`, paddingBottom: 16 }}>
              <span style={mono(21, C.redDeep)}>The riddle lock · Ask</span>
              <Padlock frame={f} open={RIDDLE.unlock} size={40} color={solved ? C.redDeep : C.ink} />
            </div>
            <div style={{ fontFamily: F.read, fontStyle: "italic", fontWeight: 300, fontSize: 45, lineHeight: 1.28, color: C.ink, marginTop: 24 }}>
              I am tall when I am young, and short when I am old. What am I?
            </div>
            <div
              style={{
                marginTop: 30,
                height: 128,
                border: `4px solid ${solved ? C.redDeep : C.ink}`,
                display: "flex",
                alignItems: "center",
                padding: "0 28px",
                gap: 6,
              }}
            >
              <span style={{ ...disp(104, solved ? C.redDeep : C.ink), letterSpacing: "0.04em" }}>
                {RIDDLE.answer.slice(0, typed)}
              </span>
              <span style={{ width: 8, height: 84, background: C.red, opacity: caretOn ? 1 : 0 }} />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              right: 110,
              top: 1150,
              opacity: stamp > 0 ? 1 : 0,
              scale: `${(1.5 - 0.5 * stamp).toFixed(4)}`,
              rotate: "-4deg",
            }}
          >
            <Tag size={30}>Clue unsealed</Tag>
          </div>
        </Camera>
      </WhipIn>
    </Stage>
  );
};

// ================================================================== TRADE ===

/** Cubic bezier point + tangent, so the chip can ride the thread exactly. */
const bez = (t: number, p: number[][]) => {
  const u = 1 - t;
  const pt = [0, 1].map((a) => u * u * u * p[0][a] + 3 * u * u * t * p[1][a] + 3 * u * t * t * p[2][a] + t * t * t * p[3][a]);
  const d = [0, 1].map(
    (a) => 3 * u * u * (p[1][a] - p[0][a]) + 6 * u * t * (p[2][a] - p[1][a]) + 3 * t * t * (p[3][a] - p[2][a]),
  );
  return { x: pt[0], y: pt[1], angle: (Math.atan2(d[1], d[0]) * 180) / Math.PI };
};

const THREAD = [
  [262, 912],
  [360, 560],
  [760, 540],
  [838, 952],
];

export const Trade: React.FC = () => {
  const f = useAbs(SCENE.trade[0]);
  const safe = useSafeZone();
  const land = useLand();
  const a = land(f, SCENE.trade[0] + 1, 18);
  const b = land(f, SCENE.trade[0] + 4, 18);
  const draw = prog(f, TRADE.scrambleFrom + 6, 12, Easing.bezier(0.45, 0, 0.2, 1));
  const flyT = interpolate(f, [TRADE.flyFrom, TRADE.flyTo], [0, 1], { ...clamp, easing: Easing.bezier(0.55, 0, 0.25, 1) });
  const flyPrev = interpolate(f - 1, [TRADE.flyFrom, TRADE.flyTo], [0, 1], { ...clamp, easing: Easing.bezier(0.55, 0, 0.25, 1) });
  const flying = f >= TRADE.flyFrom && f < TRADE.flyTo;
  const chip = bez(flyT, THREAD);
  const prev = bez(flyPrev, THREAD);
  const speed = Math.hypot(chip.x - prev.x, chip.y - prev.y);
  const landed = f >= TRADE.land;
  const unseal = prog(f, TRADE.land + 2, 8, Easing.bezier(0.34, 1.7, 0.64, 1));
  const LEN = 900;

  return (
    <Stage frame={f} lampY={950} safeZone={safe}>
      <WhipIn frame={f} at={SCENE.trade[0]} dir={-1}>
        <Camera frame={f} from={SCENE.trade[0]} to={SCENE.trade[1]} push={0.035} hits={[TRADE.land]} kick={0.02}>
          <ShotHead frame={f} at={SCENE.trade[0] - LEAD} kicker="Say it out loud" verb="Trade" noun="codes." />

          {/* Phone A — the solver */}
          <Phone
            width={372}
            style={{
              left: 70,
              top: 736,
              opacity: interpolate(a, [0, 0.3], [0, 1], clamp),
              translate: `${((1 - a) * -360).toFixed(2)}px 0px`,
              rotate: `${(-7 * a - 14 * (1 - a)).toFixed(3)}deg`,
            }}
          >
            <div style={{ padding: "74px 30px 0" }}>
              <div style={mono(15, C.dim2)}>You solved it</div>
              <div style={{ height: 1, background: C.line, margin: "16px 0 18px" }} />
              <div style={mono(16, C.red)}>Clue code</div>
              <div style={{ ...disp(70), marginTop: 10, letterSpacing: "0.02em" }}>
                {scramble(TRADE.code, f, TRADE.scrambleFrom, TRADE.scrambleTo, "code")}
              </div>
              <div style={{ fontFamily: F.read, fontStyle: "italic", fontWeight: 300, fontSize: 23, color: C.dim, marginTop: 16, lineHeight: 1.35 }}>
                Read it aloud. Anyone can enter it.
              </div>
            </div>
          </Phone>

          {/* Phone B — across the room */}
          <Phone
            width={372}
            style={{
              left: 640,
              top: 790,
              opacity: interpolate(b, [0, 0.3], [0, 1], clamp),
              translate: `${((1 - b) * 360).toFixed(2)}px 0px`,
              rotate: `${(6 * b + 14 * (1 - b)).toFixed(3)}deg`,
            }}
          >
            <div style={{ padding: "74px 30px 0" }}>
              <div style={mono(15, C.dim2)}>Across the room</div>
              <div style={{ height: 1, background: C.line, margin: "16px 0 18px" }} />
              <div style={mono(16, C.dim)}>Enter a code</div>
              <div
                style={{
                  marginTop: 12,
                  height: 84,
                  border: `2px solid ${landed ? C.red : C.line}`,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                }}
              >
                <span style={{ ...disp(56), letterSpacing: "0.02em" }}>{landed ? TRADE.code : ""}</span>
              </div>
              <div style={{ marginTop: 18, opacity: unseal > 0 ? 1 : 0, scale: `${(1.4 - 0.4 * unseal).toFixed(4)}`, transformOrigin: "0% 50%" }}>
                <Tag size={18}>Unsealed</Tag>
              </div>
            </div>
          </Phone>

          {/* The red thread, drawn, then ridden by the code. */}
          <AbsoluteFill style={{ pointerEvents: "none" }}>
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
              <path
                d={`M ${THREAD[0].join(" ")} C ${THREAD[1].join(" ")}, ${THREAD[2].join(" ")}, ${THREAD[3].join(" ")}`}
                fill="none"
                stroke={C.red}
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={LEN}
                strokeDashoffset={LEN * (1 - draw)}
                style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,.6))" }}
              />
              <circle cx={THREAD[0][0]} cy={THREAD[0][1]} r={9 * draw} fill={C.red} />
              <circle cx={THREAD[3][0]} cy={THREAD[3][1]} r={9 * prog(f, TRADE.land, 4)} fill={C.red} />
            </svg>
          </AbsoluteFill>
          {flying ? (
            <div
              style={{
                position: "absolute",
                left: chip.x,
                top: chip.y,
                translate: "-50% -50%",
                rotate: `${(chip.angle * 0.35).toFixed(2)}deg`,
                scale: `${(1 + 0.25 * Math.sin(Math.PI * flyT)).toFixed(4)}`,
                filter: `blur(${Math.min(6, speed / 9).toFixed(2)}px)`,
              }}
            >
              <Tag size={30} style={{ boxShadow: "0 18px 30px rgba(0,0,0,.55)" }}>
                {TRADE.code}
              </Tag>
            </div>
          ) : null}
        </Camera>
      </WhipIn>
    </Stage>
  );
};

// ================================================================== BOARD ===

type Pin = { x: number; y: number; rot: number; head: string; body?: string; suspect?: boolean };
const PINS: Pin[] = [
  { x: 70, y: 690, rot: -2.6, head: "Motive", body: "Deep in debt. Hiding it well." },
  { x: 566, y: 670, rot: 2.2, head: "Alibi", body: "Nobody can place her after nine." },
  { x: 84, y: 972, rot: 1.6, head: "Suspect", suspect: true },
  { x: 560, y: 990, rot: -2, head: "Evidence", body: "A torn receipt, two drinks." },
];
const CARD_W = 440;

export const Board: React.FC = () => {
  const f = useAbs(SCENE.board[0]);
  const safe = useSafeZone();
  const land = useLand();
  const pinPts = PINS.map((p) => [p.x + CARD_W / 2, p.y + 2]);
  const order = [2, 0, 1, 3, 2];
  const threadD = order.map((i, n) => `${n === 0 ? "M" : "L"} ${pinPts[i][0]} ${pinPts[i][1]}`).join(" ");
  const threadDraw = prog(f, BOARD.pins[3] + 4, 12, Easing.bezier(0.45, 0, 0.2, 1));
  const circle = prog(f, BOARD.circle, 11, Easing.bezier(0.5, 0, 0.3, 1));
  const THREAD_LEN = 2200;
  const CIRCLE_LEN = 1500;

  return (
    <Stage frame={f} lampY={950} safeZone={safe}>
      <WhipIn frame={f} at={SCENE.board[0]}>
        <Camera frame={f} from={SCENE.board[0]} to={SCENE.board[1]} push={0.045} hits={BOARD.pins.map((p) => p + 7)} kick={0.008}>
          <Ghost frame={f} from={SCENE.board[0]} word="Evidence" top={1300} />
          <ShotHead frame={f} at={SCENE.board[0] - LEAD} kicker="Motives · alibis · evidence" verb="Build" noun="the case." />

          {PINS.map((p, i) => {
            const s = land(f, BOARD.pins[i] + 3, 16);
            const pin = prog(f, BOARD.pins[i], 5);
            return (
              <div key={p.head} style={{ position: "absolute", left: p.x, top: p.y, width: CARD_W }}>
                <div
                  style={{
                    background: p.suspect ? C.bone2 : C.bone,
                    padding: "34px 30px 30px",
                    minHeight: 222,
                    boxShadow: "0 34px 70px rgba(0,0,0,.68)",
                    transformOrigin: "50% 0%",
                    opacity: interpolate(s, [0, 0.35], [0, 1], clamp),
                    translate: `0px ${((1 - s) * -60).toFixed(2)}px`,
                    rotate: `${(p.rot + (p.rot > 0 ? 7 : -7) * (1 - s)).toFixed(3)}deg`,
                  }}
                >
                  <div style={{ ...mono(18, C.redDeep), borderBottom: `2px solid ${C.ink}`, paddingBottom: 12, marginBottom: 16 }}>
                    {p.head}
                  </div>
                  {p.suspect ? (
                    <>
                      <div style={{ width: 300, height: 64, background: C.red, marginTop: 6 }} />
                      <div style={{ ...mono(16, C.boneMeta, 0.16), marginTop: 18 }}>Person of interest</div>
                    </>
                  ) : (
                    <div style={{ fontFamily: F.read, fontStyle: "italic", fontWeight: 300, fontSize: 36, lineHeight: 1.25, color: C.ink }}>
                      {p.body}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: CARD_W / 2 - 14,
                    top: -12,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    background: C.red,
                    opacity: pin,
                    scale: `${(0.3 + 0.7 * pin).toFixed(3)}`,
                    boxShadow: "0 6px 10px rgba(0,0,0,.6), inset 0 -4px 6px rgba(0,0,0,.32)",
                    zIndex: 2,
                  }}
                />
              </div>
            );
          })}

          <AbsoluteFill style={{ pointerEvents: "none" }}>
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
              <path
                d={threadD}
                fill="none"
                stroke={C.red}
                strokeWidth={4}
                strokeLinejoin="round"
                strokeDasharray={THREAD_LEN}
                strokeDashoffset={THREAD_LEN * (1 - threadDraw)}
                style={{ filter: "drop-shadow(0 5px 8px rgba(0,0,0,.55))" }}
              />
              {/* The marker loop round the suspect — hand-drawn, overshooting its start. */}
              <path
                d="M 560 1030 C 590 930, 330 900, 230 918 C 90 944, 40 1080, 110 1170 C 190 1262, 470 1250, 560 1160 C 610 1110, 600 1020, 520 975"
                fill="none"
                stroke={C.red}
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray={CIRCLE_LEN}
                strokeDashoffset={CIRCLE_LEN * (1 - circle)}
              />
            </svg>
          </AbsoluteFill>
        </Camera>
      </WhipIn>
    </Stage>
  );
};

// =================================================================== VOTE ===

const ROWS = [
  { key: "a", name: 290, vals: [0, 9, 11] },
  { key: "b", name: 360, vals: [0, 5, 14] },
  { key: "c", name: 250, vals: [0, 4, 6] },
  { key: "d", name: 320, vals: [0, 2, 3] },
];
const MAX = 16;

export const Vote: React.FC = () => {
  const f = useAbs(SCENE.vote[0]);
  const safe = useSafeZone();
  const land = useLand();
  const times = [VOTE.barsFrom, VOTE.overtake, VOTE.overtake + 14];
  const swap = prog(f, VOTE.overtake, 9, Easing.bezier(0.65, 0, 0.35, 1));
  const leaderB = f >= VOTE.overtake + 2;
  const newLead = prog(f, VOTE.overtake + 4, 8, Easing.bezier(0.34, 1.7, 0.64, 1));
  const ROW_H = 104;
  const panel = land(f, SCENE.vote[0] + 6, 18);

  return (
    <Stage frame={f} lampY={1000} safeZone={safe}>
      <Camera frame={f} from={SCENE.vote[0]} to={SCENE.vote[1]} push={0.04} hits={[VOTE.overtake]} kick={0.015}>
        <Ghost frame={f} from={SCENE.vote[0]} word="Verdict" top={1320} dir={-1} />
        {/* Round rail — seven rounds, 00 to 06 */}
        <div style={{ position: "absolute", left: X, top: 290, width: INNER, display: "flex", gap: 10 }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const fill = prog(f, VOTE.railFrom + i * 3, 6);
            const current = i === 5;
            return (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: 10, background: C.line, position: "relative", overflow: "hidden" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: C.red,
                      transformOrigin: "left center",
                      scale: `${(i <= 5 ? fill : 0).toFixed(4)} 1`,
                      opacity: current ? 0.6 + 0.4 * Math.sin(f / 3) : 1,
                    }}
                  />
                </div>
                <div style={{ ...disp(34, current ? C.amber : C.dim2, 700), marginTop: 12 }}>{`0${i}`}</div>
              </div>
            );
          })}
        </div>

        <div style={{ position: "absolute", left: X, top: 392 }}>
          <MaskLine frame={f} at={SCENE.vote[0] - LEAD} dur={8}>
            <div style={disp(158)}>Vote every</div>
          </MaskLine>
          <MaskLine frame={f} at={SCENE.vote[0]} dur={8}>
            <div style={disp(158, C.red)}>round.</div>
          </MaskLine>
        </div>

        <div
          style={{
            position: "absolute",
            left: X,
            top: 700,
            width: INNER,
            background: C.ink2,
            border: `1px solid ${C.line}`,
            borderTop: `4px solid ${C.red}`,
            padding: "26px 34px 8px",
            boxShadow: "0 40px 80px rgba(0,0,0,.6)",
            opacity: interpolate(panel, [0, 0.35], [0, 1], clamp),
            translate: `0px ${((1 - panel) * 80).toFixed(2)}px`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={mono(20, C.dim)}>Live tally</span>
            <span style={mono(20, C.dim2)}>Who did it?</span>
          </div>
          <div style={{ position: "relative", height: ROW_H * ROWS.length }}>
            {ROWS.map((r, i) => {
              const v = interpolate(f, times, r.vals, { ...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1) });
              // A and B trade places when B takes the lead.
              const slot = r.key === "a" ? i + swap : r.key === "b" ? i - swap : i;
              const lead = (r.key === "b" && leaderB) || (r.key === "a" && !leaderB);
              return (
                <div
                  key={r.key}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: slot * ROW_H,
                    height: ROW_H - 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: r.name, height: 30, background: lead ? C.bone : "rgba(237,231,218,.34)" }} />
                      {r.key === "b" && newLead > 0 ? (
                        <span style={{ scale: `${(1.4 - 0.4 * newLead).toFixed(4)}`, opacity: newLead > 0 ? 1 : 0, transformOrigin: "0% 50%" }}>
                          <Tag size={17}>New leader</Tag>
                        </span>
                      ) : null}
                    </div>
                    <div style={{ height: 16, background: C.line2, marginTop: 16 }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${((v / MAX) * 100).toFixed(2)}%`,
                          background: lead ? C.red : "rgba(237,231,218,.45)",
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ ...disp(84, C.amber), width: 96, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {Math.round(v)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Camera>
    </Stage>
  );
};

// ================================================================== TWIST ===

export const Twist: React.FC = () => {
  const f = useAbs(SCENE.twist[0]);
  const safe = useSafeZone();
  const sub = prog(f, TWIST.youOpen + 6, 9);

  return (
    <Stage frame={f} lamp={f >= TWIST.youOpen ? "red" : "none"} lampY={900} safeZone={safe}>
      <Camera frame={f} from={SCENE.twist[0]} to={SCENE.twist[1]} push={0.06} hits={[TWIST.youIn, TWIST.youOpen]} kick={0.03} origin="40% 55%">
        <Ghost frame={f} from={SCENE.twist[0]} word="Guilty" top={1330} />
        <div style={{ position: "absolute", left: X, top: 292 }}>
          <MaskLine frame={f} at={TWIST.line1} dur={7}>
            <Kicker size={24}>Round 06 · The reveal</Kicker>
          </MaskLine>
        </div>
        <div style={{ position: "absolute", left: X - 4, top: 372 }}>
          <MaskLine frame={f} at={TWIST.line1} dur={8}>
            <div style={disp(166)}>The killer</div>
          </MaskLine>
          <MaskLine frame={f} at={TWIST.line2} dur={8}>
            <div style={disp(166)}>could be</div>
          </MaskLine>
          <div style={{ marginTop: 30 }}>
            <Redact frame={f} on={TWIST.youIn} open={TWIST.youOpen} dur={9} pad="0% -2% 2% -5%">
              <span style={{ ...disp(430, C.red), display: "inline-block", ...glitch(f, TWIST.youOpen + 9, 4) }}>You.</span>
            </Redact>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: X,
            top: 1150,
            opacity: sub,
            translate: `0px ${((1 - sub) * 20).toFixed(2)}px`,
          }}
        >
          <div style={mono(24, C.dim)}>Every guest is a suspect.</div>
          <div style={{ ...mono(24, C.bone), marginTop: 10 }}>Some of them did it.</div>
        </div>
      </Camera>
    </Stage>
  );
};

// ==================================================================== END ===

export const End: React.FC = () => {
  const f = useAbs(SCENE.end[0]);
  const safe = useSafeZone();
  const land = useLand();
  const rule = prog(f, END.line - 2, 14);
  const line = prog(f, END.line, 12);
  const cta = land(f, END.cta, 20);
  const chips = prog(f, END.line + 5, 12);
  // Idle life once everything has landed: the arrow nudges, never the words.
  const nudge = f > END.cta + 16 ? Math.max(0, Math.sin((f - END.cta - 16) / 4.5)) * 10 : 0;
  const boomKick = impact(f, END.wordmark, 5);

  return (
    <Stage frame={f} lamp="both" lampY={760} safeZone={safe}>
      <Camera frame={f} from={SCENE.end[0]} to={SCENE.end[1]} push={0.025} hits={[END.wordmark]} kick={0.025} origin="50% 40%">
        <Ghost frame={f} from={SCENE.end[0]} word="Trust no one." top={1330} dir={-1} />
        <div style={{ position: "absolute", left: X, top: 290 }}>
          <MaskLine frame={f} at={END.kicker} dur={8}>
            <Kicker size={26} color={C.bone}>Astral Project&apos;s</Kicker>
          </MaskLine>
        </div>
        <div style={{ position: "absolute", left: X - 6, top: 350 }}>
          <MaskLine frame={f} at={END.wordmark} dur={9}>
            <div style={disp(236)}>Murder</div>
          </MaskLine>
          <MaskLine frame={f} at={END.wordmark + 3} dur={9}>
            <div style={{ ...disp(236, C.red), textShadow: boomKick > 0.05 ? `0 0 ${(40 * boomKick).toFixed(1)}px rgba(224,49,39,.6)` : undefined }}>
              Mystery
            </div>
          </MaskLine>
          <MaskLine frame={f} at={END.wordmark + 6} dur={9} style={{ marginTop: 18 }}>
            <div style={{ ...mono(46, C.bone, 0.56), fontWeight: 500 }}>Experience</div>
          </MaskLine>
        </div>

        <div
          style={{
            position: "absolute",
            left: X,
            top: 860,
            width: INNER,
            height: 4,
            background: C.red,
            transformOrigin: "left center",
            scale: `${rule.toFixed(4)} 1`,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: X,
            top: 894,
            width: INNER,
            fontFamily: F.read,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: 46,
            lineHeight: 1.26,
            color: C.bone,
            opacity: line,
            translate: `0px ${((1 - line) * 24).toFixed(2)}px`,
          }}
        >
          A live murder-mystery party,
          <br />
          played on everyone&apos;s phones.
        </div>

        <div
          style={{
            position: "absolute",
            left: X,
            top: 1036,
            display: "flex",
            alignItems: "baseline",
            gap: 26,
            opacity: chips,
            translate: `0px ${((1 - chips) * 18).toFixed(2)}px`,
          }}
        >
          <span style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={disp(54, C.amber)}>7</span>
            <span style={mono(22, C.dim)}>Rounds</span>
          </span>
          <span style={{ width: 8, height: 8, background: C.red, alignSelf: "center" }} />
          <span style={mono(22, C.dim)}>No app to install</span>
        </div>

        <div
          style={{
            position: "absolute",
            left: X,
            top: 1112,
            width: INNER,
            height: 118,
            background: C.bone,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
            boxShadow: "0 30px 60px rgba(0,0,0,.6)",
            opacity: interpolate(cta, [0, 0.3], [0, 1], clamp),
            translate: `0px ${((1 - cta) * 50).toFixed(2)}px`,
            scale: `${(0.94 + 0.06 * cta).toFixed(4)}`,
          }}
        >
          <span style={{ ...disp(66, C.ink), lineHeight: 1 }}>Book your night</span>
          <svg width={64} height={40} viewBox="0 0 64 40" style={{ translate: `${nudge.toFixed(2)}px 0px` }}>
            <path d="M2 20 H58 M40 3 L60 20 L40 37" fill="none" stroke={C.red} strokeWidth={7} strokeLinecap="square" />
          </svg>
        </div>
      </Camera>
    </Stage>
  );
};
