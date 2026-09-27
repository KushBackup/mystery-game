/**
 * scenes.tsx — the Killers Night reel's layers and its overlay library.
 *
 * Built as independent tracks, timed to the voiceover (./timeline.ts), bottom to top:
 *
 *   ShotTrack   the footage, one <Sequence> per shot, hard cuts; two shot effects
 *               (the night's SLASH, the GHOST echo) live here because they need
 *               the picture itself
 *   Overlays    reticles, the arrival phone, night, the dawn grid, clue banners,
 *               marker loops, the round-table tally, the reveal card, the twist,
 *               the CTA and the event card
 *   StepChip    "How it works · n/5" across the five steps
 *   Captions    the on-screen script, each word popping as it is spoken
 *   Film        grain, vignette, the thin bands under the platform UI
 *
 * Every overlay frame is ABSOLUTE; every cue comes from CUE in ./timeline.ts.
 * Graphics that point AT something in the footage (reticles, loops) are drawn
 * inside that shot's lens (InLens), so they ride the same push as the picture.
 *
 * Layout law (Meta Reels, 2026): words live inside x 72–1008, y 270–1240.
 * Below 1240 only picture and decoration (a phone's lower half, a loop on shoes).
 *
 * FACT DISCIPLINE — quiz questions, roles and clue lines are the game's own
 * (src/data/); every name is a redaction bar; the event card says only what
 * the user supplied.
 */

import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ASSET_DIR, C, F } from "./theme";
import { Phone, glitch, impact, prog } from "./fx";
import { CAP_SHADOW, Captions, Film, Flash, INNER, Photo, Rays, SANS, Shot, StepChip, X } from "./kit";
import { BRAND, CLUES, DAWN, EVENT, QUIZ, REVEAL, ROLES, TALLY } from "./content";
import { CAPTIONS, CUE, LAYOUT, SHOTS, STEPS } from "./timeline";

const TWIST_CARD = LAYOUT.twistCard;
import { DEFAULT_ORIGIN, PUSH, lensScale } from "./lens";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const inRange = (f: number, r: { from: number; to: number }) => f >= r.from && f < r.to;

/** A rise-and-settle for graphics: critically damped, no wobble. */
const rise = (frame: number, at: number, fps: number, y = 120) => {
  const s = spring({ frame: frame - at, fps, config: { damping: 200 }, durationInFrames: 16 });
  return { opacity: interpolate(s, [0, 0.4], [0, 1], clamp), translate: `0px ${((1 - s) * y).toFixed(2)}px` };
};

/** A pop with a little overshoot (stamps, badges, the button). */
const pop = (frame: number, at: number, fps: number) => spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 220, mass: 0.7 } });

const shotBy = (key: string) => {
  const s = SHOTS.find((x) => x.key === key);
  if (!s) throw new Error(`no shot ${key}`);
  return s;
};

/** Draw children in the SAME lens as a shot (push + kick + zoom about its origin), in source-frame px. */
const InLens: React.FC<{ f: number; shot: string; children: React.ReactNode }> = ({ f, shot, children }) => {
  const s = shotBy(shot);
  const sc = lensScale(f - s.from, s.dur, s.push ?? PUSH[s.kind], s.zoom ?? 1);
  return <AbsoluteFill style={{ transformOrigin: s.origin ?? DEFAULT_ORIGIN, scale: sc.toFixed(5), pointerEvents: "none" }}>{children}</AbsoluteFill>;
};

// ================================================================= icons ===
// Drawn, never emoji: they obey the palette.

const Icon: React.FC<{ kind: string; size: number; color?: string; stroke?: number }> = ({ kind, size, color = C.bone, stroke = 5 }) => {
  const p = { fill: "none", stroke: color, strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      {kind === "glasses" ? (
        <>
          <circle cx={13} cy={27} r={8} {...p} />
          <circle cx={35} cy={27} r={8} {...p} />
          <path d="M21 26 Q24 23 27 26 M5 24 L3 17 M43 24 L45 17" {...p} />
        </>
      ) : kind === "shoe" ? (
        <>
          <path d="M5 33 L6 17 Q12 19 17 16 L22 24 Q34 26 41 30 Q44 32 43 36 L6 36 Z" {...p} />
          <path d="M18 23 L15 26 M22 26 L19 29" {...p} />
        </>
      ) : kind === "drink" ? (
        <>
          <path d="M12 8 H36 L33 22 Q24 30 15 22 Z" {...p} />
          <path d="M24 27 V40 M16 40 H32" {...p} />
        </>
      ) : kind === "search" ? (
        <>
          <circle cx={20} cy={20} r={12} {...p} />
          <path d="M29 29 L41 41" {...p} strokeWidth={stroke + 1} />
        </>
      ) : kind === "moon" ? (
        <path d="M30 6 A18 18 0 1 0 42 32 A14 14 0 1 1 30 6 Z" fill={color} />
      ) : null}
    </svg>
  );
};

// ================================================================ footage ===

const ShotTrack: React.FC = () => (
  <>
    {SHOTS.map((shot) => (
      <Sequence key={shot.key} name={shot.key} from={shot.from} durationInFrames={shot.dur} layout="absolute-fill">
        <ShotMedia shot={shot} />
      </Sequence>
    ))}
  </>
);

type ShotT = (typeof SHOTS)[number];

const Media: React.FC<{ shot: ShotT; f: number; grade?: ShotT["grade"] }> = ({ shot, f, grade }) => {
  const M = shot.kind === "clip" ? Shot : Photo;
  return <M frame={f} src={shot.src} dur={shot.dur} grade={grade ?? shot.grade ?? "warm"} origin={shot.origin} push={shot.push} zoom={shot.zoom} />;
};

/** The blade: a diagonal from (0, SLASH.y0) to (1080, SLASH.y1). */
const SLASH = { y0: 1270, y1: 830 };

