import React from 'react';
import PlayerApp from './components/game/PlayerApp';
import HostApp from './components/host/HostApp';

/**
 * Killers Night. `/host` (or `?host`) is the console; everything else is a
 * guest's phone. The host console is a separate screen, not a mode of the
 * player app: the host plays no role and sees every secret.
 */
export default function KillersApp() {
  const path = location.pathname.replace(/\/+$/, '');
  const isHost = path.endsWith('/host') || new URLSearchParams(location.search).has('host');
  return isHost ? <HostApp /> : <PlayerApp />;
}
