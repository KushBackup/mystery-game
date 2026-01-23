import React from 'react';
import { AlertTriangle, ShieldCheck } from '../icons/IconComponents';

export const FeedbackToast = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className={`fixed top-20 left-4 right-4 z-50 p-4 border-4 shadow-sketch-lg flex items-center gap-3 animate-bounce-short rotate-1 ${
      feedback.type === 'error' ? 'bg-red-100 border-red-700 text-red-900' : 
      feedback.type === 'success' ? 'bg-green-100 border-green-700 text-green-900' :
      'bg-blue-100 border-blue-700 text-blue-900'
    }`}>
      {feedback.type === 'error' ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
      <span className="font-black text-sm sm:text-lg">{feedback.msg}</span>
    </div>
  );
};
