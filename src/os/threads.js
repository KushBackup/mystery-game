/**
 * The Messages threads a guest can see, with their lists and unread counts.
 * Shared by the Messages app and the home-screen badge (PhoneOS), so the two
 * can never disagree about what is unread.
 */

const SYSTEM_KINDS = new Set(['check', 'trace', 'seance', 'saved', 'quiet', 'recruited', 'fact']);
const UNKNOWN_KINDS = new Set(['whisper', 'watch']);

/** Which threads this guest can see, with their message lists and unread counts. */
export function threadsFor(ctx, seen) {
  const { me, role, chat, spirits, inbox } = ctx;
  const spiritsOk = me.status === 'ghost' || (role?.role === 'medium' && me.status === 'alive');
  const sys = inbox.filter((d) => SYSTEM_KINDS.has(d.kind)).sort(byAt);
  const unk = inbox.filter((d) => UNKNOWN_KINDS.has(d.kind)).sort(byAt);
  const unread = (list, key, mine = (m) => m.pid === me.pid) => list.filter((m) => (m.at ?? 0) > (seen[key] ?? 0) && !mine(m)).length;
  return [
    { id: 'room', title: 'The Room', list: chat ?? [], unread: unread(chat ?? [], 'room'), icon: 'messages' },
    ...(spiritsOk ? [{ id: 'spirits', title: 'Spirits', list: spirits ?? [], unread: unread(spirits ?? [], 'spirits'), icon: 'night' }] : []),
    { id: 'deepblue', title: 'DEEP BLUE', list: sys, unread: unread(sys, 'deepblue', () => false), icon: 'deepblue' },
    ...(unk.length ? [{ id: 'unknown', title: 'Unknown', list: unk, unread: unread(unk, 'unknown', () => false), icon: null }] : []),
  ];
}

const byAt = (a, b) => (a.at ?? 0) - (b.at ?? 0);
