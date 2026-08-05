import React from 'react';
import { User, Search, FileText, Users } from '../icons/IconComponents';
import { MessageBubble } from '../icons/ChatIcons';

const TABS = [
  { id: 'DASHBOARD', label: 'ID', Icon: User },
  { id: 'INTEL', label: 'Clues', Icon: Search },
  { id: 'CHAT', label: 'Chat', Icon: MessageBubble },
  { id: 'FILES', label: 'Files', Icon: FileText },
  { id: 'DOSSIER', label: 'Guests', Icon: Users },
];

/**
 * A bottom tab bar. Currently unused — the app navigates through GridMenu —
 * but kept on-system so it can't reintroduce the old orange-on-stone palette
 * if it is ever wired back in. Active state is signal-lift, which is the
 * AA-safe red for text under 18px on ink (DESIGN_LANGUAGE.md §2.4).
 */
export const Navigation = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 w-full bg-ink border-t border-line pb-safe z-30">
      <div className="flex justify-around items-stretch h-16 max-w-2xl mx-auto">
        {TABS.map((tab) => {
          const { id, label } = tab;
          // Assigned rather than destructured in the parameter list: this repo's
          // ESLint has no eslint-plugin-react, so JSX usage isn't tracked and a
          // destructured `Icon` param would read as unused.
          const Icon = tab.Icon;
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`er-touch flex flex-col items-center justify-center gap-1.5 w-full ${
                isActive ? 'text-signal-lift' : 'text-dim-2'
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span className={`er-mono ${isActive ? 'er-mono--hot' : ''}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
