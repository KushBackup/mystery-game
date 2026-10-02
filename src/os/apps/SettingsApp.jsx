import React, { useState } from 'react';
import { AppFrame, Section, Group, Cell, Switch, Btn } from '../ui';
import { requestLeave, cancelLeave } from '../../firebase/game';
import { isSoundOn, isVibeOn, setSoundOn, setVibeOn, sfxPing, primeSfx } from '../sfx';
import { setTypeSoundOn } from '../../lib/typeSound';

/**
 * Settings: sound, vibration, who this phone is, and leaving early. The device
 * code is what the host needs to relink a guest whose phone died.
 */
export default function SettingsApp({ ctx, onClose }) {
  const { gid, me, uid } = ctx;
  const [sound, setSound] = useState(isSoundOn());
  const [vibe, setVibe] = useState(isVibeOn());
  const [confirm, setConfirm] = useState(false);
  const leaving = Boolean(me.leaveRequestedAt);

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

      <Section head="This phone" foot="If your phone dies, show this code to the host from a new one.">
        <Group>
          <Cell title="Name" value={me.name} />
          <Cell title="Device code" value={<span className="os-arcade text-[14px]">{(uid ?? me.pid).slice(0, 6).toUpperCase()}</span>} />
        </Group>
      </Section>

      <Section head="Leaving early?" foot={leaving ? 'You’ll slip out at the next dawn. Your role stays secret.' : 'You can’t come back as yourself.'}>
        {leaving ? (
          <Btn tone="grey" onClick={() => cancelLeave(gid, me.pid)}>Stay after all</Btn>
        ) : confirm ? (
          <div className="grid grid-cols-2 gap-2">
            <Btn tone="grey" onClick={() => setConfirm(false)}>Cancel</Btn>
            <Btn tone="red" onClick={() => requestLeave(gid, me.pid)}>Leave</Btn>
          </div>
        ) : (
          <Btn tone="red" onClick={() => setConfirm(true)}>Leave the game</Btn>
        )}
      </Section>

      <Section head="About">
        <Group>
          <Cell title="DEEP BLUE" sub="Every morning, everyone plays. The lowest score is taken. A game by Astral Project." />
        </Group>
      </Section>
      <div className="h-8" />
    </AppFrame>
  );
}
