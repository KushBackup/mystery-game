import React, { useState } from 'react';
import { CASE_META } from '../../data/gameData';
import {
  HOST_DECK,
  HOST_FAST_ANSWERS,
  HOST_KILLER_JOBS,
  HOST_MATERIALS,
  HOST_REFERENCE_SUMMARY,
  HOST_REFERENCE_TABS,
  HOST_ROUND_GUIDE,
  HOST_SCRIPT,
  HOST_SUSPECT_ROSTER,
  HOST_WITNESS_LANES,
} from '../../data/hostReference';
import { Numeral } from '../ui/Numeral';

const BackButton = ({ onBack }) => (
  <button
    type="button"
    onClick={onBack}
    className="er-touch inline-flex items-center gap-2 er-mono er-mono--hot er-mono--wide"
  >
    <span aria-hidden="true">←</span>
    Back to console
  </button>
);

const Block = ({ label, meta, children, signal = false }) => (
  <section className={`er-card ${signal ? 'er-card--signal' : ''}`}>
    <div className="flex items-baseline justify-between gap-3">
      <p className={`er-mono er-mono--wide ${signal ? 'er-mono--hot' : 'er-mono--bone'}`}>{label}</p>
      {meta && <span className="er-mono er-mono--dim">{meta}</span>}
    </div>
    <div className="er-rule mt-3 mb-4" />
    {children}
  </section>
);

