import React, { useState } from 'react';
import { AppFrame, Section, Group, Cell, Switch, Btn } from '../ui';
import { requestLeave, cancelLeave, leaveBeforeStart, deviceCode } from '../../firebase/game';
import { isSoundOn, isVibeOn, setSoundOn, setVibeOn, sfxPing, primeSfx } from '../sfx';
import { setTypeSoundOn } from '../../lib/typeSound';
import { GAME } from '../../data/killersCopy';

/**
 * Settings: sound, vibration, who this phone is, and leaving early. A phone
 * that loses the game asks to be signed back in from Setup's hello screen
 * (it shows its own code there); this one's code is for the host's reference.
 */
export default function SettingsApp({ ctx, onClose }) {
  const { gid, me, uid, game } = ctx;
  const [sound, setSound] = useState(isSoundOn());
  const [vibe, setVibe] = useState(isVibeOn());
  const [confirm, setConfirm] = useState(false);
  const leaving = Boolean(me.leaveRequestedAt);
  // Before the deal, leaving is immediate and the phone goes back to set-up,
  // so a guest can join again (the only way to change their answers).
  const lobby = game?.phase === 'lobby';
  const leave = () => (lobby ? leaveBeforeStart(gid, uid, me.pid) : requestLeave(gid, me.pid));

  return (
    <AppFrame title="Settings" onBack={onClose} light>
      <Section head="Sounds">
        <Group>
          <Cell title="Sounds">
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <Switch on={sound} label="Sounds" onChange={(on) => { setSoundOn(on); setTypeSoundOn(on); setSound(on); if (on) { primeSfx(); sfxPing(); } }} />
            </span>
          </Cell>
          <Cell title="Vibrate">
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <Switch on={vibe} label="Vibrate" onChange={(on) => { setVibeOn(on); setVibe(on); }} />
            </span>
          </Cell>
        </Group>
      </Section>

      <Section head="This phone" foot="Signed out by accident? Open the game again and tap “Already playing?”. The host signs you back in.">
        <Group>
          <Cell title="Name" value={me.name} />
          <Cell title="Device code" value={<span className="os-arcade text-[14px]">{deviceCode(uid ?? me.pid)}</span>} />
        </Group>
      </Section>

      <Section
        head="Leaving early?"
        foot={leaving
          ? 'You’ll slip out at the next dawn. Your role stays secret.'
          : lobby ? 'You can join again from the start, as a new guest.' : 'You can’t come back as yourself.'}
      >
        {leaving ? (
          <Btn tone="grey" onClick={() => cancelLeave(gid, me.pid)}>Stay after all</Btn>
        ) : confirm ? (
          <div className="grid grid-cols-2 gap-2">
            <Btn tone="grey" onClick={() => setConfirm(false)}>Cancel</Btn>
            <Btn tone="red" onClick={leave}>Leave</Btn>
          </div>
        ) : (
          <Btn tone="red" onClick={() => setConfirm(true)}>Leave the game</Btn>
        )}
      </Section>

      <Section head="About">
        <Group>
          <Cell title={GAME.title} sub={`By ${GAME.by}, in collaboration with ${GAME.with}.`} />
        </Group>
      </Section>
      <div className="h-8" />
    </AppFrame>
  );
}
