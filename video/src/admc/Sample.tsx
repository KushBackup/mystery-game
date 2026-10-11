/**
 * Sample.tsx — a 5s Minecraft sample in the footage-reel-ad look, with no footage.
 *
 * The caption system, flashes and film layer are the ad60 kit, unchanged: Inter
 * Tight 800/900 words popping as they land, one phrase in a red box that grows
 * word by word, the "!" XL punch line. The picture is drawn: isometric voxel
 * blocks with seeded pixel textures, given the same lens (push + cut kick) and
 * grades as real footage, so the cut behaves like a footage reel.
 *
 *   0.0s  world   bright voxel landscape     "Same old / *Minecraft* world?"
 *   1.6s  block   one grass block, close     "Build it / !*bigger.*"   kick + red flash
 *   3.3s  plate   the world, plate grade     CTA card: Your world, *your rules.* + button
 */

import React from "react";
import { AbsoluteFill, Audio, Sequence, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CAP_SHADOW, Caption, Film, Flash, SANS } from "../ad60/kit";
import { C } from "../ad60/theme";
import { prog } from "../ad60/fx";
import { DEFAULT_ORIGIN, PUSH, lensScale } from "../ad60/lens";
import { REEL } from "./config";
import { CAPTIONS, CUE, SHOTS } from "./timeline";

const FILTER = {
  warm: "contrast(1.08) saturate(1.04) brightness(1.02)",
  plate: "contrast(1.05) saturate(0.7) brightness(0.5) blur(10px)",
} as const;

// ------------------------------------------------------------------ voxels ---

type Kind = "grass" | "dirt" | "stone" | "log" | "leaves";

const PAL: Record<Kind, { top: string[]; side: string[]; cap?: string[] }> = {
  grass: { top: ["#5FA03A", "#6CB044", "#548F33", "#79BC4E"], side: ["#8B5A2B", "#7A4E25", "#966B3D", "#6E4420"], cap: ["#5FA03A", "#6CB044", "#548F33"] },
  dirt: { top: ["#8B5A2B", "#7A4E25", "#966B3D"], side: ["#8B5A2B", "#7A4E25", "#966B3D", "#6E4420"] },
  stone: { top: ["#8A8A8A", "#7B7B7B", "#959595", "#6F6F6F"], side: ["#8A8A8A", "#7B7B7B", "#959595", "#6F6F6F"] },
  log: { top: ["#A3824D", "#8E6E3E", "#B39159"], side: ["#6B4F2A", "#5A4123", "#7A5B32"] },
  leaves: { top: ["#3E8A2E", "#357A27", "#4C9A38", "#2E6B21"], side: ["#3E8A2E", "#357A27", "#4C9A38", "#2E6B21"] },
};

/** One 8×8 pixel face, mapped onto a parallelogram by an SVG matrix. */
const Face: React.FC<{ m: string; kind: Kind; seed: string; shade: number; side: boolean }> = ({ m, kind, seed, shade, side }) => {
  const p = PAL[kind];
  const px = [];
  for (let v = 0; v < 8; v++)
    for (let u = 0; u < 8; u++) {
      // Grass sides keep a green lip that drips 1-3 pixels down.
      const lip = side && p.cap && v < 2 + Math.floor(random(`${seed}-lip-${u}`) * 2);
      const set = side ? (lip ? p.cap! : p.side) : p.top;
      const col = set[Math.floor(random(`${seed}-${u}-${v}`) * set.length)];
      px.push(<rect key={`${u}-${v}`} x={u / 8} y={v / 8} width={1 / 8 + 0.004} height={1 / 8 + 0.004} fill={col} />);
    }
  return (
    <g transform={m}>
      {px}
      {shade > 0 ? <rect width={1} height={1} fill="#000" opacity={shade} /> : null}
    </g>
  );
};

