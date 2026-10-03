import React, { useState } from 'react';
import { AppFrame, Empty } from '../ui';
import Evidence from '../art/Evidence';
import Glyph from '../icons/Glyph';
import { clueWords } from '../../data/packs/index.js';
import { markSeen, useSeen } from '../seen';
import { photoSource } from '../words';
import { mediaFor, FORM_NAME } from '../evidence';
import Portrait from '../art/Portrait';
import { TRAITS } from '../../data/traits';

/**
 * Photos: every clue this guest holds. A clue arrives as a CCTV still, a few
 * seconds of footage, a bar receipt, a leaked screenshot or a voice note
 * (os/evidence.js picks); each says exactly the same kind of thing. The
 * caption is in the pack's voice, and the plain line underneath says exactly
 * what it means, so nobody has to decode anything.
 *
 * A planted clue (the Killers' frame) looks exactly like any other. That is
 * the point of it.
 *
 * A ghost has a second album, The Room: every clue the living got last night
 * and who got it (ctx.ghostSight, host-written, readable by ghosts only). It
 * is how the dead catch a living guest lying about their clue.
 */
export default function GalleryApp({ ctx, onClose }) {
  const { inbox, pack, gid, me, nameOf } = ctx;
  const mine = inbox
    .filter((d) => d.kind === 'fact' && d.fact)
    .sort((a, b) => (b.cycle - a.cycle) || String(a.id).localeCompare(String(b.id)));
  const room = me?.status === 'ghost' ? roomItems(ctx.ghostSight) : [];
  const [album, setAlbum] = useState('mine');
  const photos = album === 'room' ? room : mine;
  const [open, setOpen] = useState(null);
  const [dir, setDir] = useState(null);
  const seenIds = useSeen(`${gid}.gallery`, []);
  const witnesses = paperWitnesses(ctx.news);

  const view = (i) => {
    setDir(open == null ? 'push' : null);
    setOpen(i);
    if (album === 'mine' && !seenIds.includes(photos[i].id)) markSeen(`${gid}.gallery`, [...seenIds, photos[i].id]);
  };

  if (open != null && photos[open]) {
    const d = photos[open];
    const form = mediaFor(d);
    const { flavour, plain } = clueWords(pack, d.fact, form);
    const source = album === 'room' ? `Sent to ${nameOf(d.to)} · ${photoSource(d, nameOf)}` : photoSource(d, nameOf);
    return (
      <AppFrame
        title={`Day ${d.cycle}`}
        onBack={() => { setDir('pop'); setOpen(null); }}
        backLabel={album === 'room' ? 'The Room' : 'Camera Roll'}
        tone="dark"
        dark
        enter={dir === 'push' ? 'push' : undefined}
        right={<span className="os-label text-[11px] text-os-chrome pr-1">{open + 1} of {photos.length}</span>}
      >
        <div className="bg-black">
          <Evidence key={d.id} fact={d.fact} seed={d.id} pack={pack} stamp={`D${d.cycle}`} />
        </div>
        <div className="px-4 pt-4 pb-6">
          <p className="os-label text-[11px] text-os-chrome">{FORM_NAME[form].toUpperCase()} · {source.toUpperCase()}</p>
          {album === 'room' && (
            <div className="flex items-center gap-2 mt-2">
              <Portrait traits={ctx.traits?.[d.to]} seed={d.to} size={28} rounded={6} />
              <span className="text-[15px]">{nameOf(d.to)} got this</span>
            </div>
          )}
          {form !== 'voice' && <p className="text-[19px] leading-snug mt-2 os-selectable">{flavour}</p>}
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
    <AppFrame title={album === 'room' ? 'The Room' : 'Camera Roll'} onBack={onClose} tone="dark" dark enter={dir === 'pop' ? 'pop' : undefined}>
      {me?.status === 'ghost' && (
        <div className="os-seg-wrap">
          <div className="os-seg" role="tablist" aria-label="Albums">
            {[['mine', 'Mine'], ['room', 'The Room']].map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={album === key} onClick={() => { setAlbum(key); setOpen(null); }}>{label}</button>
            ))}
          </div>
        </div>
      )}
      {album === 'mine' && (mine.length > 0 || witnesses.length > 0) && <HandProfiles photos={mine} witnesses={witnesses} />}
      {photos.length === 0 ? (
        <Empty glyph="photo" title={album === 'room' ? 'Nothing from last night yet' : 'No photos yet'} />
      ) : (
        <>
          <p className="os-label text-[11px] text-os-chrome px-3 pt-4">{photos.length} {photos.length === 1 ? 'ITEM' : 'ITEMS'} · TAP TO OPEN</p>
          <div className="grid grid-cols-3 gap-[3px] p-[3px] mt-2">
            {photos.map((d, i) => (
              <button key={d.id} type="button" className="relative block bg-black active:opacity-70" onClick={() => view(i)} aria-label={`${FORM_NAME[mediaFor(d)]} from day ${d.cycle}${album === 'room' ? `, sent to ${nameOf(d.to)}` : ''}`}>
                <Evidence fact={d.fact} seed={d.id} pack={pack} stamp={`D${d.cycle}`} thumb />
                {album === 'mine' && !seenIds.includes(d.id) && <span className="absolute right-1 top-1 w-3 h-3 rounded-full bg-os-sea border border-white" aria-label="New" />}
                {album === 'room'
                  ? <span className="absolute left-1 top-1"><Portrait traits={ctx.traits?.[d.to]} seed={d.to} size={22} rounded={4} /></span>
                  : null}
                <span className="absolute left-1 bottom-1 os-label text-[10px] text-white bg-black/60 px-1">D{d.cycle}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </AppFrame>
  );
}

/** The Room album: ghostSight docs flattened, newest night first. */
function roomItems(sight) {
  return (sight ?? [])
    .flatMap((doc) => (doc.items ?? []).map((it, i) => ({ ...it, kind: 'fact', cycle: doc.cycle, id: it.id ?? `sight-${doc.cycle}-${i}` })))
    .filter((d) => d.fact)
    .sort((a, b) => (b.cycle - a.cycle) || String(a.id).localeCompare(String(b.id)));
}

/** The paper's witnesses (news.js), one per day, already past their reveal. */
function paperWitnesses(news) {
  return (news?.room ?? []).filter((s) => s.witness).map((s) => ({ cycle: s.day, fact: s.witness }));
}

/**
 * What your clues add up to, night by night. Every clue from one night
 * describes the same hand (the Killer who hacked that night), so the groups
 * the clues name can be laid over each other: "dark" and "plain" leave
 * black, grey or navy. The paper's witness for that night counts too, since
 * everyone has read it. A sketch, drawn the way Contacts draws a guest, fills
 * in what is known. It never names anyone: matching it to the room is the
 * game. Two clues that cannot both be true mean one of them is a frame.
 */
function HandProfiles({ photos, witnesses }) {
  const nights = [...new Set([...photos.map((d) => d.cycle), ...witnesses.map((w) => w.cycle)])].sort((a, b) => b - a);
  return (
    <div className="px-3 pt-3 space-y-2">
      {nights.map((c) => (
        <HandProfile
          key={c}
          cycle={c}
          facts={[...photos.filter((d) => d.cycle === c).map((d) => d.fact), ...witnesses.filter((w) => w.cycle === c).map((w) => w.fact)]}
          paper={witnesses.some((w) => w.cycle === c)}
        />
      ))}
    </div>
  );
}

function HandProfile({ cycle, facts, paper }) {
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
        <Portrait traits={sketch} seed={`hand-${cycle}`} mystery size={64} rounded={8} />
        <span className="os-hand__q" aria-hidden="true">?</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="os-label text-[11px] text-os-chrome">NIGHT {cycle} · THE HAND · {known.length} OF {TRAITS.length} KNOWN</p>
        <ul className="mt-1 space-y-0.5">
          {known.map(({ t, left }) => (
            <li key={t.id} className="text-[14px] leading-snug">
              <span className="text-os-chrome">{HAND_LABEL[t.id]}:</span>{' '}
              {left.length ? left.map((o) => o.label).join(', ') : <span className="text-os-red">clues disagree</span>}
            </li>
          ))}
        </ul>
        {paper && <p className="os-label text-[10px] text-os-chrome mt-1">INCLUDES THE PAPER’S WITNESS</p>}
      </div>
    </div>
  );
}

const HAND_LABEL = { top: 'Top', glasses: 'Glasses', shoes: 'Feet', drink: 'First drink', season: 'Birthday', siblings: 'Siblings' };