const ShotMedia: React.FC<{ shot: ShotT }> = ({ shot }) => {
  const f = useCurrentFrame(); // shot-relative
  const abs = shot.from + f;
  const fx = shot.fx;
  let body: React.ReactNode = <Media shot={shot} f={f} />;

  if (fx?.kind === "slash" && abs >= fx.at) {
    // The frame splits along the blade: the halves slide apart along the cut, then drift.
    const t = abs - fx.at;
    const sep = interpolate(t, [0, 5, 40], [0, 1, 1.25], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
    const ux = 1080;
    const uy = SLASH.y1 - SLASH.y0;
    const len = Math.hypot(ux, uy);
    const [ax, ay] = [ux / len, uy / len];
    const d = 34 * sep;
    const top = `polygon(0 0, 1080px 0, 1080px ${SLASH.y1}px, 0 ${SLASH.y0}px)`;
    const bot = `polygon(0 ${SLASH.y0}px, 1080px ${SLASH.y1}px, 1080px 1920px, 0 1920px)`;
    body = (
      <>
        <AbsoluteFill style={{ clipPath: top, translate: `${(-ax * d).toFixed(2)}px ${(-ay * d - 10 * sep).toFixed(2)}px` }}>
          <Media shot={shot} f={f} />
        </AbsoluteFill>
        <AbsoluteFill style={{ clipPath: bot, translate: `${(ax * d).toFixed(2)}px ${(ay * d + 10 * sep).toFixed(2)}px` }}>
          <Media shot={shot} f={f} />
        </AbsoluteFill>
      </>
    );
  }

  if (fx?.kind === "ghost") {
    // The dead play on: the picture drains to grey and trails an echo of itself, drifting up.
    const g = prog(abs, fx.at, 10);
    const echo = (delay: number, o: number, dy: number) => (
      <Sequence from={delay} layout="absolute-fill">
        <AbsoluteFill style={{ opacity: o * g, mixBlendMode: "screen", translate: `0px ${(-dy * g).toFixed(2)}px`, filter: "blur(1.5px)" }}>
          <Shot frame={f} src={shot.src} dur={shot.dur} grade="ghost" origin={shot.origin} zoom={(shot.zoom ?? 1) * 1.015} />
        </AbsoluteFill>
      </Sequence>
    );
    body = (
      <>
        <Media shot={shot} f={f} />
        <AbsoluteFill style={{ opacity: g }}>
          <Media shot={shot} f={f} grade="ghost" />
        </AbsoluteFill>
        {echo(5, 0.42, 22)}
        {echo(10, 0.26, 44)}
        <AbsoluteFill style={{ opacity: 0.18 * g, background: "radial-gradient(ellipse at 50% 40%, rgba(237,231,218,.9), rgba(237,231,218,0) 65%)", mixBlendMode: "screen" }} />
      </>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {body}
      {shot.section ? <Flash frame={f} at={0} color={C.bone} peak={0.28} tau={3} /> : null}
    </AbsoluteFill>
  );
};

// =============================================================== overlays ===

/**
 * HOOK / TWIST — three reticles lock onto three guests in the crowd, one per
 * spoken word, each tagged "Killer?". Drawn in the shot's lens so they stay on
 * their targets while the camera pushes. Targets are background guests, small
 * in frame (read off the probe sheet).
 */
const TARGETS = [
  { x: 300, y: 962, s: 120 },
  { x: 565, y: 945, s: 120 },
  { x: 748, y: 958, s: 120 },
];

const Reticles: React.FC<{ f: number; fps: number; cue: { from: number; to: number; locks: readonly number[] }; shot: string }> = ({ f, fps, cue, shot }) => {
  if (!inRange(f, cue)) return null;
  return (
    <InLens f={f} shot={shot}>
      {TARGETS.map((t, i) => {
        const at = cue.locks[i];
        if (f < at) return null;
        const s = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 260, mass: 0.6 } });
        const scale = 2.3 - 1.3 * s;
        const rot = (1 - s) * 60;
        const breathe = 1 + 0.025 * Math.sin((f - at) / 4);
        const tag = pop(f, at + 5, fps);
        const L = t.s;
        const arm = L * 0.28;
        const corner = (cx: number, cy: number, sx: number, sy: number) => `M${cx + sx * arm} ${cy} L${cx} ${cy} L${cx} ${cy + sy * arm}`;
        return (
          <div key={i} style={{ position: "absolute", left: t.x - L / 2, top: t.y - L / 2, width: L, height: L }}>
            <svg
              width={L}
              height={L}
              viewBox={`0 0 ${L} ${L}`}
              style={{
                position: "absolute",
                inset: 0,
                overflow: "visible",
                opacity: interpolate(f - at, [0, 3], [0, 1], clamp),
                scale: (scale * breathe).toFixed(4),
                rotate: `${rot.toFixed(2)}deg`,
                filter: "drop-shadow(0 0 10px rgba(224,49,39,.55)) drop-shadow(0 3px 4px rgba(0,0,0,.5))",
              }}
            >
              <g fill="none" stroke={C.red} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">
                <path d={corner(0, 0, 1, 1)} />
                <path d={corner(L, 0, -1, 1)} />
                <path d={corner(0, L, 1, -1)} />
                <path d={corner(L, L, -1, -1)} />
              </g>
              <circle cx={L / 2} cy={L / 2} r={5} fill={C.red} opacity={s} />
            </svg>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: -62,
                translate: "-50% 0",
                scale: tag.toFixed(4),
                transformOrigin: "50% 100%",
                opacity: interpolate(tag, [0, 0.3], [0, 1], clamp),
                background: C.red,
                color: C.bone,
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 30,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                padding: "7px 16px 6px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                boxShadow: "0 8px 20px rgba(0,0,0,.45)",
              }}
            >
              Killer?
            </div>
          </div>
        );
      })}
    </InLens>
  );
};

