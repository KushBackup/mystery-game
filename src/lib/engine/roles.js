/**
 * Roles: who is what, and how many of each for the room that turned up.
 *
 * Nothing here is tied to a story. Roles are dealt from whoever is present when
 * the host presses Deal, which is the whole point: if 31 people come instead of
 * 36, the game is simply dealt for 31.
 *
 * Every special role plays for the Faithful. The only teams are
 * 'killers' and 'faithful'.
 */

import { shuffle } from './rng.js';

export const ROLE = Object.freeze({
  KILLER: 'killer',
  FAITHFUL: 'faithful',
  DOCTOR: 'doctor',
  DETECTIVE: 'detective',
});

export const ROLE_INFO = {
  killer: { team: 'killers', label: 'Killer' },
  faithful: { team: 'faithful', label: 'Faithful' },
  doctor: { team: 'faithful', label: 'Doctor' },
  detective: { team: 'faithful', label: 'Detective' },
};

export const teamOf = (role) => ROLE_INFO[role]?.team ?? 'faithful';

// Tuned with scripts/sim-balance.mjs (2026-09-26, 500 games per cell).
//
// The Killer count does NOT grow with the room. The Faithful get about seven
// banishments in an evening (five Round Tables plus a two-vote Endgame)
// whatever the headcount, and that is what bounds how many Killers they can
// catch. With three Killers and the room-size clue scaling in night.js, the
// Faithful win 49-57% of simulated games from 20 to 45 guests, and 41-53% as
// the bots are made sloppier or sharper. Four Killers at 35 drops that to
// 11%; two lifts it to 94%.
export const DEFAULT_RATIOS = Object.freeze({
  killers: null, // host override: a fixed Killer count; null follows the table below
  secondDoctorAbove: 35,
  detectiveChecks: 2,
});

/** How many of each role a room of `n` gets. Faithful fill whatever is left. */
export function targetCounts(n, ratios = DEFAULT_RATIOS) {
  const r = { ...DEFAULT_RATIOS, ...ratios };
  let killer;
  if (r.killers) killer = r.killers;
  else if (n < 8) killer = 1;
  else if (n < 12) killer = 2;
  else if (n <= 50) killer = 3;
  else killer = 4;
  killer = Math.min(killer, Math.max(1, Math.floor((n - 1) / 3)));

  const doctor = n >= 8 ? (n > r.secondDoctorAbove ? 2 : 1) : 0;
  const detective = n >= 8 ? 1 : 0;
  return { killer, doctor, detective };
}

/**
 * Deal roles to `pids`. Sorted first, so the deal depends only on the seed and
 * on who is in the room, not on the order their snapshots arrived.
 * Returns { [pid]: role }.
 */
export function dealRoles(pids, counts, rng) {
  const order = shuffle([...pids].sort(), rng);
  const roles = {};
  let i = 0;
  const give = (role, k) => {
    for (let j = 0; j < k && i < order.length; j++) roles[order[i++]] = role;
  };
  give(ROLE.KILLER, counts.killer);
  give(ROLE.DOCTOR, counts.doctor);
  give(ROLE.DETECTIVE, counts.detective);
  while (i < order.length) roles[order[i++]] = ROLE.FAITHFUL;
  return roles;
}

/**
 * A guest who arrives after the deal. They are always on the Faithful team: a
 * late arrival is never made a Killer directly (recruitment covers a shrinking
 * Killer team, see roster.js). They get a special role only if the room has
 * grown past a threshold that role was never dealt for.
 */
export function assignLateJoiner(roles, roomSize, ratios, rng) {
  const want = targetCounts(roomSize, ratios);
  const dealt = { doctor: 0, detective: 0 };
  for (const role of Object.values(roles)) if (role in dealt) dealt[role]++;
  const open = ['detective', 'doctor'].filter((r) => want[r] > dealt[r]);
  if (open.length === 0) return ROLE.FAITHFUL;
  return open[Math.floor(rng() * open.length)];
}