/** An isometric cube whose top vertex sits at (x, y), edge `s` px. */
const Cube: React.FC<{ x: number; y: number; s: number; kind: Kind; seed: string }> = ({ x, y, s, kind, seed }) => {
  const a = s * 0.866;
  const b = s * 0.5;
  return (
    <g>
      <Face m={`matrix(${a} ${b} ${-a} ${b} ${x} ${y})`} kind={kind} seed={`${seed}t`} shade={0} side={false} />
      <Face m={`matrix(${a} ${b} 0 ${s} ${x - a} ${y + b})`} kind={kind} seed={`${seed}l`} shade={0.18} side />
      <Face m={`matrix(${a} ${-b} 0 ${s} ${x} ${y + 2 * b})`} kind={kind} seed={`${seed}r`} shade={0.36} side />
    </g>
  );
};

type Vox = { i: number; j: number; k: number; kind: Kind };

/** A seeded little island: grass terrain over dirt and stone, two trees. */
const WORLD: Vox[] = (() => {
  const out: Vox[] = [];
  const N = 9;
  const h = (i: number, j: number) => 1 + Math.round(1.6 * random(`h-${Math.floor(i / 2)}-${Math.floor(j / 2)}`));
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const top = h(i, j);
      for (let k = 0; k <= top; k++) out.push({ i, j, k, kind: k === top ? "grass" : k === 0 ? "stone" : "dirt" });
    }
  for (const [ti, tj] of [[2, 6], [6, 2]]) {
    const base = h(ti, tj) + 1;
    for (let k = base; k < base + 3; k++) out.push({ i: ti, j: tj, k, kind: "log" });
    for (let di = -1; di <= 1; di++)
      for (let dj = -1; dj <= 1; dj++)
        for (let k = base + 2; k <= base + 3; k++) {
          if (di === 0 && dj === 0 && k === base + 2) continue;
          if (k === base + 3 && Math.abs(di) + Math.abs(dj) === 2) continue;
          out.push({ i: ti + di, j: tj + dj, k, kind: "leaves" });
        }
  }
  // Painter's order: back to front, bottom to top.
  return out.sort((p, q) => p.i + p.j - (q.i + q.j) || p.k - q.k || p.i - q.i);
})();

const Sky: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #5B9BF0 0%, #8CC0FA 45%, #CFE6FF 100%)" }}>
    {/* The square sun and flat clouds, drifting. */}
    <div style={{ position: "absolute", left: 760, top: 300, width: 150, height: 150, background: "#FFF3B0", boxShadow: "0 0 120px 40px rgba(255,240,170,.55)" }} />
    {[
      [80, 360, 260],
      [560, 520, 320],
      [-120, 640, 220],
    ].map(([x, y, w], i) => (
      <div key={i} style={{ position: "absolute", left: x + frame * (0.6 + i * 0.3), top: y, width: w, height: 56, background: "rgba(255,255,255,.92)", boxShadow: `${w * 0.3}px -40px 0 -6px rgba(255,255,255,.92)` }} />
    ))}
  </AbsoluteFill>
);

