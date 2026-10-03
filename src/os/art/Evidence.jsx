/**
 * Evidence: draws one clue in the form os/evidence.js picked for it.
 *
 *   <Evidence fact={d.fact} seed={d.id} pack={pack} stamp="D2" />          full size
 *   <Evidence fact={d.fact} seed={d.id} pack={pack} stamp="D2" thumb />    camera-roll tile
 *
 * A tile shows a still for a clip (with a ▶ and its length), so a grid of
 * thirty never plays thirty videos at once. `form` overrides the pick.
 */
import React from 'react';
import CluePhoto from './CluePhoto';
import ClueClip from './ClueClip';
import ClueVoice from './ClueVoice';
import { Receipt, AdminProfile } from './ClueDoc';
import { formFor, CLIP_SECONDS, VOICE_SECONDS } from '../evidence.js';
import { clueWords, PACKS, DEFAULT_PACK_ID } from '../../data/packs/index.js';
import './evidence.css';

export default function Evidence({ fact, seed = '', pack: given, stamp, form, thumb = false }) {
  const kind = form ?? formFor(fact, seed);
  // A pack without its own evidence words (greenr predates them) borrows DEEP BLUE's, like dayKit.
  const pack = given?.evidence ? given : { ...given, evidence: PACKS[DEFAULT_PACK_ID].evidence };
  if (kind === 'clip') {
    if (thumb) {
      return (
        <div className="ev-tile">
          <CluePhoto fact={fact} seed={seed} stamp={stamp} />
          <span className="ev-badge" aria-label={`Video, ${CLIP_SECONDS} seconds`}>▶ 0:0{CLIP_SECONDS}</span>
        </div>
      );
    }
    return <ClueClip fact={fact} seed={seed} stamp={stamp} />;
  }
  if (kind === 'receipt') return <Tile thumb={thumb} label="Receipt"><Receipt fact={fact} seed={seed} pack={pack} thumb={thumb} /></Tile>;
  if (kind === 'profile') return <Tile thumb={thumb} label="Screenshot"><AdminProfile fact={fact} seed={seed} pack={pack} thumb={thumb} /></Tile>;
  if (kind === 'voice') {
    return (
      <Tile thumb={thumb} label={`Voice note, ${VOICE_SECONDS} seconds`} badge={`● 0:0${VOICE_SECONDS}`}>
        <ClueVoice seed={seed} transcript={clueWords(pack ?? {}, fact, 'voice').flavour} thumb={thumb} />
      </Tile>
    );
  }
  return <CluePhoto fact={fact} seed={seed} stamp={stamp} />;
}

function Tile({ thumb, label, badge, children }) {
  if (!thumb) return children;
  return (
    <div className="ev-tile ev-tile--doc">
      {children}
      <span className="ev-badge" aria-label={label}>{badge ?? label.toUpperCase()}</span>
    </div>
  );
}