/** STEP 1 — the arrival phone: three quick questions answered with a tap, then the role card flips and its reel lands on a redaction. */
const Arrival: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const A = CUE.arrival;
  if (!inRange(f, A)) return null;
  const up = rise(f, A.phoneIn, fps, 300);
  const k = LAYOUT.phone.width / 520;
  // Which quiz screen: slides left one screen after each tap lands.
  // The last question stays on screen, answered, until the card flips.
  const slide = A.taps.slice(0, QUIZ.length - 1).reduce((acc, t) => acc + prog(f, t + 4, 7, Easing.bezier(0.65, 0, 0.35, 1)), 0);
  const answered = A.taps.filter((t) => f >= t).length;
  // The progress segments: one per tap, then the last three rush in before the flip.
  const segs = Array.from({ length: 6 }).map((_, i) => {
    if (i < 3) return prog(f, A.taps[i], 5);
    return prog(f, A.taps[2] + 6 + (i - 3) * 2, 3);
  });
  // The flip: the quiz turns away, the role card turns in.
  const flip = interpolate(f, [A.flip, A.flip + 11], [0, 180], { ...clamp, easing: Easing.bezier(0.5, 0, 0.3, 1) });
  const reelFrom = A.flip + 9;
  const reelT = prog(f, reelFrom, A.land - reelFrom, Easing.bezier(0.2, 0.7, 0.2, 1));
  const landed = f >= A.land;
  const stamp = pop(f, A.land + 2, fps);
  const ROW = 110 * k;
  const reelY = -reelT * (ROLES.length - 1) * ROW;
  const blur = landed ? 0 : Math.min(10, Math.abs(interpolate(reelT, [0, 0.15, 0.8, 1], [0, 10, 3, 0])));

  return (
    <div style={{ position: "absolute", inset: 0, ...up }}>
      <Phone width={LAYOUT.phone.width} style={{ left: LAYOUT.phone.left, top: LAYOUT.phone.top, rotate: "-3deg" }}>
        <div style={{ position: "absolute", inset: 0, perspective: 1400 * k }}>
          {/* The quiz face */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: `rotateY(${flip.toFixed(2)}deg)`, fontFamily: SANS }}>
            <div style={{ position: "absolute", left: 40 * k, right: 40 * k, top: 96 * k }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, fontSize: 24 * k, color: C.dim }}>
                <span style={{ color: C.bone }}>Arrival</span>
                <span>{Math.min(6, answered + (segs[5] >= 1 ? 3 : 0)) || 1} of 6</span>
              </div>
              <div style={{ display: "flex", gap: 8 * k, marginTop: 16 * k }}>
                {segs.map((v, i) => (
                  <div key={i} style={{ flex: 1, height: 8 * k, borderRadius: 8 * k, background: C.line, overflow: "hidden" }}>
                    <div style={{ width: "100%", height: "100%", background: C.red, transformOrigin: "left center", scale: `${v.toFixed(4)} 1` }} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: "absolute", left: 0, top: 200 * k, width: "100%", overflow: "hidden", height: 800 * k }}>
              <div style={{ display: "flex", width: `${QUIZ.length * 100}%`, translate: `${(-slide * (100 / QUIZ.length)).toFixed(3)}% 0` }}>
                {QUIZ.map((q, qi) => {
                  const tap = A.taps[qi];
                  const picked = f >= tap;
                  const ripple = prog(f, tap, 12);
                  return (
                    <div key={qi} style={{ width: `${100 / QUIZ.length}%`, padding: `0 ${40 * k}px`, boxSizing: "border-box" }}>
                      <div style={{ fontWeight: 800, fontSize: 44 * k, lineHeight: 1.12, color: C.bone, letterSpacing: "-0.02em", minHeight: 110 * k }}>{q.q}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 * k, marginTop: 34 * k }}>
                        {q.options.map((o, oi) => {
                          const on = picked && oi === q.pick;
                          return (
                            <div
                              key={oi}
                              style={{
                                position: "relative",
                                overflow: "hidden",
                                height: 96 * k,
                                borderRadius: 24 * k,
                                display: "grid",
                                placeItems: "center",
                                fontWeight: 800,
                                fontSize: 28 * k,
                                color: on ? C.bone : C.dim,
                                background: on ? C.red : C.ink2,
                                border: `${2 * k}px solid ${on ? C.red : C.line}`,
                                scale: on ? `${(1 + 0.06 * Math.sin(Math.min(1, ripple) * Math.PI)).toFixed(4)}` : "1",
                              }}
                            >
                              {o}
                              {oi === q.pick && ripple > 0 && ripple < 1 ? (
                                <div
                                  style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: "50%",
                                    width: 260 * k,
                                    height: 260 * k,
                                    borderRadius: "50%",
                                    translate: "-50% -50%",
                                    background: "rgba(237,231,218,.35)",
                                    scale: (0.1 + ripple).toFixed(3),
                                    opacity: 1 - ripple,
                                  }}
                                />
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: 30 * k, fontWeight: 700, fontSize: 22 * k, color: C.dim2 }}>One tap. No one sees your answers.</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* The role face */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              transform: `rotateY(${(flip - 180).toFixed(2)}deg)`,
              fontFamily: SANS,
              background: `radial-gradient(ellipse at 50% 30%, ${C.ink3}, ${C.ink} 70%)`,
            }}
          >
            <div style={{ position: "absolute", left: 40 * k, right: 40 * k, top: 110 * k, textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 24 * k, letterSpacing: "0.3em", textTransform: "uppercase", color: C.dim }}>Your role</div>
              <div
                style={{
                  position: "relative",
                  marginTop: 40 * k,
                  height: ROW * 1.5,
                  overflow: "hidden",
                  borderRadius: 28 * k,
                  background: C.ink2,
                  border: `${2 * k}px solid ${C.line}`,
                  WebkitMaskImage: "linear-gradient(180deg, transparent, black 28%, black 72%, transparent)",
                  maskImage: "linear-gradient(180deg, transparent, black 28%, black 72%, transparent)",
                }}
              >
                <div style={{ position: "absolute", left: 0, right: 0, top: ROW * 0.25, translate: `0px ${reelY.toFixed(2)}px`, filter: `blur(${blur.toFixed(2)}px)` }}>
                  {ROLES.map((r, i) => (
                    <div key={i} style={{ height: ROW, lineHeight: `${ROW}px`, fontWeight: 900, fontSize: 70 * k, letterSpacing: "-0.03em", textTransform: "uppercase", color: r === "Killer" ? C.red : C.bone }}>
                      {r}
                    </div>
                  ))}
                </div>
                {/* Where the reel lands, a redaction slams over the name: the phone never tells the ad. */}
                {landed ? (
                  <div
                    style={{
                      position: "absolute",
                      left: 34 * k,
                      right: 34 * k,
                      top: ROW * 0.25 + 18 * k,
                      height: ROW - 36 * k,
                      borderRadius: 16 * k,
                      background: C.red,
                      scale: `${interpolate(stamp, [0, 1], [0.2, 1]).toFixed(4)} 1`,
                    }}
                  />
                ) : null}
              </div>
              <div
                style={{
                  display: "inline-block",
                  marginTop: 44 * k,
                  border: `${4 * k}px solid ${C.red}`,
                  color: C.red,
                  fontWeight: 900,
                  fontSize: 40 * k,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: `${10 * k}px ${24 * k}px`,
                  borderRadius: 12 * k,
                  rotate: "-6deg",
                  opacity: landed ? interpolate(stamp, [0, 0.3], [0, 1], clamp) : 0,
                  scale: landed ? (1.8 - 0.8 * stamp).toFixed(4) : "1",
                }}
              >
                Top secret
              </div>
              <div style={{ marginTop: 40 * k, fontWeight: 700, fontSize: 28 * k, color: C.bone, opacity: landed ? prog(f, A.land + 6, 8) : 0 }}>Read your role. Tell no one.</div>
            </div>
          </div>
        </div>
      </Phone>
      <Flash frame={f} at={A.land + 2} peak={0.22} tau={3} />
    </div>
  );
};

/** STEP 2 — night falls: the lights stutter and drop, then the blade (the slash lives in ShotMedia). */
const Night: React.FC<{ f: number }> = ({ f }) => {
  const N = CUE.night;
  const shot = shotBy("night");
  if (f < N.fall || f >= shot.from + shot.dur) return null;
  const t = f - N.fall;
  // A fluorescent stutter: dark, back, darker, back, gone.
  const stutter = [0.55, 0.1, 0.62, 0.25, 0.7];
  const dark = t < stutter.length ? stutter[t] : 0.62;
  const draw = prog(f, N.kill, 4, Easing.bezier(0.7, 0, 0.3, 1));
  const fade = 1 - prog(f, N.kill + 8, 14);
  const LEN = 1200;
  return (
    <>
      <AbsoluteFill style={{ background: C.ink, opacity: dark }} />
      <AbsoluteFill style={{ boxShadow: `inset 0 0 ${(260 + 200 * Math.min(1, t / 10)).toFixed(0)}px ${(80 + 60 * Math.min(1, t / 10)).toFixed(0)}px rgba(0,0,0,.7)` }} />
      {/* The moon rises into the chip's empty corner. */}
      <div style={{ position: "absolute", right: 96, top: 300, opacity: prog(f, N.fall + 3, 10) * 0.9, translate: `0px ${((1 - prog(f, N.fall + 3, 14)) * 30).toFixed(1)}px` }}>
        <Icon kind="moon" size={84} color={C.bone} />
      </div>
      {f >= N.kill ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: fade }}>
          <line
            x1={-40}
            y1={SLASH.y0 + (40 * (SLASH.y0 - SLASH.y1)) / 1080}
            x2={1120}
            y2={SLASH.y1 - (40 * (SLASH.y0 - SLASH.y1)) / 1080}
            stroke={C.red}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={LEN * 1.2}
            strokeDashoffset={((1 - draw) * LEN * 1.2).toFixed(1)}
            style={{ filter: "drop-shadow(0 0 16px rgba(224,49,39,.9)) drop-shadow(0 0 4px rgba(237,231,218,.8))" }}
          />
        </svg>
      ) : null}
      <Flash frame={f} at={N.kill} peak={0.45} tau={5} />
    </>
  );
};

