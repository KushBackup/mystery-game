import React, { useEffect, useRef, useState } from 'react';
import { useServerNow } from '../../hooks/useKillers';
import { useStack } from '../nav';
import { BOARD_BEAT, VERDICT_BEAT } from '../beats';
import { AppFrame, Section, Group, Cell, Empty } from '../ui';
import Glyph from '../icons/Glyph';
import AppIcon from '../icons/AppIcon';
import { Avatar } from './ContactsApp';
import { sendToChannel } from '../../firebase/game';
import { useSeen, markSeen } from '../seen';
import { sfxSent } from '../sfx';
import { hhmm } from '../words';
import { threadsFor, preview, systemText } from '../threads';

/**
 * Messages: the group chat everyone is in, plus the threads nobody chose.
 *
 *   The Room   every guest. The living post; ghosts can only read.
 *   Spirits    ghosts and the living Medium.
 *   DEEP BLUE  the app talking to you: your results, your photos, and its
 *              own remarks each night, morning and vote (voice.js).
 *   Unknown    whispers from the dead, and what you saw on watch.
 *
 * The channel lists come from the shell's subscriptions (PhoneOS), never a
 * second listener here: one onSnapshot per channel per phone (Lessons.md).
 */

export default function MessagesApp({ ctx, onClose, thread: initial }) {
  const { top: open, dir, push, pop } = useStack(initial ?? null);
  const seen = {
    room: useSeen(`${ctx.gid}.read.room`, 0),
    spirits: useSeen(`${ctx.gid}.read.spirits`, 0),
    deepblue: useSeen(`${ctx.gid}.read.deepblue`, 0),
    unknown: useSeen(`${ctx.gid}.read.unknown`, 0),
  };
  const threads = threadsFor(ctx, seen);
  const t = threads.find((x) => x.id === open);

  if (t) return <ThreadView ctx={ctx} thread={t} onBack={pop} />;
  const members = ctx.players.filter((p) => p.status === 'alive').length;

  return (
    <AppFrame title="Messages" onBack={onClose} light enter={dir === 'pop' ? 'pop' : undefined}>
      <Section>
        <Group>
          {threads.map((x) => {
            const last = x.list.at(-1);
            return (
              <Cell
                key={x.id}
                icon={x.icon ? <AppIcon name={x.icon} size={36} /> : <Avatar name="?" size={36} />}
                title={x.title}
                sub={last ? preview(x.id, last, ctx) : x.id === 'room' ? `${members} members. Say hello.` : 'No messages yet'}
                value={x.unread ? <span className="os-badge os-badge--inline">{x.unread}</span> : last?.at ? <span className="text-os-steel text-[12px]">{hhmm(new Date(last.at))}</span> : null}
                chevron
                onClick={() => push(x.id)}
              />
            );
          })}
        </Group>
      </Section>
      <p className="os-section__foot px-6 mt-2">Say it in The Room, or say it out loud. Killers read The Room too.</p>
    </AppFrame>
  );
}

/**
 * The group's own history, WhatsApp style: "DEEP BLUE removed Rohan". Each
 * event waits for its reveal's beat (beats.js), so the chat can never tell a
 * table who died before the board does.
 */
function useRoomEvents(game, nameOf) {
  const news = game.news ?? [];
  const gateOf = (n) => (n.at ?? 0) + 4000 + (n.kind === 'dawn' ? BOARD_BEAT.taken : VERDICT_BEAT.verdict) * 1000;
  const latest = news.reduce((m, n) => Math.max(m, n.at ? gateOf(n) : 0), 0);
  const now = useServerNow(latest, 500);
  return news
    .filter((n) => n.at && now >= gateOf(n))
    .map((n, i) => ({ id: `ev-${i}`, event: true, at: gateOf(n), text: eventText(n, nameOf) }))
    .filter((e) => e.text);
}

function eventText(n, nameOf) {
  if (n.kind === 'dawn') {
    const who = nameOf(n.taken ?? n.victims?.[0]);
    if (n.cause === 'rig') return `DEEP BLUE removed ${who} · score ${n.rigged ?? 0}`;
    if (n.cause === 'deep') return `The deep took ${who} · the lowest honest score`;
    return `Day ${n.cycle}: nobody was taken`;
  }
  if (!n.pid) return 'The group couldn’t agree. Nobody was removed.';
  return `The group removed ${nameOf(n.pid)} · ${n.team === 'killers' ? 'was a KILLER' : 'was innocent'}`;
}

