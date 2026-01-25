import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Send } from '../icons/ChatIcons';

export const ChatView = ({ myCharacter, voteCounts, currentRound }) => {
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

  // Check if any voting has occurred (after first round)
  const hasVotingOccurred = Object.keys(voteCounts || {}).length > 0;

  // Vibration function - works on mobile devices
  const vibrate = (pattern = [200]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to messages in real-time
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100) // Last 100 messages
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messageData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Vibrate on new message from others (not initial load)
        if (lastMessageCount > 0 && messageData.length > lastMessageCount) {
          const newestMessage = messageData[messageData.length - 1];
          // Only vibrate if message is from someone else
          if (newestMessage.characterId !== myCharacter.id) {
            vibrate([100, 50, 100]); // Double buzz pattern
          }
        }
        
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
        // Update existing message
        const messageRef = doc(db, 'messages', editingMessage.id);
        await updateDoc(messageRef, {
          message: newMessage.trim(),
          edited: true,
          editedAt: serverTimestamp(),
        });
        setEditingMessage(null);
      } else {
        // Send new message
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

  const cancelReply = () => {
    setReplyTo(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  // Touch handlers for swipe-to-reply
  const handleTouchStart = (e, msg) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e, msg) => {
    if (!touchStartX.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;
    
    // Only trigger swipe if horizontal movement is more than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 20) {
      const isMe = msg.characterId === myCharacter.id;
      const swipeDirection = diffX > 0 ? 'right' : 'left';
      
      // For my messages: swipe left to reply
      // For others' messages: swipe right to reply
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

  // Long press handlers for edit/delete
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
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 animate-fade-in">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500 font-bold">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 top-[4.5rem] bottom-0 flex flex-col animate-fade-in overflow-hidden">
      {/* Fixed Header - Won't scroll */}
      <div className="bg-orange-500 p-3 border-b-4 border-stone-900 shadow-sm flex-shrink-0 relative z-10">
        <h2 className="text-xl sm:text-2xl font-black text-white text-center uppercase tracking-wide">
          🔍 Investigator Chat
        </h2>
        <p className="text-xs text-orange-100 text-center mt-1 font-bold">
          Discuss clues and theories with fellow suspects
        </p>
      </div>

      {/* Messages Container - Scrollable area only */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3 custom-scrollbar"
        style={{ 
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch'
        }}
        onClick={() => setContextMenu(null)}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-400 italic">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.characterId === myCharacter.id;
            const swipeOffset = swipeState[msg.id] || 0;
            
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} relative`}
                onTouchStart={(e) => {
                  handleTouchStart(e, msg);
                  handleTouchStartLongPress(e, msg);
                }}
                onTouchMove={(e) => handleTouchMove(e, msg)}
                onTouchEnd={(e) => {
                  handleTouchEnd(e, msg);
                  handleTouchEndLongPress();
                }}
                style={{
                  transform: isMe 
                    ? `translateX(-${swipeOffset}px)` 
                    : `translateX(${swipeOffset}px)`,
                  transition: swipeOffset === 0 ? 'transform 0.2s ease-out' : 'none'
                }}
              >
                {/* Reply indicator */}
                {swipeOffset > 30 && (
                  <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? 'right-full mr-2' : 'left-full ml-2'}`}>
                    <div className="text-orange-500 text-2xl animate-pulse">
                      ↩️
                    </div>
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] sm:max-w-[65%] ${
                    isMe
                      ? 'bg-orange-500 text-white border-2 border-orange-700'
                      : 'bg-white text-stone-900 border-2 border-stone-900'
                  } p-3 rounded-lg shadow-sketch relative`}
                  style={{ transform: isMe ? 'rotate(0.5deg)' : 'rotate(-0.5deg)' }}
                >
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-stone-800 text-white rounded-full flex items-center justify-center text-xs font-black">
                        {msg.characterName?.charAt(0) || '?'}
                      </div>
                      <span className="text-xs font-black text-stone-700 uppercase">
                        {msg.characterName || 'Unknown'}
                      </span>
                    </div>
                  )}
                  
                  {/* Reply preview */}
                  {msg.replyTo && (
                    <div className={`mb-2 p-2 rounded border-l-4 ${
                      isMe 
                        ? 'bg-orange-600 border-orange-300' 
                        : 'bg-stone-100 border-stone-400'
                    }`}>
                      <div className="text-xs font-bold opacity-75 mb-1">
                        ↩️ {msg.replyTo.characterName}
                      </div>
                      <div className="text-xs opacity-80 italic truncate">
                        {msg.replyTo.message}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm sm:text-base font-bold leading-snug break-words">
                    {msg.message}
                  </p>
                  
                  <span
                    className={`text-[10px] mt-1 flex items-center gap-1 ${
                      isMe ? 'text-orange-100' : 'text-stone-400'
                    }`}
                  >
                    {formatTime(msg.timestamp || msg.createdAt)}
                    {msg.edited && <span className="italic">(edited)</span>}
                  </span>
                </div>

                {/* Context Menu */}
                {contextMenu?.messageId === msg.id && (
                  <div className="absolute bottom-full mb-2 right-0 bg-white border-2 border-stone-900 shadow-lg rounded-lg overflow-hidden z-20 animate-fade-in">
                    <button
                      onClick={() => handleEditMessage(msg)}
                      className="block w-full px-4 py-2 text-left text-sm font-bold text-stone-900 hover:bg-orange-500 hover:text-white transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="block w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors border-t border-stone-200"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply/Edit Bar */}
      {(replyTo || editingMessage) && (
        <div className="bg-orange-100 border-t-2 border-stone-300 px-3 py-2 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-orange-700">
              {editingMessage ? '✏️ Editing message' : `↩️ Replying to ${replyTo.characterName}`}
            </div>
            <div className="text-xs text-stone-600 truncate">
              {editingMessage ? editingMessage.message : replyTo.message}
            </div>
          </div>
          <button
            onClick={editingMessage ? cancelEdit : cancelReply}
            className="ml-2 text-stone-600 hover:text-stone-900 font-bold text-xl"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Form - Fixed at bottom */}
      <div className="border-t-4 border-stone-900 bg-stone-800 p-3 shadow-lg flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={editingMessage ? "Edit your message..." : "Type your message..."}
            disabled={sending}
            className="flex-1 bg-white border-2 border-stone-900 px-3 py-2 sm:py-3 text-sm sm:text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 border-2 border-orange-700 font-black uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-1 transition-transform flex items-center gap-2"
          >
            <Send size={18} />
            <span className="hidden sm:inline">{editingMessage ? 'Save' : 'Send'}</span>
          </button>
        </form>
        <p className="text-xs text-stone-400 mt-2 text-center">
          Chatting as <span className="text-orange-400 font-bold">{myCharacter.name}</span>
        </p>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
