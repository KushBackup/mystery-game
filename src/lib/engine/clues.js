/**
 * Clues: turning the hand's real traits into fragments the room can talk about.
 *
 * A clue ("fact") is { trait, group }. It says the hand's answer to that trait
 * falls in that group, for example { trait: 'drink', group: 'spirit' }. The
 * story pack turns it into a sentence ("a spirit on the rim of the glass");
 * the engine only deals in ids.
 *
 * --- Why the greedy half-split -----------------------------------------------
 *
 * Difficulty is set by how much each clue narrows the room, not by how many
 * people hear it. So the engine chooses, each time, the group whose share of
 * the remaining candidates is closest to one half: 35 → ~17 → ~9 → ~4 over a
 * three-clue night. A group that matches almost nobody would name the hand
 * outright; one that matches almost everybody says nothing. Both are refused
 * (outside SHARE_BAND), even if that means a night yields fewer clues. Shares
 * are counted over the actual room, not assumed from option frequencies, since
 * a room where half the people wear black is a different room.
 *
 * --- The plant ----------------------------------------------------------------
 *
 * Once per game the Killers can frame someone. That night's true clues are
 * chosen so they fit *both* the hand and the framed guest, and the last clue is
 * replaced by one that fits the framed guest but *not* the hand. Read together,
 * the night points at the framed guest and away from the killer, with no
 * internal contradiction to give it away. Ghosts only ever receive true clues,
 * which is how a plant can be caught.
 */

export const SHARE_BAND = [0.15, 0.85];

const groupOf = (traitDefs, traitId, groupId) =>
  traitDefs.find((t) => t.id === traitId)?.groups.find((g) => g.id === groupId);

/** Does a guest with these traits fit this fact? */
export function fits(traitDefs, traits, fact) {
  const value = traits?.[fact.trait];
  if (value == null) return false;
  return groupOf(traitDefs, fact.trait, fact.group)?.members.includes(value) ?? false;
}

/** The guests in `pool` who fit every fact. */
export function candidatesFor(traitDefs, traitsByPid, pool, facts) {
  return pool.filter((pid) => facts.every((f) => fits(traitDefs, traitsByPid[pid], f)));
}

/**
 * Greedy clue selection. `mustFit` are the pids every chosen clue has to
 * describe: just the hand normally, the hand and the framed guest on a plant
 * night. `pool` is everyone the room could suspect (the living). Returns facts
 * in the order chosen.
 */
export function generateClues({ traitDefs, traitsByPid, pool, mustFit, budget, rng, avoidTraits = [], band = SHARE_BAND }) {
  const facts = [];
  const used = new Set(avoidTraits);
  let remaining = pool.slice();

  for (let k = 0; k < budget; k++) {
    let best = null;
    for (const t of traitDefs) {
      if (used.has(t.id)) continue;
      for (const g of t.groups) {
        const fact = { trait: t.id, group: g.id };
        if (!mustFit.every((pid) => fits(traitDefs, traitsByPid[pid], fact))) continue;
        const matching = remaining.filter((pid) => fits(traitDefs, traitsByPid[pid], fact));
        const share = matching.length / remaining.length;
        if (share < band[0] || share > band[1]) continue;
        // A little jitter so two rooms with the same shape don't always get the same clue.
        const score = Math.abs(share - 0.5) + rng() * 0.06;
        if (!best || score < best.score) best = { fact, matching, score };
      }
    }
    if (!best) break;
    facts.push(best.fact);
    used.add(best.fact.trait);
    remaining = best.matching;
  }
  return facts;
}

/**
 * The night's clues, true or planted. `framePid` is the guest the Killers chose
 * to frame, or null. Returns { facts, trueFacts }; planted facts carry
 * `planted: true`, which is stripped before anything reaches a player.
 */
