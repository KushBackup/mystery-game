import React from 'react';
import { SCREEN_GUIDE } from '../../data/screenGuide';

/**
 * The player's guide (DESIGN_LANGUAGE.md §9, "Guide").
 *
 * This screen carried five hues the system doesn't have — halloween purple and
 * orange, plus blue/pink/emerald content blocks. Every one of them is gone.
 * Sections are separated by hairlines, lists are em-dash lists (§6.5), and the
 * round numbers are the only brass on the screen because they are the only
 * numerals (§2.2).
 */

// Same copy the pinned screen notes use, so the Guide and the screens can never
// describe the app differently — see data/screenGuide.js. Listed in board order,
// and only the screens the grid actually reaches (which is why Timeline, whose
// view exists but has no tile, isn't here — and why Archives isn't, now that the
// case files live inside Evidence).
const SCREENS = ['dashboard', 'story', 'intel', 'chat', 'votes', 'dossier'].map(
  (id) => [SCREEN_GUIDE[id].title, SCREEN_GUIDE[id].detail]
);

const ROUNDS = [
  ['The Incident', 'Read the incident report and get to know the room.'],
  ['Accusations', 'You receive your accusation card — what you witnessed.'],
  ['Motives', 'Enter motive codes to learn why suspects had reason to act.'],
  ['Evidence', 'Forensic reports and witness statements are released.'],
  ['Revelations', 'The major turns. Enter revelation codes.'],
  ['Finale', 'Final discussion and debate before the reveal.'],
  ['The Reveal', 'The truth comes out. Final votes and resolution.'],
];

const TIPS = [
  'Read everything. Every clue, file and profile matters — small details crack the case.',
  'Use comms. Share what you know, ask questions, compare notes.',
  'Study the guests. Relationships, professions, backgrounds: who had access, who had motive.',
  'Check timelines. When did things happen, and who was where? Alibis are crucial.',
  'Play your role. Your character’s perspective is unique and worth something.',
  'Work together. This is collaborative — the goal is for the room to solve it.',
];

const NOTES = [
  'Some clues are locked until later rounds. A code entered too early will not open.',
  'Keep your device with you for the whole game.',
  'Keep the physical code cards you are handed.',
  'Everything syncs in real time. What the host releases, everyone sees.',
];

// Staggered on `--i` (§7): the Guide is a long stack of near-identical cards, so
// letting them arrive in sequence is what tells the eye there is an order to
// read them in. It is also a screen the player visits rarely and reads slowly,
// which is exactly where a staged entrance is affordable.
const Section = ({ label, index = 0, children }) => (
  <section className="er-card er-enter er-stagger" style={{ '--i': index }}>
    <p className="er-mono er-mono--wide er-mono--bone">{label}</p>
    <div className="er-rule mt-3 mb-4" />
    {children}
  </section>
);

export const HelpView = () => {
  return (
    <div className="space-y-4">
      <Section index={0} label="What's happening">
        <p className="font-body text-[15px] leading-[1.55] text-dim">
          You are at a party where something terrible has happened. As one of the guests you
          have a perspective nobody else has. Work with the others to uncover the truth.
        </p>
        <p className="font-body text-[15px] leading-[1.55] text-dim mt-3">
          The game runs over seven rounds. New information unlocks at each stage — pay
          attention to what you learn, share it, and piece the night back together.
        </p>
      </Section>

      <Section index={1} label="Getting around">
        <ul className="er-list">
          <li>The tile grid is your board. Tap any tile to open that section.</li>
          <li>The close button, top right, always returns you to the board.</li>
          <li>The round number sits in the top rail. Content unlocks as it climbs.</li>
        </ul>
      </Section>

      <Section index={2} label="What each screen does">
        <dl>
          {SCREENS.map(([name, body], i) => (
            <div key={name} className={i > 0 ? 'mt-4 pt-4 border-t border-line-faint' : ''}>
              <dt className="er-mono er-mono--hot">{name}</dt>
              <dd className="font-body text-[15px] leading-[1.55] text-dim mt-1.5">{body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section index={3} label="Entering codes">
        <ul className="er-list">
          <li>Open the Evidence screen.</li>
          <li>Tap the CODE button, bottom right.</li>
          <li>Type the code from your printed card — case does not matter.</li>
          <li>Tap UNSEAL.</li>
        </ul>
        <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
          Motive codes open from Round 2, revelation codes from Round 4. A code entered
          before its round will be refused — wait, then try again.
        </p>
      </Section>

      <Section index={4} label="How voting works">
        <ul className="er-list">
          <li>Wait for the host to open the ballot.</li>
          <li>Open Vote — you will see the full guest list on record.</li>
          <li>Tap a name to select, tap again to confirm.</li>
          <li>Change your mind as often as you like until the ballot closes.</li>
          <li>When the host releases the tally, open it from the Vote screen.</li>
        </ul>
        <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
          Counts update live, and the person you picked is marked as your vote.
        </p>
      </Section>

      <Section index={5} label="The seven rounds">
        <ol className="space-y-3">
          {ROUNDS.map(([title, body], i) => (
            <li key={title} className="flex gap-4">
              {/* Round numbers are the only numerals here, so they are the
                  only brass on the screen. */}
              <span className="er-num text-[28px] w-9 shrink-0 text-right">{i}</span>
              <span className="min-w-0 pt-0.5">
                <span className="er-mono er-mono--bone block">{title}</span>
                <span className="block font-body text-[15px] leading-[1.55] text-dim mt-1">
                  {body}
                </span>
              </span>
            </li>
          ))}
        </ol>
        <p className="font-body text-[15px] leading-[1.55] text-dim mt-4">
          Each round runs roughly 15–20 minutes. The host decides when they advance.
        </p>
      </Section>

      <Section index={6} label="Detective tips">
        <ul className="er-list">
          {TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </Section>

      <Section index={7} label="Worth knowing">
        <ul className="er-list">
          {NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </Section>

      <div className="er-card er-card--signal er-enter er-stagger text-center" style={{ '--i': 8 }}>
        <p className="er-mono er-mono--hot er-mono--wide">Ready</p>
        <p className="er-title text-[24px] mt-3">Trust your instincts</p>
        <p className="font-note text-[17px] text-signal-lift mt-3">
          The truth is in the room somewhere.
        </p>
      </div>
    </div>
  );
};
