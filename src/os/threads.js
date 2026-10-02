/**
 * The Messages threads a guest can see, with their lists and unread counts.
 * Shared by the Messages app, the home-screen badge and the Notification
 * Center (PhoneOS), so none of the three can disagree about what is unread.
 * The DEEP BLUE thread also carries the app's own lines to this guest (voice.js).
 *
 * `preview`/`systemText` are the one place a thread's last line (or a system
 * delivery's line) turns into row text — also shared, for the same reason.
 */

import { deliveryLine } from '../data/killersCopy';
import { photoSource } from './words';

const SYSTEM_KINDS = new Set(['check', 'trace', 'seance', 'saved', 'quiet', 'recruited', 'fact']);
const UNKNOWN_KINDS = new Set(['whisper', 'watch']);

/** Which threads this guest can see, with their message lists, unread counts and unread items. */
export function threadsFor(ctx, seen) {
  const { me, role, chat, spirits, inbox } = ctx;
  const spiritsOk = me.status === 'ghost' || (role?.role === 'medium' && me.status === 'alive');
  const sys = [...inbox.filter((d) => SYSTEM_KINDS.has(d.kind)), ...(ctx.voice ?? [])].sort(byAt);
  const unk = inbox.filter((d) => UNKNOWN_KINDS.has(d.kind)).sort(byAt);
  const unread = (list, key, mine = (m) => m.pid === me.pid) => list.filter((m) => (m.at ?? 0) > (seen[key] ?? 0) && !mine(m));
  const row = (id, title, list, unreadList, icon) => ({ id, title, list, unread: unreadList.length, unreadList, icon });
  return [
    row('room', 'The Room', chat ?? [], unread(chat ?? [], 'room'), 'messages'),
    ...(spiritsOk ? [row('spirits', 'Spirits', spirits ?? [], unread(spirits ?? [], 'spirits'), 'night')] : []),
    row('deepblue', 'DEEP BLUE', sys, unread(sys, 'deepblue', () => false), 'deepblue'),
    ...(unk.length ? [row('unknown', 'Unknown', unk, unread(unk, 'unknown', () => false), null)] : []),
  ];
}

const byAt = (a, b) => (a.at ?? 0) - (b.at ?? 0);

/** A room/spirits message as a one-line row (thread list and previews alike). */
export function preview(id, m, ctx) {
  if (id === 'room' || id === 'spirits') return `${m.pid === ctx.me.pid ? 'You' : m.name}: ${m.text}`;
  return systemText(m, ctx);
}

/** A DEEP BLUE / Unknown delivery as a one-line row. */
export function systemText(d, ctx) {
  if (d.kind === 'voice') return d.text;
  if (d.kind === 'fact') return `New photo · ${photoSource(d)}. Open Gallery.`;
  return deliveryLine(d, ctx.nameOf);
}
