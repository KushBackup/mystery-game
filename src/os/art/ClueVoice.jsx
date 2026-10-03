/**
 * ClueVoice: a voice note from an unknown number. Someone heard the killer.
 *
 * There is no audio in this repo, so the note is its waveform and its
 * transcript: play sweeps the waveform for its length, the way an old phone
 * draws a note playing, with a soft synthesized hiss under it. The transcript
 * is the pack's `evidence.voice` line, which hears the group ("hard heels"),
 * never sees a shoe.
 */
import React, { useEffect, useState } from 'react';
import { hashString } from './pixels.js';
import { VOICE_SECONDS } from '../evidence.js';
import { sfxStatic } from '../sfx.js';

const BARS = 34;

function wave(seed) {
  let h = hashString(seed);
  return Array.from({ length: BARS }, (_, i) => {
    h = (Math.imul(h ^ (h >>> 15), 2246822519) + 3) >>> 0;
    const env = Math.sin((i / (BARS - 1)) * Math.PI) * 0.6 + 0.4;
    return Math.round((0.2 + (h % 100) / 125) * env * 100);
  });
}

export default function ClueVoice({ seed = '', transcript = '', thumb = false }) {
  const [playing, setPlaying] = useState(false);
  const heights = wave(seed);

  useEffect(() => {
    if (!playing) return undefined;
    const t = setTimeout(() => setPlaying(false), VOICE_SECONDS * 1000);
    return () => clearTimeout(t);
  }, [playing]);

  if (thumb) {
    return (
      <div className="ev-voice is-thumb" role="img" aria-label="A voice note">
        <span className="ev-voice__mic" aria-hidden="true">●</span>
        <span className="ev-voice__wave" aria-hidden="true">
          {heights.slice(0, 14).map((v, i) => <i key={i} style={{ height: `${v}%` }} />)}
        </span>
      </div>
    );
  }

  return (
    <div className={`ev-voice ${playing ? 'is-playing' : ''}`}>
      <div className="ev-voice__row">
        <button
          type="button"
          className="ev-voice__play"
          aria-label={playing ? 'Playing' : 'Play voice note'}
          onClick={() => { if (!playing) { sfxStatic(); setPlaying(true); } }}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <span className="ev-voice__wave" aria-hidden="true" style={{ '--ev-dur': `${VOICE_SECONDS}s` }}>
          {heights.map((v, i) => <i key={i} style={{ height: `${v}%` }} />)}
        </span>
        <span className="ev-voice__len">0:0{VOICE_SECONDS}</span>
      </div>
      <p className="ev-voice__text">{transcript}</p>
    </div>
  );
}