/** STEP 2 — dawn: eight phones, dark, then every screen lights on the same frame with the same news. */
const Dawn: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const D = CUE.dawn;
  if (!inRange(f, D)) return null;
  const G = LAYOUT.grid;
  const lit = f >= D.light;
  const litP = prog(f, D.light, 6);
  const k = G.width / 520;
  return (
    <>
      {Array.from({ length: G.cols * G.rows }).map((_, i) => {
        const col = i % G.cols;
        const row = Math.floor(i / G.cols);
        const inAt = D.phonesIn + (col + row * 2) * 2;
        const s = spring({ frame: f - inAt, fps, config: { damping: 14, stiffness: 200 } });
        const tilt = (random(`dawn-${i}`) - 0.5) * 8;
        return (
          <Phone
            key={i}
            width={G.width}
            style={{
              left: G.left + col * (G.width + G.gap),
              top: G.top + row * (G.width * 2.16 + G.rowGap),
              rotate: `${tilt.toFixed(2)}deg`,
              opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
              scale: (0.6 + 0.4 * s).toFixed(4),
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: lit ? C.bone : C.ink }}>
              {lit ? (
                <div style={{ position: "absolute", left: 40 * k, right: 40 * k, top: 280 * k, textAlign: "center", fontFamily: SANS, opacity: litP }}>
                  <div style={{ fontWeight: 900, fontSize: 44 * k, letterSpacing: "0.3em", textTransform: "uppercase", color: C.red }}>{DAWN.kicker}</div>
                  <div style={{ margin: `${60 * k}px auto 0`, width: 140 * k, height: 140 * k, borderRadius: "50%", background: "rgba(12,13,15,.12)", border: `${8 * k}px solid ${C.red}` }} />
                  <div style={{ margin: `${50 * k}px auto 0`, width: 300 * k, height: 44 * k, borderRadius: 22 * k, background: C.ink }} />
                  <div style={{ marginTop: 26 * k, fontWeight: 900, fontSize: 60 * k, color: C.ink }}>{DAWN.line}</div>
                </div>
              ) : null}
              {/* The screen wakes: a bone flash that fades into the dawn card. */}
              <div style={{ position: "absolute", inset: 0, background: C.bone, opacity: lit ? 0.9 * impact(f, D.light, 3) : 0 }} />
            </div>
          </Phone>
        );
      })}
      <Flash frame={f} at={D.light} color={C.red} peak={0.25} tau={5} />
    </>
  );
};

