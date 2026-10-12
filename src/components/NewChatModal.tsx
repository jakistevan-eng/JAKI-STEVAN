import React, { useState } from 'react';
import { X, Search, UserPlus, Users, MessageSquare } from 'lucide-react';
import { User } from '../types';
import { CONTACT_USERS } from '../data/mockData';

interface NewChatModalProps {
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onSelectUser }) => {
  const [search, setSearch] = useState('');

  const filtered = CONTACT_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.bio?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">New Conversation</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or bio..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
              autoFocus
            />
          </div>
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-50 dark:divide-slate-850">
          {filtered.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                onSelectUser(user);
                onClose();
              }}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="relative">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs text-white ${user.avatarBg}`}
                >
                  {user.avatarInitials}
                </div>
                {user.status === 'online' && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                  {user.name}
                </div>
                <div className="text-xs text-slate-500 truncate">{user.bio}</div>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                title="Message"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
