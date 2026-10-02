import React, { useState } from 'react';
import { AppFrame, Empty } from '../ui';
import CluePhoto from '../art/CluePhoto';
import Glyph from '../icons/Glyph';
import { clueWords } from '../../data/packs/index.js';
import { markSeen, useSeen } from '../seen';
import { photoSource } from '../words';
import Portrait from '../art/Portrait';
import { TRAITS } from '../../data/traits';

/**
 * Gallery: every clue this guest holds, as a surveillance still. The photo
 * says it in pictures, the caption in the pack's voice, and the plain line
 * underneath says exactly what it means, so nobody has to decode anything.
 *
 * A planted clue (the Killers' frame) looks exactly like any other. That is
 * the point of it.
 */
export default function GalleryApp({ ctx, onClose }) {
  const { inbox, pack, gid } = ctx;
  const photos = inbox
    .filter((d) => d.kind === 'fact' && d.fact)
    .sort((a, b) => (b.cycle - a.cycle) || String(a.id).localeCompare(String(b.id)));
  const [open, setOpen] = useState(null);
  const [dir, setDir] = useState(null);
  const seenIds = useSeen(`${gid}.gallery`, []);

  const view = (i) => {
    setDir(open == null ? 'push' : null);
    setOpen(i);
    if (!seenIds.includes(photos[i].id)) markSeen(`${gid}.gallery`, [...seenIds, photos[i].id]);
  };

  if (open != null && photos[open]) {
    const d = photos[open];
    const { flavour, plain } = clueWords(pack, d.fact);
    return (
      <AppFrame
        title={`Day ${d.cycle}`}
        onBack={() => { setDir('pop'); setOpen(null); }}
        backLabel="Camera Roll"
        tone="dark"
        dark
        enter={dir === 'push' ? 'push' : undefined}
        right={<span className="os-label text-[11px] text-os-chrome pr-1">{open + 1} of {photos.length}</span>}
      >
        <div className="bg-black">
          <CluePhoto fact={d.fact} seed={d.id} stamp={`D${d.cycle}`} />
        </div>
        <div className="px-4 pt-4 pb-6">
          <p className="os-label text-[11px] text-os-chrome">{photoSource(d).toUpperCase()}</p>
          <p className="text-[19px] leading-snug mt-2 os-selectable">{flavour}</p>
          <p className="mt-3 pt-3 border-t border-os-chrome/25 text-[15px] text-os-gold os-selectable">{plain}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 px-4 pb-6">
          <button type="button" className="os-btn os-btn--dark" disabled={open === 0} onClick={() => view(open - 1)}><Glyph name="back" size={12} /> Newer</button>
          <button type="button" className="os-btn os-btn--dark" disabled={open === photos.length - 1} onClick={() => view(open + 1)}>Older <Glyph name="forward" size={12} /></button>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame title="Camera Roll" onBack={onClose} tone="dark" dark enter={dir === 'pop' ? 'pop' : undefined}>
      {photos.length === 0 ? (
        <Empty glyph="photo" title="No photos yet" />
      ) : (
        <>
          <HandProfiles photos={photos} />
          <p className="os-label text-[11px] text-os-chrome px-3 pt-4">{photos.length} {photos.length === 1 ? 'PHOTO' : 'PHOTOS'} · TAP TO OPEN</p>
          <div className="grid grid-cols-3 gap-[3px] p-[3px] mt-2">
            {photos.map((d, i) => (
              <button key={d.id} type="button" className="relative block bg-black active:opacity-70" onClick={() => view(i)} aria-label={`Photo from day ${d.cycle}`}>
                <CluePhoto fact={d.fact} seed={d.id} stamp={`D${d.cycle}`} />
                {!seenIds.includes(d.id) && <span className="absolute right-1 top-1 w-3 h-3 rounded-full bg-os-sea border border-white" aria-label="New" />}
                <span className="absolute left-1 bottom-1 os-label text-[10px] text-white bg-black/60 px-1">D{d.cycle}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </AppFrame>
  );
}

/**
 * What your photos add up to, night by night. Every clue from one night
 * describes the same hand (the Killer who hacked that night), so the groups
 * the photos name can be laid over each other: "dark" and "plain" leave
 * black, grey or navy. A sketch, drawn the way Contacts draws a guest, fills
 * in what is known. It never names anyone: matching it to the room is the
 * game. Two photos that cannot both be true mean one of them is a frame.
 */
function HandProfiles({ photos }) {
  const nights = [...new Set(photos.map((d) => d.cycle))].sort((a, b) => b - a);
  return (
    <div className="px-3 pt-3 space-y-2">
      {nights.map((c) => <HandProfile key={c} cycle={c} facts={photos.filter((d) => d.cycle === c).map((d) => d.fact)} />)}
    </div>
  );
}

function HandProfile({ cycle, facts }) {
  const known = [];
  for (const t of TRAITS) {
    const groups = facts.filter((f) => f.trait === t.id).map((f) => t.groups.find((g) => g.id === f.group)).filter(Boolean);
    if (!groups.length) continue;
    const left = t.options.filter((o) => groups.every((g) => g.members.includes(o.id)));
    known.push({ t, left });
  }
  const one = (id) => {
    const k = known.find((x) => x.t.id === id);
    return k?.left.length === 1 ? k.left[0].id : undefined;
  };
  const sketch = { top: one('top'), glasses: one('glasses') };
  return (
    <div className="os-hand">
      <div className="relative shrink-0">
        <Portrait traits={sketch} size={64} rounded={8} />
        <span className="os-hand__q" aria-hidden="true">?</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="os-label text-[11px] text-os-chrome">NIGHT {cycle} · THE HAND · {known.length} OF {TRAITS.length} KNOWN</p>
        <ul className="mt-1 space-y-0.5">
          {known.map(({ t, left }) => (
            <li key={t.id} className="text-[14px] leading-snug">
              <span className="text-os-chrome">{HAND_LABEL[t.id]}:</span>{' '}
              {left.length ? left.map((o) => o.label).join(', ') : <span className="text-os-red">photos disagree</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const HAND_LABEL = { top: 'Top', glasses: 'Glasses', shoes: 'Feet', drink: 'First drink', season: 'Birthday', siblings: 'Siblings' };