function ThreadView({ ctx, thread, onBack }) {
  const { gid, me, game } = ctx;
  const events = useRoomEvents(game, ctx.nameOf);
  const lastAt = thread.list.at(-1)?.at ?? 0;
  useEffect(() => {
    if (lastAt) markSeen(`${gid}.read.${thread.id}`, lastAt);
  }, [gid, thread.id, lastAt]);

  const people = thread.id === 'room' || thread.id === 'spirits';
  const canSend = thread.id === 'room' ? me.status === 'alive' : thread.id === 'spirits';
  const voting = ['roundtable', 'revote', 'endgame'].includes(game.phase);

  return (
    <AppFrame
      title={thread.title}
      enter="push"
      onBack={onBack}
      backLabel="Messages"
      light
      footer={canSend ? <Compose gid={gid} channel={thread.id === 'room' ? 'chat' : 'mediumChat'} me={me} placeholder={thread.id === 'spirits' ? 'Only ghosts and the Medium see this' : 'Message the room'} /> : null}
    >
      {thread.id === 'room' && voting && (
        <button type="button" className="os-pinned w-full text-left sticky top-0 z-10" onClick={() => ctx.open('vote')}>
          <Glyph name="vote" size={18} />
          <span className="flex-1"><b className="os-label text-[12px] block">POLL · OPEN NOW</b>Who gets logged out? Tap to vote.</span>
          <Glyph name="forward" size={12} />
        </button>
      )}
      {people ? (
        <Thread
          messages={thread.id === 'room' ? [...thread.list, ...events].sort((a, b) => (a.at ?? 0) - (b.at ?? 0)) : thread.list}
          me={me}
          empty={thread.id === 'spirits' ? 'The dead talk here. The Medium listens.' : 'Say hello. Everyone in the room is here.'}
        />
      ) : (
        <SystemThread list={thread.list} ctx={ctx} />
      )}
      {thread.id === 'room' && me.status === 'ghost' && <p className="os-section__foot px-6 pb-4">The dead can read, but not post here. Try Spirits.</p>}
    </AppFrame>
  );
}

/** Chat bubbles: yours green on the right, theirs grey on the left, names when the speaker changes. */
export function Thread({ messages, me, empty = 'Nothing yet.' }) {
  const end = useRef(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);
  if (!messages.length) return <Empty glyph="chat" line={empty} />;
  // "Delivered" sits under your last message, if the last person to speak was you.
  let lastSpoken = -1;
  messages.forEach((m, i) => { if (!m.event) lastSpoken = i; });
  const receiptAt = lastSpoken >= 0 && messages[lastSpoken].pid === me.pid ? lastSpoken : -1;
  return (
    <div className="os-thread">
      {messages.map((m, i) => {
        if (m.event) return <p key={m.id} className="os-event os-rise">{m.text}</p>;
        const prev = messages[i - 1];
        const mine = m.pid === me.pid;
        const gap = !prev || (m.at ?? 0) - (prev.at ?? 0) > 5 * 60_000;
        return (
          <React.Fragment key={m.id}>
            {gap && m.at ? <p className="os-stamp-time">{hhmm(new Date(m.at))}</p> : null}
            <div className={`os-bubble-row ${mine ? 'os-bubble-row--me' : ''}`}>
              {!mine && (gap || prev?.pid !== m.pid || prev?.event) && <span className="os-bubble-name">{m.name}</span>}
              <div className={`os-bubble ${mine ? 'os-bubble--me' : ''}`}>{m.text}</div>
            </div>
            {i === receiptAt && <p className="os-receipt">Delivered</p>}
          </React.Fragment>
        );
      })}
      <div ref={end} />
    </div>
  );
}

function SystemThread({ list, ctx }) {
  const end = useRef(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [list.length]);
  if (!list.length) return <Empty glyph="dots" line="Nothing yet. Results arrive with the morning board." />;
  return (
    <div className="os-thread">
      {list.map((d, i) => {
        const day = !list[i - 1] || list[i - 1].cycle !== d.cycle;
        const alert = ((d.kind === 'check' || d.kind === 'seance') && d.team === 'killers') || (d.kind === 'trace' && d.hit) || d.kind === 'recruited' || (d.kind === 'watch' && d.seen);
        return (
          <React.Fragment key={d.id}>
            {day && <p className="os-stamp-time">DAY {d.cycle}</p>}
            <div className="os-bubble-row">
              <div className={`os-bubble ${alert ? 'os-bubble--alert' : d.kind === 'voice' ? 'os-bubble--voice' : 'os-bubble--sys'}`}>
                {systemText(d, ctx)}
                {d.kind === 'fact' && (
                  <button type="button" className="os-btn os-btn--sm mt-2" onClick={() => ctx.open('gallery')}>Open Gallery</button>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={end} />
    </div>
  );
}

/** The compose bar: a rounded field and a glossy Send. */
export function Compose({ gid, channel, me, placeholder = 'Message' }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText('');
    setError('');
    try {
      await sendToChannel(gid, channel, me.pid, me.name, t);
      sfxSent();
    } catch (err) {
      setText(t);
      setError(err.code === 'permission-denied' ? 'You can’t post here.' : 'Not sent. Try again.');
    }
  };
  return (
    <form className="os-compose" onSubmit={send}>
      <input value={text} maxLength={280} onChange={(e) => setText(e.target.value)} placeholder={error || placeholder} aria-label={placeholder} enterKeyHint="send" />
      <button type="submit" className="os-btn os-btn--sm" style={{ minHeight: 36 }} disabled={!text.trim()}>Send</button>
    </form>
  );
}
