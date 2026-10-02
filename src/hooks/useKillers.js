/**
 * The hooks every Killers Night screen reads from.
 *
 * Each wraps exactly one subscription from firebase/game.js, and returns
 * `undefined` while it hasn't answered yet and `null` when it answered
 * "nothing". Screens rely on that distinction: "still loading" must never
 * render as "you have no role".
 */

import { useEffect, useState } from 'react';
import {
  watchAuth, subscribeActive, subscribeGame, subscribeBinding, subscribePlayers, subscribeMyRole, subscribeInbox,
  subscribeChannel, subscribeMyAction, subscribeMyVote, subscribeMyScore, subscribeMyTraits, subscribeAllTraits, subscribeKillers, subscribeDen, subscribeDenMeta,
  subscribeDayWall, subscribeMyPlay,
} from '../firebase/game.js';
import { serverNow } from '../lib/clockSkew.js';

/**
 * One subscription, keyed by `deps`. `subscribe` is only called when every
 * key is present. Keys arrive one by one on a cold start (auth, then game,
 * then binding), and subscribing with an undefined gid would be a denied read.
 *
 * The answer is stored alongside the key it answered, and the returned value
 * falls back to `undefined` when they no longer match. So a change of key
 * reads as "loading" at once, without an effect ever resetting state.
 */
function useSub(subscribe, deps) {
  const [state, setState] = useState({ key: null, value: undefined });
  const ready = deps.every((d) => d !== undefined && d !== null);
  const key = ready ? JSON.stringify(deps) : null;
  useEffect(() => {
    if (!key) return undefined;
    return subscribe((value) => setState({ key, value }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on `key`, which is `deps` serialised
  }, [key]);
  return key && state.key === key ? state.value : undefined;
}

export function useAuthUser() {
  const [user, setUser] = useState(undefined);
  useEffect(() => watchAuth((u) => setUser(u ?? null)), []);
  return user;
}

export const useActiveGameId = (signedIn) => useSub((cb) => subscribeActive(cb), [signedIn || null]);
export const useGame = (gid) => useSub((cb) => subscribeGame(gid, cb), [gid]);
export const useBinding = (gid, uid) => useSub((cb) => subscribeBinding(gid, uid, cb), [gid, uid]);
export const usePlayers = (gid) => useSub((cb) => subscribePlayers(gid, cb), [gid]);
export const useMyRole = (gid, pid) => useSub((cb) => subscribeMyRole(gid, pid, cb), [gid, pid]);
export const useInbox = (gid, pid) => useSub((cb) => subscribeInbox(gid, pid, cb), [gid, pid]);
export const useChannel = (gid, channel, enabled = true) =>
  useSub((cb) => subscribeChannel(gid, channel, cb), [gid, channel, enabled || null]);
export const useMyAction = (gid, cycle, pid) => useSub((cb) => subscribeMyAction(gid, cycle, pid, cb), [gid, cycle, pid]);
export const useMyVote = (gid, ballot, pid) => useSub((cb) => subscribeMyVote(gid, ballot, pid, cb), [gid, ballot, pid]);
export const useMyTraits = (gid, pid) => useSub((cb) => subscribeMyTraits(gid, pid, cb), [gid, pid]);
export const useAllTraits = (gid) => useSub((cb) => subscribeAllTraits(gid, cb), [gid]);
export const useMyScore = (gid, cycle, pid) => useSub((cb) => subscribeMyScore(gid, cycle, pid, cb), [gid, cycle, pid]);
/** The Killers' group (`[{ id, at, recruited }]`). Only subscribes for a Killer; the rules refuse anyone else. */
export const useKillerGroup = (gid, isKiller) => useSub((cb) => subscribeKillers(gid, cb), [gid, isKiller || null]);
export const useDen = (gid, cycle, isKiller) => useSub((cb) => subscribeDen(gid, cycle, cb), [gid, cycle, isKiller || null]);
/** The morning games: a public wall (`clues`, `drawings`) and this guest's own doc (`picks`, `guesses`). */
export const useDayWall = (gid, name, cycle, enabled = true) =>
  useSub((cb) => subscribeDayWall(gid, name, cycle, cb), [gid, name, cycle, enabled || null]);
export const useMyPlay = (gid, name, cycle, pid, enabled = true) =>
  useSub((cb) => subscribeMyPlay(gid, name, cycle, pid, cb), [gid, name, cycle, pid, enabled || null]);
export const useDenMeta =(gid, isKiller) => useSub((cb) => subscribeDenMeta(gid, cb), [gid, isKiller || null]);

/**
 * Server time, ticking every `ms` while `until` is in the future. It stops
 * once `until` passes, so a phone sitting on a finished phase costs nothing.
 */
export function useServerNow(until, ms = 250) {
  const [now, setNow] = useState(() => serverNow());
  useEffect(() => {
    if (!until) return undefined;
    const id = setInterval(() => {
      const t = serverNow();
      setNow(t);
      if (t >= until) clearInterval(id);
    }, ms);
    return () => clearInterval(id);
  }, [until, ms]);
  return now;
}

/** 'hold' until the room's shared reveal instant, then 'show'. */
export function useSyncedReveal(revealAt) {
  const now = useServerNow(revealAt, 100);
  return revealAt && now < revealAt ? 'hold' : 'show';
}