/** The world shot: the island, centred low so the top half is free for words. */
const World: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 80;
  const ox = 540;
  const oy = 1000;
  return (
    <AbsoluteFill>
      <Sky frame={frame} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {WORLD.map((v, n) => (
          <Cube key={n} kind={v.kind} seed={`w${v.i}-${v.j}-${v.k}`} s={s} x={ox + (v.i - v.j) * s * 0.866} y={oy + (v.i + v.j) * s * 0.5 - v.k * s} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** The block shot: one grass block, close, turning slowly into frame. */
const Block: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 330;
  const bob = Math.sin(frame / 9) * 10;
  return (
    <AbsoluteFill>
      <Sky frame={frame + 60} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={540} cy={1530} rx={300} ry={60} fill="rgba(0,0,0,.18)" />
        <Cube kind="grass" seed="hero" s={s} x={540} y={880 + bob} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the reel ---

/** A drawn shot gets the footage lens: the slow push plus the +4.5% kick on the cut. */
const Lens: React.FC<{ f: number; dur: number; grade: keyof typeof FILTER; children: React.ReactNode }> = ({ f, dur, grade, children }) => (
  <AbsoluteFill style={{ transformOrigin: DEFAULT_ORIGIN, scale: lensScale(f, dur, PUSH.clip, 1).toFixed(5), filter: FILTER[grade] }}>{children}</AbsoluteFill>
);

const Arrow: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ marginLeft: 18 }}>
    <path d="M4 12h14M12 5l7 7-7 7" stroke={C.bone} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Chevron: React.FC = () => (
  <svg width={30} height={30} viewBox="0 0 24 24" style={{ marginLeft: 10, verticalAlign: "middle" }}>
    <path d="M6 9l6 6 6-6" stroke={C.bone} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** The CTA card: the question pays off the hook, then the one action as a red pill. */
const Cta: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const btn = prog(frame, CUE.button, 10);
  const tap = prog(frame, CUE.tap, 8);
  const bobY = Math.sin((frame - CUE.tap) / 4) * 6;
  return (
    <AbsoluteFill>
      {/* CTA type per the design system: 104/800 question, 132/900 boxed answer. */}
      <Caption frame={frame} fps={fps} wordAt={CUE.ctaWords.slice(0, 2)} text="Your world," y={560} scale={104 / 90} />
      <Caption frame={frame} fps={fps} wordAt={CUE.ctaWords.slice(2, 3)} text="!*your rules.*" y={700} scale={132 / 236} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", opacity: btn, scale: `${(0.8 + 0.2 * btn).toFixed(4)}` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: C.red,
            color: C.bone,
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 66,
            letterSpacing: "-0.02em",
            padding: "26px 54px 28px",
            borderRadius: 999,
            boxShadow: "0 18px 50px rgba(0,0,0,.45)",
          }}
        >
          Start building
          <Arrow size={58} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1080 + bobY,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 30,
          color: C.bone,
          opacity: tap,
          textShadow: CAP_SHADOW,
        }}
      >
        Tap below to play
        <Chevron />
      </div>
    </AbsoluteFill>
  );
};

export const Sample: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [world, block, plate] = SHOTS;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Sequence from={world.from} durationInFrames={world.dur} name="world" layout="absolute-fill">
        <Lens f={frame - world.from} dur={world.dur} grade="warm">
          <World frame={frame} />
        </Lens>
      </Sequence>
      <Sequence from={block.from} durationInFrames={block.dur} name="block" layout="absolute-fill">
        <Lens f={frame - block.from} dur={block.dur} grade="warm">
          <Block frame={frame - block.from} />
        </Lens>
      </Sequence>
      <Sequence from={plate.from} durationInFrames={plate.dur} name="plate" layout="absolute-fill">
        <Lens f={frame - plate.from} dur={plate.dur} grade="plate">
          <World frame={frame} />
        </Lens>
      </Sequence>

      {/* Section flashes on new sections; the red hit on the punch word. */}
      {SHOTS.filter((s) => s.section).map((s) => (
        <Flash key={s.name} frame={frame} at={s.from} color={C.bone} peak={0.28} tau={3} />
      ))}
      <Flash frame={frame} at={CUE.punch} color={C.red} peak={0.55} tau={7} />

      {CAPTIONS.map((c, i) =>
        frame >= c.from && frame < c.to ? <Caption key={i} frame={frame} fps={fps} wordAt={[...c.wordAt]} text={c.text} y={c.y} /> : null,
      )}
      {frame >= CUE.cta ? <Cta frame={frame} fps={fps} /> : null}

      <Film frame={frame} />
      {withAudio ? <Audio src={staticFile(`${REEL.assets}/audio.wav`)} /> : null}
    </AbsoluteFill>
  );
};
