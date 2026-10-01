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
  const params = new URLSearchParams(location.search);
  // On GitHub Pages a direct hit on /mystery-game/host is a 404, which
  // public/404.html bounces to /mystery-game/?route=/host.
  const isHost = path.endsWith('/host') || params.has('host') || params.get('route')?.replace(/\/+$/, '') === '/host';
  return isHost ? <HostApp /> : <PlayerApp />;
}
