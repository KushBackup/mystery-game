import React from 'react';
import { CASE_META, CASE_TIMELINE } from '../../data/gameData';

/**
 * The night, as this character lived it (DESIGN_LANGUAGE.md §9, "Timeline").
 *
 * The red thread (§6.8) is the spine — exactly one per screen, drawn in with a
 * scaleY sweep. Times are data, so they are brass. Critical moments are marked
 * with a signal dot rather than a coloured card, because red marks; it doesn't
 * fill (§2.2).
 *
 * The old screen ran indigo → purple → pink gradients and coloured emoji
 * chips; all of it is gone. Sequencing is now CSS stagger, not a timer.
 */

const CRITICAL = ['bar', 'spray', 'poison', 'collapse', 'lights', 'blind'];

const parseTimeline = (timelineText) => {
  if (!timelineText) return [];

  return timelineText
    .split('\n')
    .filter((line) => line.trim())
    .map((line, index) => {
      const timeMatch = line.match(/(\d{1,2}:\d{2}\s?[AP]M)/i);
      const time = timeMatch ? timeMatch[1] : null;
      const description = line
        .replace(timeMatch ? timeMatch[0] : '', '')
        .replace(/^[-–—]\s*/, '')
        .trim();

      return {
        id: index,
        time,
        description,
        isCritical: CRITICAL.some((word) => line.toLowerCase().includes(word)),
      };
    });
};

export const TimelineView = ({ myCharacter }) => {
  if (!myCharacter) return null;

  const timelineEvents = parseTimeline(myCharacter.timeline);
  const isMurderer = myCharacter.role === 'MURDERER';
  const canSeeMurderTimeline =
    isMurderer || myCharacter.role === 'SUSPECT';

  return (
    <div className="space-y-6">
      {/* Where and when */}
      <div className="er-card">
        <p className="er-mono er-mono--wide er-mono--bone">{myCharacter.name}</p>
        <p className="font-body text-[15px] leading-[1.55] text-dim mt-3">
          Your movements on the night of the incident.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="er-tag er-tag--mute">{CASE_META.venue}</span>
          <span className="er-tag er-tag--brass">{CASE_META.date}</span>
        </div>
      </div>

      {/* Your movements — the red thread is the spine */}
      {timelineEvents.length > 0 && (
        <section className="relative pl-6">
          <div
            className="er-thread"
            style={{ left: '3px', top: '6px', bottom: '6px' }}
            aria-hidden="true"
          />

          <ul className="space-y-5">
            {timelineEvents.map((event, index) => (
              <li
                key={event.id}
                className="relative er-enter"
                style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
              >
                {/* Marker dot on the thread. Critical beats sit slightly larger
                    as well as in signal, so the emphasis survives for anyone who
                    can't separate the two reds by colour. */}
                <span
                  aria-hidden="true"
                  className={`absolute top-1.5 ${
                    event.isCritical
                      ? 'bg-signal w-[9px] h-[9px] -left-[25px]'
                      : 'bg-dim-2 w-[7px] h-[7px] -left-6'
                  }`}
                />

                {event.time && (
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-brass tabular-nums">
                    {event.time}
                  </p>
                )}
                <p
                  className={`font-body text-[15px] leading-[1.55] mt-1 ${
                    event.isCritical ? 'text-bone' : 'text-dim'
                  }`}
                >
                  {event.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The incident, as the room knows it */}
      {canSeeMurderTimeline && (
        <section className="er-card er-card--signal">
          <p className="er-mono er-mono--hot er-mono--wide">Key events · the incident</p>
          <div className="er-rule mt-3 mb-4" />

          <ul className="space-y-3">
            {CASE_TIMELINE.map((item, index) => (
              <li
                key={item.time}
                className="flex gap-3 er-enter"
                style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
              >
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-brass tabular-nums w-[68px] shrink-0 pt-0.5">
                  {item.time}
                </span>
                <span
                  className={`font-body text-[15px] leading-[1.5] ${
                    item.event.toLowerCase().includes('collapses') ? 'text-bone' : 'text-dim'
                  }`}
                >
                  {item.event}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isMurderer && (
        <div className="er-card er-card--signal">
          <span className="er-tag">{CASE_META.killerCount > 1 ? 'You are one of the killers' : 'You are the killer'}</span>
          <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
            Your timeline is your alibi. Make it convincing.
          </p>
        </div>
      )}
    </div>
  );
};
