import { useEffect, useState } from 'react';
import { subscribeToMessages } from '../firebase/config';

/**
 * How much of the channel this device has not read.
 *
 * The Comms tile on the hub is the app's nudge towards the one mechanic that
 * has no clue attached to it — talking to the room. Left alone, Comms is a tile
 * that looks identical whether the channel is silent or has forty messages on
 * it, so a player with nothing to decode has no reason to open it. This is what
 * lets the tile say "somebody is talking".
 *
 * Two deliberate constraints.
 *
 * 1. **A backlog is not news.** With no watermark — a fresh device, a player
 *    logging in during Round 04 — this seeds on the newest message and reports
 *    zero. A badge reading 60 on arrival is noise, and worse, it never clears in
 *    a way that means anything.
 * 2. **Your own messages never count.** You know what you just said.
 */

// The newest message id this device has read.
//
// Persisted, and deliberately outside App's SESSION_KEY, for exactly the reason
// TALLY_SEEN_KEY is (views/VotingView.jsx): it has to survive a reload, a
// service-worker update and the host's force-sync broadcast, none of which is a
// reason to tell somebody they have unread messages they read a minute ago.
const SEEN_KEY = 'astral.commsseen';

// Private-mode Safari throws on every localStorage call. The session copy holds
// the watermark for as long as the tab lives, so only a reload can re-badge.
let seenMemory = null;

const readSeen = () => {
  if (seenMemory !== null) return seenMemory;
  try {
    return window.localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
};

const markSeen = (id) => {
  seenMemory = id;
  try {
    window.localStorage.setItem(SEEN_KEY, id);
  } catch {
    // Nothing to do — the in-memory copy above carries the session.
  }
};

/**
 * @param {string|null} myId    this player's character id; their own messages are excluded
 * @param {boolean}     reading true while the Comms screen is open
 * @returns {{count: number, newestId: string|null}}
 */
export function useUnreadMessages(myId, reading) {
  const [unread, setUnread] = useState({ count: 0, newestId: null });

  // Only publish a genuine change. This hook sits at the top of App, so every
  // state write here re-renders the whole tree — and most snapshots carry no
  // news for the badge at all: the player's own message, an edit, a delete, a
  // server timestamp resolving. Returning the previous object makes React bail
  // out of the render entirely.
  const publish = (count, newestId) =>
    setUnread((prev) =>
      prev.count === count && prev.newestId === newestId ? prev : { count, newestId }
    );

  // `reading` is in the deps rather than held in a ref so the snapshot handler
  // can simply close over it. That re-subscribes twice per visit to Comms,
  // which costs nothing: an identical query is served from the local cache and
  // shares its listen stream with ChatView's.
  useEffect(() => {
    return subscribeToMessages(
      (docs) => {
        if (docs.length === 0) {
          publish(0, null);
          return;
        }

        const newest = docs[docs.length - 1];

        // Reading the channel *is* marking it read, including the messages that
        // land while the player is sitting on it.
        if (reading) {
          markSeen(newest.id);
          publish(0, newest.id);
          return;
        }

        const seenId = readSeen();
        const seenIndex = seenId ? docs.findIndex((m) => m.id === seenId) : -1;

        // No watermark, or one that has fallen out of the window — deleted by
        // its author, or pushed off the tail by a hundred newer messages. Seed
        // on the newest and report nothing: see constraint 1 above.
        if (seenIndex === -1) {
          markSeen(newest.id);
          publish(0, newest.id);
          return;
        }

        const fresh = docs.slice(seenIndex + 1).filter((m) => m.characterId !== myId);
        // The published id is the newest *unread* message, not the newest
        // message. GridMenu keys the jog on it, so it must not change when the
        // player's own message arrives — that would jog the icon at somebody for
        // something they typed themselves.
        publish(fresh.length, fresh.length ? fresh[fresh.length - 1].id : null);
      },
      (error) => {
        // The badge is an invitation, never a dependency. A channel that cannot
        // be read just means no badge.
        console.error('Error watching the channel:', error);
      }
    );
  }, [myId, reading]);

  return unread;
}
