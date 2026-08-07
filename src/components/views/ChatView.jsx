import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Send } from '../icons/ChatIcons';
import { ScreenBrief } from '../ui/ScreenBrief';
import { InfoTip } from '../ui/InfoTip';
import { TOOLTIPS } from '../../data/tooltips';

/**
 * Comms (DESIGN_LANGUAGE.md §9, "Comms").
 *
 * This screen used to be orange — a third accent the system doesn't have. Now
 * the player's own messages are the one signal element (a bubble is a tag-sized
 * area, not a field of red), everyone else's are ink-raised with a hairline,
 * and names are mono in signal-lift, which is the AA-safe red for small text
 * on ink (§2.4).
 *
 * Self-framed: it owns the viewport below the chrome rail (`--chrome-h`, defined
 * in index.css) so the composer can stay pinned above the keyboard.
 */
export const ChatView = ({ myCharacter, note, currentRound = 0 }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [swipeState, setSwipeState] = useState({});
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Ids present when the channel first loaded. Anything not in here arrived
  // while the player was watching, and only those animate in — otherwise
  // opening Comms plays a hundred entrance animations at once for a backlog the
  // player has already read.
  const seenIdsRef = useRef(null);
  const didFirstScrollRef = useRef(false);

  const vibrate = (pattern = [200]) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  useEffect(() => {
    // The first scroll jumps; every one after it glides. Smooth-scrolling the
    // whole backlog on open means several seconds of the channel flying past
    // before the player can read the newest message.
    const behavior = didFirstScrollRef.current ? 'smooth' : 'auto';
    didFirstScrollRef.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, [messages]);

  // Subscribe to messages in real-time
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const incoming = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        // Buzz on a new message from someone else (not on initial load).
        if (lastMessageCount > 0 && incoming.length > lastMessageCount) {
          const newestMessage = incoming[incoming.length - 1];
          if (newestMessage.characterId !== myCharacter.id) {
            vibrate([100, 50, 100]);
          }
        }

        // Seed on the first snapshot so the backlog counts as already seen.
        if (seenIdsRef.current === null) {
          seenIdsRef.current = new Set(incoming.map((m) => m.id));
        }

        // Freshness is decided here, not in render: refs must not be read during
        // render, and this is also the only place that knows what "new" means.
        // The flag is sticky rather than cleared on the next snapshot — pulling
        // the class off a bubble mid-animation would cut the entrance short.
        const seen = seenIdsRef.current;
        const messageData = incoming.map((m) =>
          seen.has(m.id) ? m : { ...m, isFresh: true }
        );

        setMessages(messageData);
        setLastMessageCount(messageData.length);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [lastMessageCount, myCharacter.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      if (editingMessage) {
        const messageRef = doc(db, 'messages', editingMessage.id);
        await updateDoc(messageRef, {
          message: newMessage.trim(),
          edited: true,
          editedAt: serverTimestamp(),
        });
        setEditingMessage(null);
      } else {
        await addDoc(collection(db, 'messages'), {
          characterId: myCharacter.id,
          characterName: myCharacter.name,
          message: newMessage.trim(),
          timestamp: serverTimestamp(),
          createdAt: Date.now(),
          replyTo: replyTo ? {
            id: replyTo.id,
            characterName: replyTo.characterName,
            message: replyTo.message.substring(0, 50) + (replyTo.message.length > 50 ? '...' : '')
          } : null,
        });
      }
      setNewMessage('');
      setReplyTo(null);
      vibrate([50]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Check Firebase configuration.');
      vibrate([100, 50, 100, 50, 100]);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Delete this message?')) {
      try {
        await deleteDoc(doc(db, 'messages', messageId));
        vibrate([100]);
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message.');
        vibrate([100, 50, 100, 50, 100]);
      }
    }
    setContextMenu(null);
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    setNewMessage(msg.message);
    setContextMenu(null);
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
    setSwipeState({});
  };

  const cancelReply = () => setReplyTo(null);

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  // Touch handlers for swipe-to-reply
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e, msg) => {
    if (!touchStartX.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 20) {
      const isMe = msg.characterId === myCharacter.id;
      const swipeDirection = diffX > 0 ? 'right' : 'left';

      // Mine: swipe left to reply. Theirs: swipe right to reply.
      if ((isMe && swipeDirection === 'left' && diffX < -30) ||
          (!isMe && swipeDirection === 'right' && diffX > 30)) {
        setSwipeState({ [msg.id]: Math.min(Math.abs(diffX), 80) });
      } else {
        setSwipeState({ [msg.id]: 0 });
      }
    }
  };

  const handleTouchEnd = (e, msg) => {
    const swipeDistance = swipeState[msg.id] || 0;

    if (swipeDistance > 60) {
      handleReply(msg);
      vibrate([50]);
    }

    setSwipeState({});
    touchStartX.current = 0;
    touchStartY.current = 0;
  };

  // Long press for edit/delete on your own messages
  const handleTouchStartLongPress = (e, msg) => {
    if (msg.characterId !== myCharacter.id) return;

    const timer = setTimeout(() => {
      setContextMenu({ messageId: msg.id, message: msg });
      vibrate([100, 50, 100]);
    }, 500);

    setLongPressTimer(timer);
  };

  const handleTouchEndLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div
        className="fixed inset-x-0 bottom-0 flex items-center justify-center bg-ink"
        style={{ top: 'var(--chrome-h)' }}
      >
        <div className="text-center er-enter">
          <div className="w-8 h-8 border-2 border-signal border-t-transparent mx-auto mb-4 animate-spin" />
          <p className="er-mono er-mono--dim">Opening channel…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 flex flex-col bg-ink overflow-hidden"
      style={{ top: 'var(--chrome-h)' }}
    >
      {/* Kicker + title, in the same frame every other screen uses */}
      <div className="shrink-0 px-4 pt-5 pb-4 border-b border-line">
        <p className="er-mono er-mono--hot er-mono--wide">Encrypted</p>
        <div className="flex items-baseline justify-between gap-3 mt-2">
          <div className="flex items-center gap-2.5">
            <h1 className="er-title text-[28px]">Comms</h1>
            {/* Every message is signed and nothing can be unsaid — the screen
                note says so in rounds 00–01 and then stops (§6.13). */}
            <InfoTip tip={TOOLTIPS.comms} className="self-center" />
          </div>
          <span className="er-mono er-mono--dim truncate">{myCharacter.name}</span>
        </div>

        <ScreenBrief note={note} currentRound={currentRound} className="mt-4" />
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-3"
        style={{
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
        }}
        onClick={() => setContextMenu(null)}
      >
        {messages.length === 0 ? (
          <p className="font-body text-[15px] leading-[1.55] text-dim text-center py-12">
            Nothing on the channel yet. Say something.
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.characterId === myCharacter.id;
            const swipeOffset = swipeState[msg.id] || 0;
            // Flagged by the snapshot handler. Keyframes only run once per mount,
            // so a sticky flag replays nothing on later re-renders.
            const isNew = Boolean(msg.isFresh);

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} relative`}
                onTouchStart={(e) => {
                  handleTouchStart(e);
                  handleTouchStartLongPress(e, msg);
                }}
                onTouchMove={(e) => handleTouchMove(e, msg)}
                onTouchEnd={(e) => {
                  handleTouchEnd(e, msg);
                  handleTouchEndLongPress();
                }}
                style={{
                  transform: isMe ? `translateX(-${swipeOffset}px)` : `translateX(${swipeOffset}px)`,
                  transition: swipeOffset === 0 ? 'transform 0.2s ease-out' : 'none',
                }}
              >
                {/* Swipe-to-reply marker. Kept mounted and scaled/faded rather
                    than switched in and out, so it grows under the thumb as the
                    swipe passes the threshold instead of blinking into place. */}
                <span
                  aria-hidden="true"
                  className={`er-mono er-mono--hot absolute top-1/2 -translate-y-1/2 origin-center transition-[opacity,scale] duration-200 ease-out ${
                    isMe ? 'right-full mr-2' : 'left-full ml-2'
                  } ${swipeOffset > 30 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                >
                  Reply
                </span>

                <div
                  className={`max-w-[78%] sm:max-w-[65%] px-3 py-2.5 border ${
                    isNew ? (isMe ? 'er-enter-right' : 'er-enter-left') : ''
                  } ${
                    isMe
                      ? 'bg-signal border-signal text-white'
                      : 'bg-ink-raised border-line text-bone'
                  }`}
                >
                  {!isMe && (
                    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-signal-lift mb-1.5">
                      {msg.characterName || 'Unknown'}
                    </p>
                  )}

                  {/* Reply preview */}
                  {msg.replyTo && (
                    <div
                      className={`mb-2 pl-2.5 py-1 border-l-2 ${
                        isMe ? 'border-white/50' : 'border-signal'
                      }`}
                    >
                      <p
                        className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                          isMe ? 'text-white/75' : 'text-dim'
                        }`}
                      >
                        {msg.replyTo.characterName}
                      </p>
                      <p
                        className={`font-body text-[13px] leading-[1.4] truncate ${
                          isMe ? 'text-white/85' : 'text-dim'
                        }`}
                      >
                        {msg.replyTo.message}
                      </p>
                    </div>
                  )}

                  <p className="font-body text-[15px] leading-[1.5] break-words">{msg.message}</p>

                  <p
                    className={`font-mono text-[10px] uppercase tracking-[0.18em] mt-1.5 ${
                      isMe ? 'text-white/65' : 'text-dim-2'
                    }`}
                  >
                    {formatTime(msg.timestamp || msg.createdAt)}
                    {msg.edited && ' · edited'}
                  </p>
                </div>

                {/* Long-press menu */}
                {contextMenu?.messageId === msg.id && (
                  <div className="absolute bottom-full mb-2 right-0 z-20 bg-ink-raised border border-line er-enter">
                    <button
                      onClick={() => handleEditMessage(msg)}
                      className="er-touch block w-full px-5 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-bone"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="er-touch block w-full px-5 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-signal-lift border-t border-line-faint"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply / edit bar */}
      {(replyTo || editingMessage) && (
        <div className="er-swap shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 bg-ink-raised border-t border-line">
          <div className="min-w-0">
            <p className="er-mono er-mono--hot">
              {editingMessage ? 'Editing' : `Replying to ${replyTo.characterName}`}
            </p>
            <p className="font-body text-[13px] leading-[1.4] text-dim truncate mt-1">
              {editingMessage ? editingMessage.message : replyTo.message}
            </p>
          </div>
          <button
            onClick={editingMessage ? cancelEdit : cancelReply}
            aria-label="Cancel"
            className="er-touch shrink-0 px-3 er-mono er-mono--dim"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Composer */}
      <div className="shrink-0 border-t border-line bg-ink-raised px-4 py-3 pb-safe">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={editingMessage ? 'Edit your message…' : 'Type a message…'}
            disabled={sending}
            aria-label="Message"
            className="flex-1 min-w-0 bg-ink border border-line px-3 py-3 font-body text-[15px] text-bone placeholder:text-dim-2 focus:border-signal disabled:opacity-50 transition-colors duration-150"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            aria-label={editingMessage ? 'Save message' : 'Send message'}
            className="er-touch er-touch--hot shrink-0 flex items-center gap-2 px-4 bg-signal border border-signal text-white font-mono text-[11px] font-medium uppercase tracking-[0.24em] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} className={sending ? 'opacity-60' : ''} />
            <span className="hidden sm:inline">{editingMessage ? 'Save' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
