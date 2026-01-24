import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Send } from '../icons/ChatIcons';

export const ChatView = ({ myCharacter, voteCounts, currentRound }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

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
      await addDoc(collection(db, 'messages'), {
        characterId: myCharacter.id,
        characterName: myCharacter.name,
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        createdAt: Date.now(), // For immediate local sorting
      });
      setNewMessage('');
      // Haptic feedback on send
      vibrate([50]); // Quick tap
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Check Firebase configuration.');
      // Error vibration pattern
      vibrate([100, 50, 100, 50, 100]);
    } finally {
      setSending(false);
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
      <div className="bg-orange-500 p-3 border-b-4 border-stone-900 shadow-sm flex-shrink-0">
        <h2 className="text-xl sm:text-2xl font-black text-white text-center uppercase tracking-wide">
          🔍 Investigator Chat
        </h2>
        <p className="text-xs text-orange-100 text-center mt-1 font-bold">
          Discuss clues and theories with fellow detectives
        </p>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3 custom-scrollbar"
        style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-400 italic">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.characterId === myCharacter.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
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
                  <p className="text-sm sm:text-base font-bold leading-snug break-words">
                    {msg.message}
                  </p>
                  <span
                    className={`text-[10px] mt-1 block ${
                      isMe ? 'text-orange-100' : 'text-stone-400'
                    }`}
                  >
                    {formatTime(msg.timestamp || msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t-4 border-stone-900 bg-stone-800 p-3 shadow-lg flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
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
            <span className="hidden sm:inline">Send</span>
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
