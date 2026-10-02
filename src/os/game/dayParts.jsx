import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { decode, paint } from './strokes';

/**
 * The pieces the word and drawing games share: the bar that says what to do
 * now, and a drawing at any size. Where the room is lives in dayStep.js.
 */

/** The strip under the nav bar: what to do now, and how long is left for it. */
export function StepBar({ label, left, hot = false }) {
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  return (
    <div className={`os-stepbar ${hot && left <= 10 ? 'os-stepbar--hot' : ''}`}>
      <span className="os-label text-[12px]">{label}</span>
      {left > 0 && <span className="os-stepbar__time">{mm}:{ss}</span>}
    </div>
  );
}

/** A drawing, painted once per change at the size it is shown. */
export function Sketch({ strokes, size = 140, className = '' }) {
  const ref = useRef(null);
  const parsed = useMemo(() => decode(strokes), [strokes]);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = size * dpr;
    c.height = size * dpr;
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(g, parsed, size);
  }, [parsed, size]);
  return <canvas ref={ref} className={`os-sketch ${className}`} style={{ width: size, height: size }} aria-label="A guest's drawing" />;
}
