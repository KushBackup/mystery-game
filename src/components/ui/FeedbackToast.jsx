import React from 'react';
import { AlertTriangle, ShieldCheck } from '../icons/IconComponents';

export const FeedbackToast = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className={`fixed top-24 left-4 right-4 z-50 p-5 border-2 shadow-2xl flex items-center gap-4 animate-pop-in backdrop-blur-sm ${
      feedback.type === 'error' ? 'bg-red-900 border-red-700 text-white' : 
      feedback.type === 'success' ? 'bg-emerald-900 border-emerald-700 text-white' :
      'bg-mystery-charcoal border-mystery-blood text-mystery-paper'
    }`}>
      <div className="text-3xl animate-bounce">
        {feedback.type === 'error' ? '❌' : feedback.type === 'success' ? '✅' : 'ℹ️'}
      </div>
      <span className="font-typewriter font-bold text-base sm:text-xl uppercase tracking-wide">{feedback.msg}</span>
    </div>
  );
};
