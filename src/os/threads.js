/**
 * The Messages threads a guest can see, with their lists and unread counts.
 * Shared by the Messages app, the home-screen badge and the Notification
 * Center (PhoneOS), so none of the three can disagree about what is unread.
 * The DEEP BLUE thread also carries the app's own lines to this guest (voice.js).
 *
 * A living Killer also has a group thread with the other Killers (`den`). It
 * is never called that: its title is their names, the way a group with no
 * name reads on an old iPhone. Nobody tells a Killer who their partners are;
 * the group appearing is how they find out.
 *
 * `preview`/`systemText` are the one place a thread's last line (or a system
 * delivery's line) turns into row text — also shared, for the same reason.
 */

import { deliveryLine, SHARE } from '../data/killersCopy';
import { photoSource } from './words';
import { mediaFor, FORM_NAME } from './evidence';

const SYSTEM_KINDS = new Set(['check', 'trace', 'saved', 'quiet', 'recruited', 'fact']);
const UNKNOWN_KINDS = new Set(['watch']);

/** Which threads this guest can see, with their message lists, unread counts and unread items. */
export function threadsFor(ctx, seen) {
  const { me, role, chat, spirits, inbox } = ctx;
  const spiritsOk = me.status === 'ghost';
  const denOk = role?.role === 'killer' && me.status === 'alive' && Array.isArray(ctx.mates);
  // The role message from casting stays at the top of the DEEP BLUE thread, sealed (RoleMessage).
  const roleMsg = role?.role ? [{ id: 'role', kind: 'role', at: 1, cycle: 0 }] : [];
  // The manifesto (voice.js) is dated years before tonight, so it leads the thread by its own date and is never unread.
  const voice = ctx.voice ?? [];
  const old = voice.filter((d) => d.old);
  const sys = [...old, ...[...roleMsg, ...inbox.filter((d) => SYSTEM_KINDS.has(d.kind)), ...voice.filter((d) => !d.old)].sort(byAt)];
  const unk = inbox.filter((d) => UNKNOWN_KINDS.has(d.kind)).sort(byAt);
  const unread = (list, key, mine = (m) => m.pid === me.pid) => list.filter((m) => (m.at ?? 0) > (seen[key] ?? 0) && !mine(m));
  const row = (id, title, list, unreadList, icon) => ({ id, title, list, unread: unreadList.length, unreadList, icon });
  const den = denOk ? denList(ctx) : [];
  return [
    row('room', 'The Room', chat ?? [], unread(chat ?? [], 'room'), 'messages'),
    ...(denOk ? [row('den', groupTitle(ctx), den, unread(den, 'den'), null)] : []),
    ...(spiritsOk ? [row('spirits', 'Spirits', spirits ?? [], unread(spirits ?? [], 'spirits'), 'night')] : []),
    row('deepblue', 'DEEP BLUE', sys, unread(sys, 'deepblue', (m) => m.old), 'deepblue'),
    ...(unk.length ? [row('unknown', 'Unknown', unk, unread(unk, 'unknown', () => false), null)] : []),
  ];
}

const byAt = (a, b) => (a.at ?? 0) - (b.at ?? 0);

/** The poll's question: a recruit night asks who joins instead (den/meta). */
export function pollQuestion(meta, cycle) {
  return meta?.recruitDue && meta?.cycle === cycle ? 'Who joins us?' : 'Who goes tonight?';
}

/** When tonight's poll appeared in the group: the moment the night began. */
export const pollAt = (game) => Math.max(game.phaseStartedAt || 0, game.revealAt || 0);

/**
 * The group's messages, plus what DEEP BLUE did in it: adding you (at the
 * deal, or when you were recruited), adding a recruit later, and posting
 * tonight's poll. Those count as unread like any message, which is what puts
 * a badge on Messages and a banner on the screen the moment they happen.
 */
function denList(ctx) {
  const { me, mates, den, game, nameOf } = ctx;
  const mine = mates.find((m) => m.id === me.pid);
  const items = [...(den ?? [])];
  if (mine?.at) items.push({ id: 'den:in', kind: 'added', at: mine.at, text: 'DEEP BLUE added you' });
  for (const m of mates) {
    if (m.id !== me.pid && m.recruited && m.at && m.at > (mine?.at ?? 0)) {
      items.push({ id: `den:add:${m.id}`, kind: 'added', at: m.at, text: `DEEP BLUE added ${nameOf(m.id)}` });
    }
  }
  if (game.phase === 'night') items.push({ id: `den:poll:${game.cycle}`, kind: 'poll', at: pollAt(game) });
  return items.sort(byAt);
}

/** "Maya & Arjun", "Maya, Arjun & Rohan": the partners still in the game, by name. */
export function groupTitle(ctx) {
  const { me, mates, players, nameOf } = ctx;
  const alive = new Set(players.filter((p) => p.status === 'alive').map((p) => p.id));
  const others = mates.filter((m) => m.id !== me.pid);
  const names = (others.some((m) => alive.has(m.id)) ? others.filter((m) => alive.has(m.id)) : others).map((m) => nameOf(m.id));
  if (!names.length) return 'Just you';
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} & ${names.at(-1)}`;
}

/** A room/spirits/group message as a one-line row (thread list and previews alike). */
export function preview(id, m, ctx) {
  if (m.kind === 'added') return m.text;
  if (m.kind === 'poll') return 'DEEP BLUE created a poll';
  if (m.kind === 'last') return `${m.pid === ctx.me.pid ? 'You' : m.name} left a last message`;
  if (m.kind === 'photo') return SHARE.preview(m.pid === ctx.me.pid ? 'You' : m.name);
  if (id === 'room' || id === 'spirits' || id === 'den') return `${m.pid === ctx.me.pid ? 'You' : m.name}: ${m.text}`;
  return systemText(m, ctx);
}

/** A DEEP BLUE / Unknown delivery as a one-line row. */
export function systemText(d, ctx) {
  if (d.kind === 'voice') return d.text;
  // The same words on every phone: the list row must not say the role.
  if (d.kind === 'role') return 'Your role. Read it alone.';
  if (d.kind === 'fact') return `New ${FORM_NAME[mediaFor(d)].toLowerCase()} · ${photoSource(d, ctx.nameOf)}`;
  return deliveryLine(d, ctx.nameOf);
}

/**
 * Last words: the true clue photos a guest the Killers killed last night may
 * post to the room, once, any time that day before the verdict
 * (firestore.rules lastWords). Null when there is nothing to offer: not killed
 * last night, the wrong phase, already posted, or no photo of their own yet.
 */
export function lastWordsDue(ctx) {
  const { me, game, chat, inbox } = ctx;
  if (me?.status !== 'ghost' || me.cause !== 'murdered' || me.diedCycle !== game.cycle) return null;
  if (!['dawn', 'alarm', 'game', 'game_locked', 'investigation', 'roundtable'].includes(game.phase)) return null;
  if ((chat ?? []).some((m) => m.kind === 'last' && m.pid === me.pid)) return null;
  const photos = (inbox ?? []).filter((d) => d.kind === 'fact' && d.via === 'ghost' && d.fact && d.cycle === game.cycle);
  return photos.length ? photos : null;
}
