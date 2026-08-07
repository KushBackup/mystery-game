import React from 'react';
import { DoodleCoffeeStain, DoodleCCTV } from '../ui/Doodles';
import { CASE_FILES } from '../../data/gameData';
import { TOOLTIPS } from '../../data/tooltips';
import { Numeral } from '../ui/Numeral';
import { InfoTip } from '../ui/InfoTip';

/**
 * The case-file archive — the lower region of the Evidence screen
 * (DESIGN_LANGUAGE.md §9, "Evidence").
 *
 * This was its own screen and its own tile ("Archives") until the two were
 * merged. They were the same act — reading a document you have been handed — and
 * splitting them meant the incident report lived on one tile while the clue the
 * player just decoded lived on another.
 *
 * Files the host has released are bone documents. Files still sealed are ghost
 * tags carrying their round number — a state that is not yet true, drawn as an
 * outline rather than a fill (§6.1).
 *
 * It carries no heading of its own: the Case files tab above it is the label, and
 * repeating it here would be a second name for the same stack.
 */
export const CaseFilesSection = ({ unlockedFiles = [] }) => {
  const availableFiles = CASE_FILES.filter((file) => unlockedFiles.includes(file.id));

  const lockedRounds = [0, 3, 4]
    .map((round) => ({
      round,
      pending: CASE_FILES.filter((f) => f.roundReq === round && !unlockedFiles.includes(f.id)).length,
    }))
    .filter((info) => info.pending > 0);

  return (
    <section className="space-y-5">
      {/* Stat */}
      <div className="er-stat flex items-end justify-between gap-4">
        <div>
          {/* Ticks when the host releases a batch mid-screen. */}
          <Numeral as="p" value={availableFiles.length} pad={2} className="er-stat__num" />
          {/* These are the one stack that needs no code, and a player who has
              spent the evening trading them will assume otherwise (§6.13). */}
          <p className="er-stat__label flex items-center gap-2">
            Released
            <InfoTip tip={TOOLTIPS.caseFiles} />
          </p>
        </div>
        <div className="text-right">
          <p className="er-stat__num">{String(CASE_FILES.length).padStart(2, '0')}</p>
          <p className="er-stat__label">On file</p>
        </div>
      </div>

      {/* Awaiting authorisation */}
      {lockedRounds.length > 0 && (
        <div className="er-card">
          <p className="er-mono er-mono--wide er-mono--bone">Awaiting authorisation</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {lockedRounds.map((info) => (
              <span key={info.round} className="er-tag er-tag--ghost">
                Round {String(info.round).padStart(2, '0')} · {info.pending}{' '}
                {info.pending === 1 ? 'file' : 'files'}
              </span>
            ))}
          </div>
          <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
            The host releases these as the investigation moves.
          </p>
        </div>
      )}

      {/* Nothing released yet */}
      {availableFiles.length === 0 && (
        <div className="er-card">
          <p className="er-mono er-mono--wide er-mono--bone">Archive empty</p>
          <p className="font-body text-[15px] leading-[1.55] text-dim mt-3">
            No case files have been released to the room yet.
          </p>
        </div>
      )}

      {/* Released files — paper */}
      {availableFiles.map((file, idx) => (
        <article
          key={file.id}
          className={`er-bone er-pin ${idx % 2 === 0 ? 'er-rotR' : 'er-rotL'} er-land p-5 sm:p-6`}
          style={{ animationDelay: `${Math.min(idx, 6) * 70}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="er-bone-label">
              {file.type === 'IMAGE' ? 'Photographic Exhibit' : 'Case Document'}
            </p>
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-body-bone/70">
              R{String(file.roundReq).padStart(2, '0')}
            </span>
          </div>
          <div className="er-bone-rule mt-2 mb-5" />

          {file.type === 'REPORT' && (
            <div className="relative">
              <DoodleCoffeeStain />
              <h3 className="font-typewriter font-bold uppercase text-ink text-[20px] sm:text-[24px] leading-[1.1]">
                {file.title}
              </h3>
              {file.date && (
                <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-body-bone/70 mt-2">
                  {file.date}
                </p>
              )}
              <p className="er-bone-body mt-4 whitespace-pre-line">{file.content}</p>
            </div>
          )}

          {file.type === 'IMAGE' && (
            <div>
              <h3 className="font-typewriter font-bold uppercase text-ink text-[20px] sm:text-[24px] leading-[1.1] mb-4">
                {file.title}
              </h3>

              {/* The print itself: an ink object sitting on the paper. */}
              <div className="bg-ink p-2 max-w-[260px] mx-auto">
                <div className="bg-bone-aged aspect-square w-full flex items-center justify-center overflow-hidden">
                  <DoodleCCTV type={file.sketchType} />
                </div>
                <p className="er-mono er-mono--dim text-center mt-2 mb-1">{file.title}</p>
              </div>

              {file.caption && (
                <p className="font-note text-[17px] leading-[1.35] text-ink mt-5 -rotate-1 origin-left">
                  “{file.caption}”
                </p>
              )}
            </div>
          )}
        </article>
      ))}
    </section>
  );
};
