/**
 * scenes.tsx — the reel's layers and its overlay library.
 *
 * The ad is timed to the voiceover (see ./timeline.ts), so it is built as
 * independent tracks rather than self-contained scenes, bottom to top:
 *
 *   ShotTrack     the footage, one <Sequence> per shot, hard cuts
 *   Overlays      phone, notifications, marker loop, tally, twist, end + event cards
 *   StepChip      "How it works · n/5" across the five steps
 *   Captions      the on-screen script, each word popping as it is spoken
 *   Film          grain, vignette, the thin bands under the platform UI
 *
 * Overlay frames are ABSOLUTE; every cue comes from CUE in ./timeline.ts.
 *
 * Layout law (Meta Reels, 2026): words live inside x 72–1008, y 270–1240. The
 * band below 1240 is covered by the caption and the CTA button, so it only
 * carries picture (the lower half of a phone, the bottom of a photo).
 *
 * FACT DISCIPLINE — the clue lines and the tally are invented, suspects are
 * redaction bars, the reveal photo is a past, retired case, and the event card
 * says only what the user supplied.
 */

import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ASSET_DIR, C, F } from "./theme";
import { Phone, glitch, prog } from "./fx";
import { CAP_SHADOW, Captions, Film, Flash, INNER, Photo, Rays, SANS, Shot, StepChip, X } from "./kit";
import { BRAND, CLUE_LINES, EVENT, TALLY } from "./content";
import { CAPTIONS, CUE, LAYOUT, SHOTS, STEPS } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** A rise-and-settle for graphics: critically damped, no wobble. */
const rise = (frame: number, at: number, fps: number, y = 120) => {
  const s = spring({ frame: frame - at, fps, config: { damping: 200 }, durationInFrames: 16 });
  return { opacity: interpolate(s, [0, 0.4], [0, 1], clamp), translate: `0px ${((1 - s) * y).toFixed(2)}px` };
};

const inRange = (f: number, r: { from: number; to: number }) => f >= r.from && f < r.to;

// ================================================================== footage ===

const ShotTrack: React.FC = () => (
  <>
    {SHOTS.map((shot) => (
      <Sequence key={shot.key} name={shot.key} from={shot.from} durationInFrames={shot.dur} layout="absolute-fill">
        <ShotMedia shot={shot} />
      </Sequence>
    ))}
  </>
);

const ShotMedia: React.FC<{ shot: (typeof SHOTS)[number] }> = ({ shot }) => {
  const f = useCurrentFrame();
  const Media = shot.kind === "clip" ? Shot : Photo;
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Media frame={f} src={shot.src} dur={shot.dur} grade={shot.grade ?? "warm"} origin={shot.origin} push={shot.push} zoom={shot.zoom} />
      {shot.section ? <Flash frame={f} at={0} color={C.bone} peak={0.28} tau={3} /> : null}
    </AbsoluteFill>
  );
};

// ================================================================ overlays ===

/** HOOK — a red marker line strikes through "same night out?" on "out". */
const Strike: React.FC<{ f: number }> = ({ f }) => {
  const p = prog(f, CUE.strike, 7, Easing.bezier(0.6, 0, 0.3, 1));
  if (p <= 0 || f >= SHOTS[1].from) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 150,
        // Through line 2 of the hook caption, wherever it is placed.
        top: CAPTIONS[0].y + 40,
        width: 780,
        height: 16,
        borderRadius: 8,
        background: C.red,
        rotate: "-4deg",
        transformOrigin: "left center",
        scale: `${p.toFixed(4)} 1`,
        boxShadow: "0 4px 14px rgba(0,0,0,.4)",
      }}
    />
  );
};

/** STEP 1 — the secret-role card on a phone. Its redaction glitches open on "killer". */
const Role: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const R = CUE.role;
  if (!inRange(f, R)) return null;
  const up = rise(f, R.phoneIn, fps, 260);
  const peek = f >= R.peekOn && f < R.peekOff;
  return (
    <div style={{ position: "absolute", inset: 0, ...up }}>
      <Phone width={LAYOUT.phone.width} style={{ left: LAYOUT.phone.left, top: LAYOUT.phone.top, rotate: "-3deg" }}>
        <div style={{ position: "absolute", left: 44, right: 44, top: 100, fontFamily: SANS }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.red }} />
            <div style={{ fontWeight: 800, fontSize: 26, color: C.bone, letterSpacing: "0.02em" }}>Your role</div>
            <div style={{ marginLeft: "auto", fontWeight: 700, fontSize: 20, color: C.dim }}>TOP SECRET</div>
          </div>
          <div style={{ marginTop: 34, borderRadius: 28, background: C.ink2, border: `1px solid ${C.line}`, padding: "30px 30px 34px" }}>
            <div style={{ fontWeight: 700, fontSize: 30, color: C.dim }}>You are...</div>
            <div style={{ position: "relative", height: 96, marginTop: 14 }}>
              {peek ? (
                <div style={{ fontWeight: 900, fontSize: 64, lineHeight: "96px", whiteSpace: "nowrap", color: C.red, letterSpacing: "-0.04em", ...glitch(f, R.peekOn, 8) }}>
                  {BRAND.roleReveal}
                </div>
              ) : (
                <div style={{ position: "absolute", inset: "6px 0 6px 0", borderRadius: 14, background: C.red }} />
              )}
            </div>
            <div style={{ fontWeight: 700, fontSize: 24, color: C.bone, marginTop: 24 }}>Don&rsquo;t show anyone.</div>
          </div>
        </div>
      </Phone>
      <Flash frame={f} at={R.peekOn} peak={0.3} tau={3} />
    </div>
  );
};