const NoteList = ({ items }) => (
  <ul className="er-list">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

const MiniTag = ({ children }) => (
  <span className="er-tag er-tag--mute">{children}</span>
);

export const HostReferenceView = ({ currentRound, onBack }) => {
  const [tab, setTab] = useState('overview');
  const [roundOverride, setRoundOverride] = useState(null);
  const [seenRound, setSeenRound] = useState(currentRound);

  if (seenRound !== currentRound) {
    setSeenRound(currentRound);
    setRoundOverride(null);
  }

  const roundTab = roundOverride ?? currentRound;
  const activeScript = HOST_SCRIPT.find((item) => item.id === roundTab) || HOST_SCRIPT[0];
  const activeGuide = HOST_ROUND_GUIDE[String(roundTab)] || HOST_ROUND_GUIDE.pregame;

  return (
    <div className="space-y-5">
      <BackButton onBack={onBack} />

      <div className="er-stat grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <Numeral as="p" value={CASE_META.playerCount} pad={2} className="er-stat__num" />
          <p className="er-stat__label">Guests</p>
        </div>
        <div>
          <Numeral as="p" value={CASE_META.primeSuspectCount} pad={2} className="er-stat__num" />
          <p className="er-stat__label">Suspects</p>
        </div>
        <div>
          <Numeral as="p" value={CASE_META.killerCount} pad={2} className="er-stat__num" />
          <p className="er-stat__label">Killers</p>
        </div>
        <div>
          <Numeral as="p" value={currentRound} pad={2} className="er-stat__num" />
          <p className="er-stat__label">Live round</p>
        </div>
      </div>

      <Block label={HOST_REFERENCE_SUMMARY.title} meta={CASE_META.venue} signal>
        <p className="font-body text-[15px] leading-[1.55] text-dim mt-0">
          {HOST_REFERENCE_SUMMARY.strap}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <MiniTag>{CASE_META.date}</MiniTag>
          <MiniTag>{CASE_META.brand}</MiniTag>
          <MiniTag>Case {CASE_META.caseId}</MiniTag>
        </div>
      </Block>

      <div className="flex flex-wrap gap-2">
        {HOST_REFERENCE_TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`er-touch px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] border ${
                active
                  ? 'bg-signal border-signal text-white er-touch--hot'
                  : 'bg-ink-hover border-line text-dim hover:border-signal'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <Block label="Event shape">
            <NoteList items={HOST_REFERENCE_SUMMARY.event} />
          </Block>

          <Block label="Host principles">
            <NoteList items={HOST_REFERENCE_SUMMARY.principles} />
          </Block>

          <Block label="Prime suspect roster" meta="Public lanes vs truth">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {HOST_SUSPECT_ROSTER.map((suspect) => (
                <article key={suspect.name} className="bg-ink-hover border border-line p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-typewriter font-bold uppercase text-bone text-[18px] leading-[1.15]">
                      {suspect.name}
                    </h3>
                    <span className="er-mono er-mono--dim">{suspect.group}</span>
                  </div>
                  <p className="font-body text-[14px] leading-[1.5] text-dim mt-3">{suspect.lane}</p>
                  <p className="mt-3"><MiniTag>{suspect.status}</MiniTag></p>
                </article>
              ))}
            </div>
          </Block>

          <Block label="Killer jobs" meta="The five-part mechanism">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {HOST_KILLER_JOBS.map((job, index) => (
                <article key={job.name} className={`er-card ${index === 0 ? 'er-card--signal' : ''}`}>
                  <p className={`er-mono er-mono--wide ${index === 0 ? 'er-mono--hot' : 'er-mono--bone'}`}>{job.job}</p>
                  <h3 className="font-typewriter font-bold uppercase text-bone text-[18px] leading-[1.15] mt-3">
                    {job.name}
                  </h3>
                  <p className="er-mono er-mono--dim mt-1.5">{job.group}</p>
                  <p className="font-body text-[14px] leading-[1.5] text-dim mt-3">{job.proof}</p>
                </article>
              ))}
            </div>
          </Block>
        </div>
      )}

      {tab === 'rounds' && (
        <div className="space-y-4">
          <Block label="Live round playbook" meta={activeScript.title} signal>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {HOST_SCRIPT.map((item) => {
                const active = roundTab === item.id;
                const live = currentRound === item.id;
                return (
                  <button
                    key={String(item.id)}
                    type="button"
                    onClick={() => setRoundOverride(item.id)}
                    className={`er-touch px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] border ${
                      active
                        ? 'bg-signal border-signal text-white er-touch--hot'
                        : live
                          ? 'bg-ink-hover border-brass text-brass'
                          : 'bg-ink-hover border-line text-dim hover:border-signal'
                    }`}
                  >
                    {item.id === 'pregame' ? 'Pre' : `R${item.id}`}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <div>
                <p className="er-mono er-mono--dim">Objective</p>
                <p className="font-body text-[15px] leading-[1.55] text-dim mt-1.5">{activeGuide.objective}</p>
              </div>
              <div>
                <p className="er-mono er-mono--dim">Host actions</p>
                <NoteList items={activeGuide.actions} />
              </div>
              <div>
                <p className="er-mono er-mono--dim">What to emphasize</p>
                <NoteList items={activeGuide.emphasize} />
              </div>
              {activeGuide.prompts?.length > 0 && (
                <div>
                  <p className="er-mono er-mono--dim">Good prompts</p>
                  <NoteList items={activeGuide.prompts} />
                </div>
              )}
              {activeGuide.watchFor?.length > 0 && (
                <div>
                  <p className="er-mono er-mono--dim">Watch for</p>
                  <NoteList items={activeGuide.watchFor} />
                </div>
              )}
              {activeGuide.witnessNudges?.length > 0 && (
                <div>
                  <p className="er-mono er-mono--dim">Witness nudges</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeGuide.witnessNudges.map((name) => (
                      <MiniTag key={name}>{name}</MiniTag>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="er-mono er-mono--dim">Announce</p>
                <p className="font-body text-[15px] leading-[1.55] text-bone bg-ink-hover border-l-2 border-signal pl-3 py-2 mt-1.5 whitespace-pre-line">
                  {activeScript.announce}
                </p>
              </div>
              <div>
                <p className="er-mono er-mono--dim">Advance when</p>
                <p className="font-body text-[15px] leading-[1.55] text-dim mt-1.5">{activeGuide.advanceWhen}</p>
              </div>
            </div>
          </Block>
        </div>
      )}

      {tab === 'witnesses' && (
        <div className="space-y-4">
          {HOST_WITNESS_LANES.map((lane) => (
            <Block key={lane.id} label={lane.title} meta={lane.cue}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {lane.witnesses.map((witness) => (
                  <article key={witness.name} className="bg-ink-hover border border-line p-4">
                    <p className="er-mono er-mono--bone">{witness.name}</p>
                    <p className="font-body text-[14px] leading-[1.5] text-dim mt-2">{witness.clue}</p>
                  </article>
                ))}
              </div>
            </Block>
          ))}
        </div>
      )}

      {tab === 'deck' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {HOST_DECK.counts.map((item) => (
              <div key={item.label} className="er-stat">
                <Numeral as="p" value={item.value} pad={2} className="er-stat__num" />
                <p className="er-stat__label">{item.label}</p>
              </div>
            ))}
          </div>

          <Block label="Materials checklist">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="er-mono er-mono--dim">Required</p>
                <NoteList items={HOST_MATERIALS.required} />
              </div>
              <div>
                <p className="er-mono er-mono--dim">Helpful</p>
                <NoteList items={HOST_MATERIALS.helpful} />
              </div>
            </div>
          </Block>

          <Block label="Clue manifest" meta="Codes and targets">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="er-mono er-mono--dim">Round 1 · Accusations</p>
                <div className="space-y-2 mt-3">
                  {HOST_DECK.accusations.map((clue) => (
                    <div key={clue.code} className="bg-ink-hover border border-line px-3 py-2.5">
                      <p className="er-mono er-mono--bone">{clue.code}</p>
                      <p className="font-body text-[13px] leading-[1.45] text-dim mt-1.5">
                        {clue.target} · {clue.count} copies
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="er-mono er-mono--dim">Round 2 · Motives</p>
                  <div className="space-y-2 mt-3">
                    {HOST_DECK.motives.map((clue) => (
                      <div key={clue.code} className="bg-ink-hover border border-line px-3 py-2.5">
                        <p className="er-mono er-mono--bone">{clue.code}</p>
                        <p className="font-body text-[13px] leading-[1.45] text-dim mt-1.5">{clue.target}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="er-mono er-mono--dim">Round 3 · Evidence</p>
                  <div className="space-y-2 mt-3">
                    {HOST_DECK.evidence.map((clue) => (
                      <div key={clue.code} className="bg-ink-hover border border-line px-3 py-2.5">
                        <p className="er-mono er-mono--bone">{clue.code}</p>
                        <p className="font-body text-[13px] leading-[1.45] text-dim mt-1.5">{clue.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="er-mono er-mono--dim">Rounds 4–5 · Revelations</p>
                  <div className="space-y-2 mt-3">
                    {HOST_DECK.revelations.map((clue) => (
                      <div key={clue.code} className="bg-ink-hover border border-line px-3 py-2.5">
                        <p className="er-mono er-mono--bone">{clue.code}</p>
                        <p className="font-body text-[13px] leading-[1.45] text-dim mt-1.5">{clue.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Block>
        </div>
      )}

      {tab === 'questions' && (
        <div className="space-y-4">
          {HOST_FAST_ANSWERS.map((item, index) => (
            <Block key={item.question} label={item.question} meta={index < 4 ? 'Likely objection' : 'Useful redirect'}>
              <div className="space-y-4">
                <div>
                  <p className="er-mono er-mono--dim">Before Round 5</p>
                  <p className="font-body text-[15px] leading-[1.55] text-dim mt-1.5">{item.before}</p>
                </div>
                <div>
                  <p className="er-mono er-mono--dim">After Round 5 / 6</p>
                  <p className="font-body text-[15px] leading-[1.55] text-bone bg-ink-hover border-l-2 border-signal pl-3 py-2 mt-1.5">{item.after}</p>
                </div>
              </div>
            </Block>
          ))}
        </div>
      )}
    </div>
  );
};
