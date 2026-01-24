import React from 'react';
import { AlertTriangle, ShieldCheck } from '../icons/IconComponents';

export const FeedbackToast = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className={`fixed top-24 left-4 right-4 z-50 p-5 border-4 border-white rounded-3xl shadow-halloween-lg flex items-center gap-4 animate-pop-in backdrop-blur-sm ${
      feedback.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 
      feedback.type === 'success' ? 'bg-gradient-to-r from-halloween-green to-green-500 text-white' :
      'bg-gradient-to-r from-halloween-purple to-purple-600 text-white'
    }`}>
      <div className="text-3xl animate-bounce">
        {feedback.type === 'error' ? '❌' : feedback.type === 'success' ? '✅' : 'ℹ️'}
      </div>
      <span className="font-black text-base sm:text-xl" style={{ fontFamily: 'Fredoka, cursive' }}>{feedback.msg}</span>
    </div>
  );
};