/** STEP 2 — clue notifications drop in from the top, stacking like a lock screen. */
const Clues: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  if (!inRange(f, CUE.clues)) return null;
  const cards = CUE.clues.cards;
  return (
    <>
      {CLUE_LINES.map((text, i) => {
        const at = cards[i];
        if (f < at) return null;
        const s = spring({ frame: f - at, fps, config: { damping: 15, stiffness: 180 } });
        // Each new banner lands on top and pushes the older ones down.
        const newer = cards.filter((c, j) => j > i && f >= c).length;
        const push = cards.slice(i + 1).reduce((acc, c) => acc + spring({ frame: f - c, fps, config: { damping: 200 }, durationInFrames: 12 }), 0);
        const last = i === CLUE_LINES.length - 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: X,
              width: INNER,
              top: LAYOUT.cluesTop + push * 176,
              translate: `0px ${((1 - s) * -160).toFixed(2)}px`,
              opacity: interpolate(s, [0, 0.3], [0, 1], clamp) * (1 - 0.18 * newer),
              display: "flex",
              gap: 22,
              alignItems: "center",
              padding: "24px 28px",
              borderRadius: 36,
              background: "rgba(28,30,34,.93)",
              border: `1px solid ${C.line}`,
              boxShadow: "0 24px 50px rgba(0,0,0,.45)",
              fontFamily: SANS,
            }}
          >
            <div style={{ width: 84, height: 84, borderRadius: 22, background: C.red, flexShrink: 0, display: "grid", placeItems: "center" }}>
              {/* A magnifier, drawn — never an emoji. */}
              <svg width={46} height={46} viewBox="0 0 46 46">
                <circle cx={19} cy={19} r={12} fill="none" stroke={C.bone} strokeWidth={6} />
                <path d="M28 28 L40 40" stroke={C.bone} strokeWidth={7} strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 26, color: last ? C.red : C.dim }}>
                <span>New clue</span>
                <span style={{ color: C.dim2, fontWeight: 700 }}>now</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 38, lineHeight: 1.2, color: C.bone, marginTop: 4, letterSpacing: "-0.01em" }}>{text}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

/** STEP 2 — the marker loop round a line of the suspect sheet, drawn on "points". */
const Notes: React.FC<{ f: number }> = ({ f }) => {
  if (!inRange(f, CUE.notes)) return null;
  const draw = prog(f, CUE.notes.circle, 12, Easing.bezier(0.45, 0, 0.2, 1));
  const LEN = 1900;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <path
        d="M 300 1010 C 300 900, 720 880, 760 990 C 800 1100, 380 1150, 310 1060 C 280 1020, 330 960, 420 945"
        fill="none"
        stroke={C.red}
        strokeWidth={16}
        strokeLinecap="round"
        strokeDasharray={LEN}
        strokeDashoffset={((1 - draw) * LEN).toFixed(2)}
        style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,.4))" }}
      />
    </svg>
  );
};

const ROWS = TALLY.rows;
const MAX = TALLY.max;

/** STEP 4 — the live tally. The lead changes hands on "wrong". */
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
        <span style={{ color: C.bone }}>Who did it?</span>
        <span style={{ color: C.red, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: C.red, opacity: 0.55 + 0.45 * Math.sin(f / 3) }} />
          Live vote
        </span>
      </div>
      <div style={{ position: "relative", height: ROW_H * ROWS.length }}>
        {ROWS.map((row, i) => {
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
                      Top suspect
                    </span>
                  ) : null}
                </div>
                <div style={{ height: 14, borderRadius: 7, background: C.line2, marginTop: 14, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 7, width: `${((v / MAX) * 100).toFixed(2)}%`, background: lead ? C.red : "rgba(237,231,218,.45)" }} />
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

/** TWIST — the poster's rays, ink over the poster's own headline, the big hit on "you". */
const Twist: React.FC<{ f: number }> = ({ f }) => {
  if (!inRange(f, CUE.twist)) return null;
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
      <Flash frame={f} at={CUE.twist.youHit} peak={0.85} tau={6} />
    </>
  );
};

