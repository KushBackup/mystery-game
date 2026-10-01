import React, { useEffect, useMemo, useState } from 'react';
import { ensureAnonymous, beat } from '../../firebase/game';
import { useAuthUser, useActiveGameId, useGame, useBinding, usePlayers, useMyRole, useInbox } from '../../hooks/useKillers';
import { packFor } from '../../data/packs/index.js';
import PhoneOS, { PhoneFrame } from '../../os/PhoneOS';
import Setup from '../../os/Setup';
import { Hold } from '../../os/ui';
import Wallpaper from '../../os/art/Wallpaper';

/**
 * A guest's phone, from the door to the gate.
 *
 *   auth → active game → binding → (Setup | the DEEP BLUE phone)
 *
 * This file only loads things and decides which of the two to show. The phone
 * itself (home screen, apps, the phase-driven takeovers) is src/os/PhoneOS.jsx.
 */

const Boot = ({ label }) => (
  <PhoneFrame clear>
    <Wallpaper variant="lock" />
    <Hold label={label} />
  </PhoneFrame>
);

export default function PlayerApp() {
  const user = useAuthUser();
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (user === null) ensureAnonymous().catch((e) => setAuthError(e.code ?? e.message));
  }, [user]);

  const uid = user?.uid;
  const gid = useActiveGameId(uid);
  const game = useGame(gid);
  const pid = useBinding(gid, uid);
  const pack = packFor(game?.packId);

  if (authError) return <Boot label={`NO CONNECTION (${authError}). CHECK THE WIFI AND RELOAD.`} />;
  if (!uid || gid === undefined) return <Boot label="CONNECTING…" />;
  if (!gid) return <Boot label="NO GAME TONIGHT YET. ASK THE HOST." />;
  if (!game || pid === undefined) return <Boot label="OPENING THE DOORS…" />;
  if (!pid) {
    if (game.phase === 'finale') return <Boot label="THIS GAME HAS ENDED." />;
    return (
      <PhoneFrame>
        <Setup gid={gid} uid={uid} pack={pack} late={game.phase !== 'lobby'} />
      </PhoneFrame>
    );
  }
  return <InGame gid={gid} uid={uid} game={game} pid={pid} pack={pack} />;
}

function InGame({ gid, uid, game, pid, pack }) {
  const playersSub = usePlayers(gid);
  const players = useMemo(() => playersSub ?? [], [playersSub]);
  const role = useMyRole(gid, pid);
  const inboxSub = useInbox(gid, pid);
  const inbox = useMemo(() => inboxSub ?? [], [inboxSub]);
  const names = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p.name])), [players]);
  const nameOf = useMemo(() => (id) => names[id] ?? 'someone', [names]);

  useEffect(() => {
    beat(gid, pid);
    const id = setInterval(() => beat(gid, pid), 60_000);
    return () => clearInterval(id);
  }, [gid, pid]);

  const meDoc = players.find((p) => p.id === pid);
  if (!meDoc) return <Boot label="FINDING YOUR SEAT…" />;
  return <PhoneOS gid={gid} uid={uid} game={game} me={{ ...meDoc, pid }} role={role} players={players} inbox={inbox} pack={pack} nameOf={nameOf} />;
}