/** STEP 3 — clue banners drop in like a lock screen: the game's own clue lines, each with its trait. */
const Clues: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  if (!inRange(f, CUE.clues)) return null;
  const cards = CUE.clues.cards;
  return (
    <>
      {CLUES.map((c, i) => {
        const at = cards[i];
        if (f < at) return null;
        const s = spring({ frame: f - at, fps, config: { damping: 15, stiffness: 180 } });
        const newer = cards.filter((x, j) => j > i && f >= x).length;
        const push = cards.slice(i + 1).reduce((acc, x) => acc + spring({ frame: f - x, fps, config: { damping: 200 }, durationInFrames: 12 }), 0);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: X,
              width: INNER,
              top: LAYOUT.cluesTop + push * 176,
              translate: `0px ${((1 - s) * -160).toFixed(2)}px`,
              opacity: interpolate(s, [0, 0.3], [0, 1], clamp) * (1 - 0.16 * newer),
              display: "flex",
              gap: 22,
              alignItems: "center",
              padding: "24px 28px",
              borderRadius: 36,
              background: "rgba(28,30,34,.94)",
              border: `1px solid ${C.line}`,
              boxShadow: "0 24px 50px rgba(0,0,0,.45)",
              fontFamily: SANS,
            }}
          >
            <div style={{ width: 84, height: 84, borderRadius: 22, background: C.red, flexShrink: 0, display: "grid", placeItems: "center" }}>
              <Icon kind={c.icon} size={52} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 26, color: C.dim }}>
                <span>New clue</span>
                <span style={{ color: C.dim2, fontWeight: 700 }}>now</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 36, lineHeight: 1.2, color: C.bone, marginTop: 4, letterSpacing: "-0.01em" }}>{c.text}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

/**
 * STEP 3 — a hand-drawn marker loop round the trait in shot (glasses, shoes,
 * a drink), with its icon badge. Source-frame px, drawn in the shot's lens.
 */
const LOOPS: Record<string, { cx: number; cy: number; rx: number; ry: number; rot: number; badge: [number, number]; icon: string }> = {
  glasses: { cx: 690, cy: 665, rx: 150, ry: 70, rot: -5, badge: [930, 640], icon: "glasses" },
  shoes: { cx: 470, cy: 1672, rx: 175, ry: 78, rot: 3, badge: [700, 1540], icon: "shoe" },
  drink: { cx: 705, cy: 1230, rx: 120, ry: 240, rot: -3, badge: [890, 1060], icon: "drink" },
};

