import { CASE_META } from './gameData';

export const BRIEF_HIDDEN_FROM_ROUND = 2;

export const ROUND_GUIDE = [
  'Read the incident report and understand why the room is sealed.',
  'You are dealt your accusation card - what your character saw or thinks they saw.',
  'The riddle lock opens. Solve riddles, trade codes and circulate the motive files.',
  'Forensics and venue records join the riddle pool.',
  'The major turns. Four revelations enter the pool - keep solving and trading.',
  'The last two revelations enter the pool, then final discussion before the reveal.',
  'The truth comes out. Final votes and resolution.',
];

export const EVIDENCE_STACKS = {
  accusations: { kicker: 'Who saw what', title: 'Accusations' },
  motives: { kicker: 'Reasons to act', title: 'Motives' },
  evidence: { kicker: 'Hard findings', title: 'Evidence' },
  revelations: { kicker: 'The turns', title: 'Revelations' },
  files: { kicker: 'Official record', title: 'Case files' },
};

export const SCREEN_GUIDE = {
  hub: {
    briefLabel: 'Start here',
    brief:
      'This is the room. Start with the story and your own identity, then go profile by profile and see who feels wrong.',
  },

  host: {
    kicker: 'Control',
    title: 'Host Console',
  },

  dashboard: {
    kicker: 'Confidential',
    title: 'Identity',
    brief: 'This is you - role, history and the one secret nobody else can see. Read it before you talk to anyone.',
    detail:
      'Your character: role, profession, backstory and the secret only you can see. Tap the redaction bar to unseal it.',
  },

  story: {
    kicker: 'The Night',
    title: 'The Story',
    brief: 'What happened at Greenr tonight, in order. Come back whenever the room gets louder than the facts.',
    detail:
      'The case briefing: the closing dinner, the diligence partner, the crash, the collapse and the sealed venue - everything the room knows before the investigation starts.',
  },

  intel: {
    kicker: 'Evidence Board',
    title: 'Evidence',
    brief: 'Tabs only appear when their round is live. In Accusations, read yours aloud and trade codes through CODE, bottom right.',
    detail:
      'Your case, sorted into round-aware tabs. Case files are always available; Accusations appears in Round 01, Motives in Round 02, Evidence in Round 03 and Revelations in Round 04. In Round 01, read your accusation and its code aloud; other players enter that word in CODE to unseal it on their screens, then you enter theirs. From Round 02, ASK joins CODE: solve a riddle and you unseal a new clue plus a code you can pass to the room.',
  },

  chat: {
    kicker: 'Encrypted',
    title: 'Comms',
    brief: 'One channel, every guest. Whatever you send is signed with your name, so choose what you give away.',
    detail: 'Talk to all players in real time. Share theories, ask questions and compare timelines. Every message is attributed.',
  },

  timeline: {
    kicker: 'Your Movements',
    title: 'Timeline',
    brief: "Where you were, minute by minute, on the night. This is the alibi you'll be defending.",
    detail:
      'Your own movements on the night of the incident, and the public incident timeline the whole room shares. Learn it - someone will question it.',
  },

  dossier: {
    kicker: 'Profiles',
    title: 'Guests',
    brief: 'Every guest on record. Open a file to read their background - or to vote against them.',
    detail: `All ${CASE_META.playerCount} invitees. Tap anyone to open their file and read their background. Use it to work out who had access, who had reason and who is overacting guilt.`,
  },

  votes: {
    kicker: 'Suspect List',
    title: 'Vote',
    brief: 'Name who you think did it. The ballot opens automatically for five minutes when a round ends.',
    detail:
      'When the round ends, the ballot takes over every screen for five minutes. Tap a name to select, tap again to confirm, and change your vote until the timer closes it. The public result names every voter and their choice.',
  },

  help: {
    kicker: 'Read Me',
    title: 'Guide',
    brief: 'How the night works: rounds, codes, voting. Come here whenever you lose the thread.',
    detail:
      'The full rulebook: what each screen does, how codes work, how voting works and what happens in each of the seven rounds.',
  },
};