/** CTA — "Can you catch the killer?" · the brand · the button, each on its spoken line. */
const End: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const E = CUE.end;
  if (!inRange(f, E)) return null;
  const line = rise(f, E.line, fps, 60);
  const mark = rise(f, E.mark, fps, 60);
  const cta = spring({ frame: f - E.cta, fps, config: { damping: 12, stiffness: 180 } });
  const bob = f > E.cta + 20 ? Math.abs(Math.sin(((f - E.cta) / 30) * Math.PI)) * 12 : 0;
  // Leaves upward in the last 8 frames, as the event card rises in.
  const out = prog(f, E.to - 8, 8, Easing.bezier(0.5, 0, 0.75, 0));
  return (
    <div
      style={{
        position: "absolute",
        left: X,
        width: INNER,
        top: 340,
        textAlign: "center",
        fontFamily: SANS,
        color: C.bone,
        opacity: 1 - out,
        translate: `0px ${(-80 * out).toFixed(2)}px`,
      }}
    >
      <div style={{ ...line, textShadow: CAP_SHADOW }}>
        <div style={{ fontWeight: 800, fontSize: 104, lineHeight: 1.05, letterSpacing: "-0.035em" }}>{BRAND.question[0]}</div>
        <div style={{ fontWeight: 900, fontSize: 132, lineHeight: 1.1, letterSpacing: "-0.045em", marginTop: 8 }}>
          <span style={{ background: C.red, borderRadius: 22, padding: "0 0.12em" }}>{BRAND.question[1]}</span>
        </div>
      </div>

      <div style={{ ...mark, marginTop: 70 }}>
        <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: "0.34em", textTransform: "uppercase", color: C.dim }}>{BRAND.kicker}</div>
        <div style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 132, lineHeight: 0.9, textTransform: "uppercase", letterSpacing: "-0.01em", marginTop: 12 }}>
          {BRAND.name[0]} <span style={{ color: C.red }}>{BRAND.name[1]}</span>
        </div>
      </div>

      <div
        style={{
          marginTop: 56,
          display: "inline-flex",
          alignItems: "center",
          gap: 22,
          background: C.red,
          borderRadius: 999,
          padding: "30px 60px",
          fontWeight: 900,
          fontSize: 66,
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

/** EVENT — the next night: date, time, venue, and the two logos. Supplied by the user. */
const Event: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const E = CUE.event;
  if (!inRange(f, E)) return null;
  const at = (i: number) => rise(f, E.from + 2 + i * 5, fps, 70);
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
      <div style={{ ...at(2), fontWeight: 900, fontSize: 176, lineHeight: 1.02, letterSpacing: "-0.05em", textShadow: CAP_SHADOW }}>{EVENT.date}</div>
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
          <path d="M31 16 V32 L41 38" fill="none" stroke={C.bone} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
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
        <svg width={50} height={64} viewBox="0 0 50 64">
          <path d="M25 60 C25 60 4 36 4 22 A21 21 0 0 1 46 22 C46 36 25 60 25 60 Z" fill={C.red} />
          <circle cx={25} cy={22} r={8} fill={C.bone} />
        </svg>
        {EVENT.place}
      </div>

      <div style={{ ...at(6), marginTop: 56 }}>
        <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: "0.3em", textTransform: "uppercase", color: C.dim }}>{EVENT.withLine}</div>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "center", alignItems: "center", gap: 44 }}>
          {/* The Astral mark's "ASTRAL" is slate, built for a mid-tone ground: a thin
              light edge keeps it legible on ink without recolouring the logo. */}
          <Img
            src={staticFile(`${ASSET_DIR}/${EVENT.logoA}`)}
            style={{ height: 72, filter: "drop-shadow(0 0 1.5px rgba(237,231,218,.95)) drop-shadow(0 0 1px rgba(237,231,218,.8)) drop-shadow(0 0 14px rgba(237,231,218,.25))" }}
          />
          <span style={{ fontWeight: 800, fontSize: 48, color: C.dim }}>×</span>
          <Img src={staticFile(`${ASSET_DIR}/${EVENT.logoB}`)} style={{ height: 150 }} />
        </div>
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
      <ShotTrack />

      {/* The cards sit on a darker plate than the photo's own grade. */}
      {f >= CUE.end.from ? <AbsoluteFill style={{ background: "rgba(12,13,15,.6)" }} /> : null}
      <Role f={f} fps={fps} />
      <Clues f={f} fps={fps} />
      <Notes f={f} />
      <Vote f={f} fps={fps} />
      <Twist f={f} />
      {inRange(f, { from: CUE.reveal, to: CUE.reveal + 20 }) ? <Flash frame={f} at={CUE.reveal} color={C.red} peak={0.55} tau={7} /> : null}
      <End f={f} fps={fps} />
      <Event f={f} fps={fps} />
      {inRange(f, { from: CUE.event.from, to: CUE.event.from + 12 }) ? <Flash frame={f} at={CUE.event.from} color={C.bone} peak={0.22} tau={3} /> : null}

      {step ? <StepChip frame={f - step.from} step={step.step} first={step.step === 1} /> : null}
      <Captions frame={f} caps={CAPTIONS} fps={fps} />
      <Strike f={f} />
      <Film frame={f} />
    </AbsoluteFill>
  );
};
