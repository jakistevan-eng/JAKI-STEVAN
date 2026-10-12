import React, { useState } from 'react';
import {
  MessageSquare,
  Phone,
  CircleDot,
  Quote,
  Search,
  Plus,
  Users,
  Check,
  CheckCheck,
  Mic,
  MapPin,
  Sparkles,
  PhoneCall,
  Video,
  ArrowUpRight,
  ArrowDownLeft,
  PhoneMissed,
} from 'lucide-react';
import { Chat, User, StatusStory, CallRecord } from '../types';

interface SidebarProps {
  currentUser: User;
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (chatId: string) => void;
  statusStories: StatusStory[];
  callRecords: CallRecord[];
  onOpenStory: (index: number) => void;
  onOpenQuotesHub: () => void;
  onStartCall: (user: User, type: 'voice' | 'video') => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  chats,
  activeChatId,
  onSelectChat,
  statusStories,
  callRecords,
  onOpenStory,
  onOpenQuotesHub,
  onStartCall,
  onNewChat,
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'status' | 'calls'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'groups'>('all');

  // Filter chats
  const filteredChats = chats.filter((c) => {
    const matchesSearch =
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessage?.text || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'unread') return c.unreadCount > 0;
    if (filterType === 'groups') return Boolean(c.isGroup);
    return true;
  });

  const totalUnread = chats.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 select-none">
      {/* Top Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm ${currentUser.avatarBg}`}
            >
              {currentUser.avatarInitials}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              PulseChat
            </h1>
            <p className="text-[11px] text-slate-500 truncate max-w-[120px]">{currentUser.name}</p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenQuotesHub}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
            title="Quotes & Status Studio"
          >
            <Quote className="w-4 h-4 fill-amber-500 text-amber-500" />
          </button>
          <button
            type="button"
            onClick={onNewChat}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            title="New Conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tabs (Chats, Status, Calls) */}
      <div className="flex items-center px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'chats'
              ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chats</span>
          {totalUnread > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
              {totalUnread}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'status'
              ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CircleDot className="w-4 h-4" />
          <span>Status</span>
          {statusStories.some((s) => !s.isViewed) && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calls')}
          title="Calls - View call history"
          className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'calls'
              ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span style={{ color: '#8e6262' }}>Calls</span>
        </button>
      </div>

      {/* Tab 1: Chats List */}
      {activeTab === 'chats' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search bar & Filter Pills */}
          <div className="p-3 space-y-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or start new chat..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              {(['all', 'unread', 'groups'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setFilterType(filter)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors ${
                    filterType === filter
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Chats Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-850">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No conversations found.
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isActive = chat.id === activeChatId;
                const lastMsg = chat.lastMessage;
                const isSentByMe = lastMsg?.senderId === currentUser.id;

                return (
                  <div
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-colors relative ${
                      isActive
                        ? 'bg-slate-100/90 dark:bg-slate-800/80'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Contact Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm text-white shadow-xs ${chat.user.avatarBg}`}
                      >
                        {chat.user.avatarInitials}
                      </div>
                      {chat.user.status === 'online' && !chat.isGroup && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                          {chat.user.name}
                        </span>
                        {lastMsg && (
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {lastMsg.timestamp}
                          </span>
                        )}
                      </div>

                      {/* Last Message Preview */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                          {isSentByMe && (
                            <span className="shrink-0 text-emerald-600">
                              {lastMsg?.status === 'read' ? (
                                <CheckCheck className="w-3.5 h-3.5" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                            </span>
                          )}

                          {lastMsg?.type === 'voice' && (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <Mic className="w-3 h-3" />
                              <span>Voice note</span>
                            </span>
                          )}

                          {lastMsg?.type === 'location' && (
                            <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-medium">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{lastMsg.locationData?.placeName || 'Location'}</span>
                            </span>
                          )}

                          {lastMsg?.type === 'quote' && (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                              <Quote className="w-3 h-3 fill-current" />
                              <span className="truncate">“{lastMsg.quoteData?.text || lastMsg.text}”</span>
                            </span>
                          )}

                          {lastMsg?.type === 'text' && (
                            <span className="truncate">{lastMsg.text}</span>
                          )}
                        </div>

                        {chat.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Status / Stories View */}
      {activeTab === 'status' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* My Status */}
          <div
            onClick={onOpenQuotesHub}
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
          >
            <div className="relative">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white ${currentUser.avatarBg}`}
              >
                {currentUser.avatarInitials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                <Plus className="w-3 h-3" />
              </div>
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                My Status
              </div>
              <div className="text-xs text-slate-500">Tap to post a quote or update</div>
            </div>
          </div>

          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 px-2 pt-2">
            Recent updates
          </div>

          {/* Stories List */}
          <div className="space-y-1.5">
            {statusStories.map((story, index) => (
              <div
                key={story.id}
                onClick={() => onOpenStory(index)}
                className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-full p-0.5 ring-2 ${
                    story.isViewed ? 'ring-slate-300 dark:ring-slate-700' : 'ring-emerald-500'
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-white ${story.userAvatarBg}`}
                  >
                    {story.userAvatarInitials}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                    {story.userName}
                  </div>
                  <div className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                    <span>{story.timestamp}</span>
                    <span>·</span>
                    <span className="text-emerald-600 dark:text-emerald-400 italic">“{story.content.slice(0, 24)}...”</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Calls History View */}
      {activeTab === 'calls' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 px-2 mb-2">
            Recent Calls
          </div>

          {callRecords.map((record) => {
            const isMissed = record.direction === 'missed';
            const isIncoming = record.direction === 'incoming';

            return (
              <div
                key={record.id}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${record.userAvatarBg}`}
                  >
                    {record.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        isMissed ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {record.userName}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      {isMissed ? (
                        <PhoneMissed className="w-3.5 h-3.5 text-rose-500" />
                      ) : isIncoming ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span>{record.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Call back trigger */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const user = chats.find((c) => c.user.name === record.userName)?.user || currentUser;
                      onStartCall(user, record.type);
                    }}
                    className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    title={`Call back with ${record.type}`}
                  >
                    {record.type === 'video' ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <PhoneCall className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
};