export function nightClues({ traitDefs, traitsByPid, pool, handPid, framePid, budget, rng }) {
  if (!framePid || framePid === handPid) {
    const facts = generateClues({ traitDefs, traitsByPid, pool, mustFit: [handPid], budget, rng });
    return { facts, trueFacts: facts };
  }

  const trueFacts = generateClues({
    traitDefs, traitsByPid, pool, mustFit: [handPid, framePid], budget: Math.max(1, budget - 1), rng,
  });
  const narrowed = candidatesFor(traitDefs, traitsByPid, pool, trueFacts);

  let plant = null;
  for (const t of traitDefs) {
    if (trueFacts.some((f) => f.trait === t.id)) continue;
    for (const g of t.groups) {
      const fact = { trait: t.id, group: g.id };
      if (!fits(traitDefs, traitsByPid[framePid], fact)) continue;
      if (fits(traitDefs, traitsByPid[handPid], fact)) continue;
      const share = narrowed.filter((pid) => fits(traitDefs, traitsByPid[pid], fact)).length / (narrowed.length || 1);
      const score = Math.abs(share - 0.5) + rng() * 0.06;
      if (!plant || score < plant.score) plant = { fact, score };
    }
  }

  // No trait separates the framed guest from the hand. The frame fizzles and
  // the night falls back to honest clues; the plant is not spent (see night.js).
  if (!plant) {
    const facts = generateClues({ traitDefs, traitsByPid, pool, mustFit: [handPid], budget, rng });
    return { facts, trueFacts: facts, plantFailed: true };
  }
  return { facts: [...trueFacts, { ...plant.fact, planted: true }], trueFacts };
}

/**
 * The morning paper's witness: one more true fact about the hand, printed for
 * the whole room. It narrows from where tonight's true clues left the room and
 * never repeats one of tonight's traits. Its band is wider and higher than a
 * private clue's (`band`, from the night config), so a witness is a blurrier
 * thing than a photo: it rules out less. Null when nothing fits the band.
 */
export function witnessFact({ traitDefs, traitsByPid, pool, handPid, facts, band, rng }) {
  const narrowed = candidatesFor(traitDefs, traitsByPid, pool, facts.filter((f) => !f.planted));
  const [fact] = generateClues({
    traitDefs, traitsByPid, pool: narrowed.length > 1 ? narrowed : pool, mustFit: [handPid], budget: 1, rng,
    avoidTraits: facts.map((f) => f.trait), band,
  });
  return fact ?? null;
}

/**
 * Hand every recipient exactly one fact, spread evenly so each fact reaches
 * about the same number of people. Redundancy is deliberate: when three people
 * hold the same clue, a Killer who lies about theirs gets contradicted.
 */
export function distributeFragments(facts, recipients, rng) {
  if (facts.length === 0) return [];
  const order = recipients.slice().sort();
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.map((to, i) => {
    const { trait, group } = facts[i % facts.length];
    return { to, kind: 'fact', fact: { trait, group } };
  });
}

/**
 * Split clues (2026-10-15): a dig no longer hands one guest a whole clue. Each
 * fragment arrives as half a photo; the other half is on a named guest's
 * phone, and only when one of them types the other's code does the whole
 * photo appear on both. After the 3 Oct game, clues were a solo task on each
 * phone; this makes two people go and find each other.
 *
 * Holders of the same fact are paired with each other. An odd one out is
 * paired with a random guest from `pool` who doesn't hold it (a Killer can be
 * that partner, and stalling is then evidence). A half carries no fact: the
 * host keeps `pairs` and delivers the whole photo on a correct join
 * (firebase/host.js resolveJoin), so a phone can't read its half early.
 *
 * Uses its own rng, so splitting changes no other draw of the night.
 */
const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export function splitHalves(deliveries, pool, rng, cycle) {
  const byFact = new Map();
  for (const d of deliveries) {
    const key = `${d.fact.trait}:${d.fact.group}`;
    if (!byFact.has(key)) byFact.set(key, { fact: d.fact, holders: [] });
    byFact.get(key).holders.push(d.to);
  }
  const used = new Set();
  const code = () => {
    let c = '';
    do {
      c = Array.from({ length: 3 }, () => CODE_LETTERS[Math.floor(rng() * CODE_LETTERS.length)]).join('');
    } while (used.has(c));
    used.add(c);
    return c;
  };
  const out = [];
  const pairs = {};
  let n = 0;
  for (const { fact, holders } of byFact.values()) {
    for (let i = 0; i < holders.length; i += 2) {
      const a = holders[i];
      const others = pool.filter((p) => !holders.includes(p));
      const b = holders[i + 1] ?? (others.length ? others[Math.floor(rng() * others.length)] : null);
      if (!b) {
        out.push({ to: a, kind: 'fact', fact });
        continue;
      }
      const id = `c${cycle}p${n++}`;
      const codeA = code();
      const codeB = code();
      pairs[id] = { a, b, codeA, codeB, fact, cycle, joined: false };
      out.push({ to: a, kind: 'half', pair: id, half: 'L', code: codeA, partner: b });
      out.push({ to: b, kind: 'half', pair: id, half: 'R', code: codeB, partner: a });
    }
  }
  return { deliveries: out, pairs };
}