const loopPath = (l: { cx: number; cy: number; rx: number; ry: number }) => {
  // One-and-a-bit turns, slightly off-round, like a marker in a hurry.
  const pts: string[] = [];
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const a = -Math.PI * 0.62 + (i / N) * Math.PI * 2.28;
    const wob = 1 + 0.06 * Math.sin(a * 3 + 1) + (i / N) * 0.1;
    pts.push(`${(l.cx + Math.cos(a) * l.rx * wob).toFixed(1)},${(l.cy + Math.sin(a) * l.ry * wob).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
};

const TraitLoop: React.FC<{ f: number; fps: number; name: keyof typeof LOOPS & string; shot: string; at: number }> = ({ f, fps, name, shot, at }) => {
  const s = shotBy(shot);
  if (f < at || f >= s.from + s.dur) return null;
  const l = LOOPS[name];
  const draw = prog(f, at, 11, Easing.bezier(0.45, 0, 0.2, 1));
  const b = pop(f, at + 8, fps);
  const LEN = 2 * Math.PI * Math.max(l.rx, l.ry) * 1.3;
  return (
    <InLens f={f} shot={shot}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path
          d={loopPath(l)}
          transform={`rotate(${l.rot} ${l.cx} ${l.cy})`}
          fill="none"
          stroke={C.red}
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={LEN}
          strokeDashoffset={((1 - draw) * LEN).toFixed(2)}
          style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,.45))" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: l.badge[0] - 48,
          top: l.badge[1] - 48,
          width: 96,
          height: 96,
          borderRadius: 48,
          background: C.red,
          display: "grid",
          placeItems: "center",
          scale: b.toFixed(4),
          opacity: interpolate(b, [0, 0.3], [0, 1], clamp),
          boxShadow: "0 10px 26px rgba(0,0,0,.45)",
        }}
      >
        <Icon kind={l.icon} size={60} />
      </div>
    </InLens>
  );
};

/** STEP 4 — the round table: a live banishment tally; the lead changes hands on "out". */
const Vote: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const V = CUE.vote;
  if (!inRange(f, V)) return null;
  const times = [V.barsFrom, V.overtake, V.overtake + 14];
  const swap = prog(f, V.overtake, 9, Easing.bezier(0.65, 0, 0.35, 1));
  const leaderB = f >= V.overtake + 2;
  const tag = prog(f, V.overtake + 4, 8, Easing.bezier(0.34, 1.7, 0.64, 1));
  const up = rise(f, V.panelIn, fps, 140);
  const ROW_H = 104;
  return (
    <div
      style={{
        position: "absolute",
        left: X,
        top: LAYOUT.voteTop,
        width: INNER,
        borderRadius: 40,
        background: "rgba(28,30,34,.94)",
        border: `1px solid ${C.line}`,
        padding: "30px 36px 12px",
        boxShadow: "0 40px 80px rgba(0,0,0,.5)",
        fontFamily: SANS,
        ...up,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, fontWeight: 800, fontSize: 28 }}>
        <span style={{ color: C.bone }}>
          {TALLY.title} · <span style={{ color: C.dim }}>{TALLY.ask}</span>
        </span>
        <span style={{ color: C.red, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: C.red, opacity: 0.55 + 0.45 * Math.sin(f / 3) }} />
          Live
        </span>
      </div>
      <div style={{ position: "relative", height: ROW_H * TALLY.rows.length }}>
        {TALLY.rows.map((row, i) => {
          const v = interpolate(f, times, row.vals, { ...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1) });
          const slot = row.key === "a" ? i + swap : row.key === "b" ? i - swap : i;
          const lead = (row.key === "b" && leaderB) || (row.key === "a" && !leaderB);
          return (
            <div key={row.key} style={{ position: "absolute", left: 0, right: 0, top: slot * ROW_H, height: ROW_H - 14, display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: lead ? C.bone : "rgba(237,231,218,.25)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: row.name, height: 22, borderRadius: 11, background: lead ? C.bone : "rgba(237,231,218,.32)" }} />
                  {row.key === "b" && tag > 0 ? (
                    <span
                      style={{
                        scale: `${(1.4 - 0.4 * tag).toFixed(4)}`,
                        transformOrigin: "0% 50%",
                        background: C.red,
                        color: C.bone,
                        fontWeight: 800,
                        fontSize: 20,
                        padding: "6px 14px",
                        borderRadius: 999,
                        textTransform: "uppercase",
                      }}
                    >
                      Banished
                    </span>
                  ) : null}
                </div>
                <div style={{ height: 14, borderRadius: 7, background: C.line2, marginTop: 14, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 7, width: `${((v / TALLY.max) * 100).toFixed(2)}%`, background: lead ? C.red : "rgba(237,231,218,.45)" }} />
                </div>
              </div>
              <div style={{ fontWeight: 900, fontSize: 64, color: C.bone, width: 90, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{Math.round(v)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** STEP 4 — the banishment reveal: a card spins between the two teams and lands, Faithful. The room was wrong. */
const Reveal: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const R = CUE.reveal;
  if (!inRange(f, R)) return null;
  const up = rise(f, R.from, fps, 160);
  // 2.5 turns: it ends showing the back face (Faithful).
  const a = interpolate(f, [R.spin, R.land], [0, 900], { ...clamp, easing: Easing.bezier(0.3, 0.1, 0.1, 1) });
  const landed = f >= R.land;
  const after = prog(f, R.land + 6, 10);
  const W0 = LAYOUT.reveal.width;
  const H0 = 520;
  const face = (label: string, front: boolean): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    borderRadius: 44,
    backfaceVisibility: "hidden",
    display: "grid",
    placeItems: "center",
    transform: `rotateY(${(a + (front ? 0 : 180)).toFixed(2)}deg)`,
    background: front ? C.red : C.bone,
    color: front ? C.bone : C.ink,
    boxShadow: "0 40px 80px rgba(0,0,0,.55)",
    fontFamily: SANS,
    fontWeight: 900,
    fontSize: label.length > 7 ? 92 : 104,
    letterSpacing: "-0.04em",
    textTransform: "uppercase",
  });
  return (
    <div style={{ position: "absolute", left: (1080 - W0) / 2, top: LAYOUT.reveal.top, width: W0, height: H0, perspective: 1600, ...up }}>
      <div style={{ position: "absolute", inset: 0, scale: landed ? (1 + 0.06 * impact(f, R.land, 4)).toFixed(4) : "1" }}>
        <div style={face(REVEAL.killer, true)}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 30, letterSpacing: "0.3em", fontWeight: 800, opacity: 0.8 }}>They were</div>
            {REVEAL.killer}
          </div>
        </div>
        <div style={face(REVEAL.faithful, false)}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 30, letterSpacing: "0.3em", fontWeight: 800, opacity: 0.6 }}>They were</div>
            {REVEAL.faithful}
            <div style={{ fontSize: 34, letterSpacing: "-0.01em", fontWeight: 800, textTransform: "none", marginTop: 16, opacity: after, color: C.red }}>{REVEAL.after}</div>
          </div>
        </div>
      </div>
      <Flash frame={f} at={R.land} color={C.bone} peak={0.22} tau={3} />
    </div>
  );
};

/** HOW 5 — "Get killed?": the hit. */
const Killed: React.FC<{ f: number }> = ({ f }) => (inRange(f, { from: CUE.killed, to: CUE.killed + 24 }) ? <Flash frame={f} at={CUE.killed} peak={0.5} tau={6} /> : null);

/** TWIST — the poster's rays, ink over the poster's own headline, the Killer card slams in on "you". */
const Twist: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const T = CUE.twist;
  if (!inRange(f, T)) return null;
  const s = spring({ frame: f - T.youHit, fps, config: { damping: 13, stiffness: 240, mass: 0.8 } });
  return (
    <>
      <Rays frame={f} cx={600} cy={640} opacity={0.75} />
      <AbsoluteFill
        style={{
          background: "linear-gradient(90deg, rgba(12,13,15,1) 0%, rgba(12,13,15,1) 36%, rgba(12,13,15,0) 56%)",
          WebkitMaskImage: "linear-gradient(180deg, black 0%, black 40%, transparent 52%)",
          maskImage: "linear-gradient(180deg, black 0%, black 40%, transparent 52%)",
        }}
      />
      {f >= T.youHit ? (
        <div
          style={{
            position: "absolute",
            left: TWIST_CARD.left,
            top: TWIST_CARD.top,
            width: TWIST_CARD.width,
            height: TWIST_CARD.height,
            borderRadius: 30,
            background: C.red,
            display: "grid",
            placeItems: "center",
            fontFamily: SANS,
            color: C.bone,
            textAlign: "center",
            boxShadow: "0 30px 70px rgba(0,0,0,.6)",
            rotate: `${(8 - 16 * s).toFixed(2)}deg`,
            scale: (2 - s).toFixed(4),
            opacity: interpolate(s, [0, 0.25], [0, 1], clamp),
            ...glitch(f, T.youHit + 2, 5),
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.85 }}>Your role</div>
            <div style={{ fontWeight: 900, fontSize: 54, letterSpacing: "-0.04em", textTransform: "uppercase", marginTop: 10 }}>Killer</div>
          </div>
        </div>
      ) : null}
      <Flash frame={f} at={T.youHit} peak={0.85} tau={6} />
    </>
  );
};

/** CTA — the question, the lockup (Killers Night · by Astral Project), the button — each on its spoken line. */
const End: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const E = CUE.end;
  if (!inRange(f, E)) return null;
  const line = rise(f, E.line, fps, 60);
  const mark = spring({ frame: f - E.mark, fps, config: { damping: 14, stiffness: 200 } });
  const by = rise(f, E.by, fps, 30);
  const cta = spring({ frame: f - E.cta, fps, config: { damping: 12, stiffness: 180 } });
  const bob = f > E.cta + 20 ? Math.abs(Math.sin(((f - E.cta) / 30) * Math.PI)) * 12 : 0;
  const out = prog(f, E.to - 8, 8, Easing.bezier(0.5, 0, 0.75, 0));
  // The wordmark tracks in from wide as it lands.
  const track = interpolate(mark, [0, 1], [0.4, -0.01]);
  const sheen = interpolate(f, [E.mark + 8, E.mark + 26], [-30, 130], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: X,
        width: INNER,
        top: 330,
        textAlign: "center",
        fontFamily: SANS,
        color: C.bone,
        opacity: 1 - out,
        translate: `0px ${(-80 * out).toFixed(2)}px`,
      }}
    >
      <div style={{ ...line, textShadow: CAP_SHADOW }}>
        <div style={{ fontWeight: 800, fontSize: 100, lineHeight: 1.05, letterSpacing: "-0.035em" }}>{BRAND.question[0]}</div>
        <div style={{ fontWeight: 900, fontSize: 118, lineHeight: 1.12, letterSpacing: "-0.045em", marginTop: 8 }}>
          <span style={{ background: C.red, borderRadius: 22, padding: "0 0.12em" }}>{BRAND.question[1]}</span>
        </div>
      </div>

      <div style={{ marginTop: 64, opacity: interpolate(mark, [0, 0.3], [0, 1], clamp), scale: (0.9 + 0.1 * mark).toFixed(4) }}>
        <div
          style={{
            position: "relative",
            display: "inline-block",
            fontFamily: F.disp,
            fontWeight: 800,
            fontSize: 150,
            lineHeight: 0.9,
            textTransform: "uppercase",
            letterSpacing: `${track.toFixed(4)}em`,
            WebkitMaskImage: `linear-gradient(105deg, black ${sheen - 12}%, rgba(0,0,0,.55) ${sheen}%, black ${sheen + 12}%)`,
            maskImage: `linear-gradient(105deg, black ${sheen - 12}%, rgba(0,0,0,.55) ${sheen}%, black ${sheen + 12}%)`,
            textShadow: CAP_SHADOW,
          }}
        >
          {BRAND.name[0]} <span style={{ color: C.red }}>{BRAND.name[1]}</span>
        </div>
      </div>
      <div style={{ ...by, marginTop: 26, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        <span style={{ fontWeight: 700, fontSize: 30, color: C.dim }}>{BRAND.by}</span>
        <Img src={staticFile(`${ASSET_DIR}/${BRAND.logo}`)} style={{ height: 48, filter: LOGO_EDGE }} />
      </div>

      <div
        style={{
          marginTop: 60,
          display: "inline-flex",
          alignItems: "center",
          gap: 22,
          background: C.red,
          borderRadius: 999,
          padding: "30px 64px",
          fontWeight: 900,
          fontSize: 70,
          letterSpacing: "-0.03em",
          boxShadow: "0 20px 50px rgba(224,49,39,.35), 0 16px 32px rgba(0,0,0,.45)",
          opacity: interpolate(cta, [0, 0.3], [0, 1], clamp),
          scale: `${(0.8 + 0.2 * cta).toFixed(4)}`,
        }}
      >
        {BRAND.cta}
        <svg width={50} height={36} viewBox="0 0 50 36">
          <path d="M2 18 H42 M28 4 L44 18 L28 32" fill="none" stroke={C.bone} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div
        style={{
          marginTop: 34,
          fontWeight: 700,
          fontSize: 30,
          color: C.dim,
          opacity: interpolate(cta, [0.3, 1], [0, 1], clamp),
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
        }}
      >
        {BRAND.tap}
        <svg width={30} height={30} viewBox="0 0 30 30" style={{ translate: `0px ${bob.toFixed(2)}px` }}>
          <path d="M5 10 L15 20 L25 10" fill="none" stroke={C.dim} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

/** The Astral mark's "ASTRAL" is slate, built for a mid-tone ground: a thin light edge keeps it legible on ink. */
const LOGO_EDGE = "drop-shadow(0 0 1.5px rgba(237,231,218,.95)) drop-shadow(0 0 1px rgba(237,231,218,.8)) drop-shadow(0 0 14px rgba(237,231,218,.25))";

/** EVENT — the next night: date, time, venue, and the two logos. Supplied by the user. */
const Event: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const E = CUE.event;
  if (!inRange(f, E)) return null;
  const at = (i: number) => rise(f, E.from + 2 + i * 5, fps, 70);
  const dateP = spring({ frame: f - (E.from + 12), fps, config: { damping: 13, stiffness: 190 } });
  return (
    <div style={{ position: "absolute", left: X, width: INNER, top: 320, textAlign: "center", fontFamily: SANS, color: C.bone }}>
      <div style={{ ...at(0) }}>
        <span
          style={{
            display: "inline-block",
            background: C.red,
            borderRadius: 999,
            padding: "12px 26px 11px",
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {EVENT.kicker}
        </span>
      </div>
      <div style={{ ...at(1), marginTop: 30, fontWeight: 800, fontSize: 80, lineHeight: 1, letterSpacing: "-0.03em", textShadow: CAP_SHADOW }}>{EVENT.day}</div>
      <div
        style={{
          fontWeight: 900,
          fontSize: 176,
          lineHeight: 1.02,
          letterSpacing: `${interpolate(dateP, [0, 1], [0.08, -0.05]).toFixed(4)}em`,
          textShadow: CAP_SHADOW,
          opacity: interpolate(dateP, [0, 0.3], [0, 1], clamp),
          scale: (1.15 - 0.15 * dateP).toFixed(4),
        }}
      >
        {EVENT.date}
      </div>
      <div
        style={{
          ...at(3),
          marginTop: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
          fontWeight: 800,
          fontSize: 76,
          letterSpacing: "-0.03em",
          textShadow: CAP_SHADOW,
        }}
      >
        <svg width={62} height={62} viewBox="0 0 62 62">
          <circle cx={31} cy={31} r={26} fill="none" stroke={C.red} strokeWidth={7} />
          <path d="M31 31 L22 25" stroke={C.bone} strokeWidth={6} strokeLinecap="round" />
          <path d="M31 31 L31 14" stroke={C.bone} strokeWidth={5} strokeLinecap="round" transform={`rotate(${(prog(f, E.from + 17, 24) * 360).toFixed(1)} 31 31)`} />
        </svg>
        {EVENT.time}
      </div>
      <div
        style={{
          ...at(4),
          marginTop: 22,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          fontWeight: 800,
          fontSize: 64,
          letterSpacing: "-0.03em",
          textShadow: CAP_SHADOW,
        }}
      >
        <svg width={50} height={64} viewBox="0 0 50 64" style={{ translate: `0px ${(-10 * impact(f, E.from + 22, 5)).toFixed(2)}px` }}>
          <path d="M25 60 C25 60 4 36 4 22 A21 21 0 0 1 46 22 C46 36 25 60 25 60 Z" fill={C.red} />
          <circle cx={25} cy={22} r={8} fill={C.bone} />
        </svg>
        {EVENT.place}
      </div>

      <div style={{ ...at(6), marginTop: 56 }}>
        <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: "0.3em", textTransform: "uppercase", color: C.dim }}>{EVENT.withLine}</div>
        <div style={{ marginTop: 28, display: "flex", justifyContent: "center", alignItems: "center", gap: 44 }}>
          <Img src={staticFile(`${ASSET_DIR}/${EVENT.logoA}`)} style={{ height: 76, filter: LOGO_EDGE }} />
          <span style={{ fontWeight: 800, fontSize: 48, color: C.dim }}>×</span>
          <Img src={staticFile(`${ASSET_DIR}/${EVENT.logoB}`)} style={{ height: 130 }} />
        </div>
      </div>
    </div>
  );
};

// ================================================================= layers ===

export const Layers: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = STEPS.find((s) => inRange(f, s));
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <ShotTrack />

      {/* The cards sit on a darker plate than the photo's own grade. */}
      {f >= CUE.end.from ? <AbsoluteFill style={{ background: "rgba(12,13,15,.6)" }} /> : null}
      <Reticles f={f} fps={fps} cue={CUE.reticles} shot="three" />
      <Reticles f={f} fps={fps} cue={CUE.reticles2} shot="those" />
      <Arrival f={f} fps={fps} />
      <Night f={f} />
      <Dawn f={f} fps={fps} />
      <Clues f={f} fps={fps} />
      <TraitLoop f={f} fps={fps} name="glasses" shot="glasses" at={CUE.loops.glasses} />
      <TraitLoop f={f} fps={fps} name="shoes" shot="shoes" at={CUE.loops.shoes} />
      <TraitLoop f={f} fps={fps} name="drink" shot="drink" at={CUE.loops.drink} />
      <Vote f={f} fps={fps} />
      <Reveal f={f} fps={fps} />
      <Killed f={f} />
      <Twist f={f} fps={fps} />
      <End f={f} fps={fps} />
      <Event f={f} fps={fps} />
      {inRange(f, { from: CUE.event.from, to: CUE.event.from + 12 }) ? <Flash frame={f} at={CUE.event.from} color={C.bone} peak={0.22} tau={3} /> : null}

      {step ? <StepChip frame={f - (step.since ?? step.from)} step={step.step} first={step.step === 1} resumed={step.since !== undefined ? f - step.from : undefined} /> : null}
      <Captions frame={f} caps={CAPTIONS} fps={fps} />
      <Film frame={f} />
    </AbsoluteFill>
  );
};
