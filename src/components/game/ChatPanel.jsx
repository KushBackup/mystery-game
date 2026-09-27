import React, { useEffect, useRef, useState } from 'react';
import { sendToChannel } from '../../firebase/game';
import { useChannel } from '../../hooks/useKillers';

/**
 * One chat channel: the room ('chat'), the Killers' den ('denChat') or the
 * Spirits ('mediumChat', ghosts and the Medium). One listener per channel
 * (Lessons.md: never a second onSnapshot over the same messages). The rules
 * decide who may read and send; `canSend` only hides the box from people
 * the rules would refuse anyway, such as ghosts in the room channel.
 */
export default function ChatPanel({ gid, channel, me, canSend = true, compact = false, placeholder = 'Say something…' }) {
  const messages = useChannel(gid, channel) ?? [];
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length]);

  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText('');
    setError('');
    try {
      await sendToChannel(gid, channel, me.pid, me.name, t);
    } catch (err) {
      setText(t);
      setError(err.code === 'permission-denied' ? 'You can’t post here.' : 'Not sent. Try again.');
    }
  };

  return (
    <div className="mt-3">
      <ol className={`space-y-2 overflow-y-auto ${compact ? 'max-h-56' : 'max-h-[55dvh]'} pr-1`}>
        {messages.length === 0 && <li className="er-mono">Nothing yet.</li>}
        {messages.map((m) => (
          <li key={m.id} className={`${m.pid === me.pid ? 'border-l-2 border-signal pl-3' : 'pl-3 border-l border-line'}`}>
            <span className="er-mono">{m.pid === me.pid ? 'You' : m.name}</span>
            <p className="font-body text-[15px] text-bone leading-snug break-words">{m.text}</p>
          </li>
        ))}
        <li ref={end} aria-hidden="true" />
      </ol>
      {canSend && (
        <form onSubmit={send} className="flex gap-2 mt-3">
          <input
            value={text}
            maxLength={280}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-ink-raised border border-line focus:border-signal outline-none px-3 py-3 font-body text-[15px] text-bone"
          />
          <button type="submit" className="er-touch er-press px-4 bg-signal text-bone font-mono text-[12px] uppercase tracking-[0.18em]">Send</button>
        </form>
      )}
      {error && <p className="er-mono er-mono--hot mt-2">{error}</p>}
    </div>
  );
}
