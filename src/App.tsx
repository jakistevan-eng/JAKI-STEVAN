import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CallModal } from './components/CallModal';
import { LocationModal } from './components/LocationModal';
import { QuotesHubModal } from './components/QuotesHubModal';
import { StatusViewer } from './components/StatusViewer';
import { NewChatModal } from './components/NewChatModal';
import {
  Chat,
  Message,
  User,
  StatusStory,
  CallRecord,
  ActiveCall,
  LocationData,
  QuoteData,
} from './types';
import {
  CURRENT_USER,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  INITIAL_STATUS_STORIES,
  INITIAL_CALL_RECORDS,
  CONTACT_USERS,
} from './data/mockData';
import {
  playMessageSentSound,
  playMessageReceivedSound,
} from './utils/audio';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY_CHATS = 'pulsechat_chats_v1';
const STORAGE_KEY_MESSAGES = 'pulsechat_messages_v1';
const STORAGE_KEY_STORIES = 'pulsechat_stories_v1';
const STORAGE_KEY_CALLS = 'pulsechat_calls_v1';

export default function App() {
  const [currentUser] = useState<User>(CURRENT_USER);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Chats state
  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHATS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CHATS;
  });

  // Messages by chatId
  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MESSAGES;
  });

  // Active chat id
  const [activeChatId, setActiveChatId] = useState<string>(INITIAL_CHATS[0].id);

  // Status stories state
  const [statusStories, setStatusStories] = useState<StatusStory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STORIES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STATUS_STORIES;
  });

  // Call history records
  const [callRecords, setCallRecords] = useState<CallRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CALLS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CALL_RECORDS;
  });

  // Modals & Overlays state
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showQuotesHubModal, setShowQuotesHubModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);

  // Typing simulator state
  const [isContactTyping, setIsContactTyping] = useState(false);

  // Mobile navigation state
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messagesByChat));
      localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(statusStories));
      localStorage.setItem(STORAGE_KEY_CALLS, JSON.stringify(callRecords));
    } catch {}
  }, [chats, messagesByChat, statusStories, callRecords]);

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const activeMessages = messagesByChat[activeChatId] || [];

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setShowMobileChat(true);

    // Clear unread
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Helper to trigger realistic simulated or Gemini AI reply from the contact
  const scheduleSimulatedReply = async (chat: Chat, userMsg: Message) => {
    if (chat.isGroup) return;

    // 1. If talking to Gemini AI Assistant, use real multi-turn /api/chat
    if (chat.user.id === 'user_gemini') {
      setIsContactTyping(true);
      try {
        const history = [...(messagesByChat[chat.id] || []), userMsg].map((m) => ({
          role: m.senderId === currentUser.id ? 'user' : 'model',
          content: m.text,
        }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            model: 'gemini-3.5-flash',
          }),
        });

        const data = await res.json();
        const replyText =
          data.reply ||
          data.error ||
          "I'm here to help you write messages, quotes, or brainstorm ideas!";

        const replyMsg: Message = {
          id: `m_${Date.now()}`,
          chatId: chat.id,
          senderId: chat.user.id,
          senderName: chat.user.name,
          type: 'text',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          reactions: {},
        };

        playMessageReceivedSound();

        setMessagesByChat((prev) => ({
          ...prev,
          [chat.id]: [...(prev[chat.id] || []), replyMsg],
        }));

        setChats((prev) =>
          prev.map((c) =>
            c.id === chat.id
              ? {
                  ...c,
                  lastMessage: replyMsg,
                  unreadCount: activeChatId === chat.id ? 0 : c.unreadCount + 1,
                }
              : c
          )
        );
      } catch {
        // Fallback response if offline
        const replyMsg: Message = {
          id: `m_${Date.now()}`,
          chatId: chat.id,
          senderId: chat.user.id,
          senderName: chat.user.name,
          type: 'text',
          text: "I received your message! Let me know if you need help drafting quotes, notes, or ideas.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          reactions: {},
        };
        setMessagesByChat((prev) => ({
          ...prev,
          [chat.id]: [...(prev[chat.id] || []), replyMsg],
        }));
      } finally {
        setIsContactTyping(false);
      }
      return;
    }

    // 2. Regular contacts simulation
    setTimeout(() => {
      setIsContactTyping(true);

      setTimeout(() => {
        setIsContactTyping(false);

        let replyText = 'Thanks for your message! Looking forward to it.';
        if (userMsg.type === 'voice') {
          replyText = 'Loved your voice note! Audio came through super clear 👍';
        } else if (userMsg.type === 'location') {
          replyText = `Great location! I’ve pinned ${userMsg.locationData?.placeName || 'that spot'} on my map.`;
        } else if (userMsg.type === 'quote') {
          replyText = `“${userMsg.quoteData?.text || 'That thought'}” — truly inspirational quote! Saving this ✨`;
        } else {
          const lower = userMsg.text.toLowerCase();
          if (lower.includes('call') || lower.includes('video')) {
            replyText = "I'm free now! You can hit the Call button above anytime.";
          } else if (lower.includes('hello') || lower.includes('hey') || lower.includes('hi')) {
            replyText = `Hey ${currentUser.name}! How are you doing today?`;
          } else if (lower.includes('quote')) {
            replyText = 'Quotes give such great perspective on life. Love seeing people share them!';
          } else {
            const genericReplies = [
              'Got it! That sounds like a great plan.',
              'Totally agree with you on that.',
              'Super cool! Let me check on that right away.',
              'Nice! Thanks for sharing this.',
            ];
            replyText = genericReplies[Math.floor(Math.random() * genericReplies.length)];
          }
        }

        const replyMsg: Message = {
          id: `m_${Date.now()}`,
          chatId: chat.id,
          senderId: chat.user.id,
          senderName: chat.user.name,
          type: 'text',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          reactions: {},
        };

        playMessageReceivedSound();

        setMessagesByChat((prev) => ({
          ...prev,
          [chat.id]: [...(prev[chat.id] || []), replyMsg],
        }));

        setChats((prev) =>
          prev.map((c) =>
            c.id === chat.id
              ? {
                  ...c,
                  lastMessage: replyMsg,
                  unreadCount: activeChatId === chat.id ? 0 : c.unreadCount + 1,
                }
              : c
          )
        );
      }, 1800);
    }, 1200);
  };

  // Audio transcription handler using gemini-3.5-transcribe
  const handleTranscribeVoiceNote = async (messageId: string) => {
    const currentMsg = (messagesByChat[activeChatId] || []).find((m) => m.id === messageId);
    if (!currentMsg || !currentMsg.voiceData) return;

    // Set isTranscribing loading state
    setMessagesByChat((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).map((m) =>
        m.id === messageId
          ? { ...m, voiceData: { ...m.voiceData!, isTranscribing: true } }
          : m
      ),
    }));

    try {
      let audioBase64 = '';
      let mimeType = 'audio/webm';

      if (currentMsg.voiceData.audioBlobUrl) {
        const response = await fetch(currentMsg.voiceData.audioBlobUrl);
        const blob = await response.blob();
        mimeType = blob.type || 'audio/webm';
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        audioBase64 = btoa(binary);
      }

      if (!audioBase64) {
        audioBase64 = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      }

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType }),
      });

      const data = await res.json();
      const transcriptionText = data.transcription || 'Voice message verified.';

      setMessagesByChat((prev) => ({
        ...prev,
        [activeChatId]: (prev[activeChatId] || []).map((m) =>
          m.id === messageId
            ? {
                ...m,
                voiceData: {
                  ...m.voiceData!,
                  isTranscribing: false,
                  transcription: transcriptionText,
                },
              }
            : m
        ),
      }));
    } catch {
      setMessagesByChat((prev) => ({
        ...prev,
        [activeChatId]: (prev[activeChatId] || []).map((m) =>
          m.id === messageId
            ? {
                ...m,
                voiceData: {
                  ...m.voiceData!,
                  isTranscribing: false,
                  transcription: 'Voice memo: "Hey, looking forward to catching up soon!"',
                },
              }
            : m
        ),
      }));
    }
  };

  const handleSendMessage = (
    text: string,
    type: 'text' | 'voice' | 'location' | 'quote' = 'text',
    extra?: {
      voiceData?: { duration: number; audioBlobUrl?: string; waveform: number[] };
      locationData?: LocationData;
      quoteData?: QuoteData;
    }
  ) => {
    const newMsg: Message = {
      id: `m_${Date.now()}`,
      chatId: activeChatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      type,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      voiceData: extra?.voiceData,
      locationData: extra?.locationData,
      quoteData: extra?.quoteData,
      reactions: {},
    };

    playMessageSentSound();

    // Append to messages
    setMessagesByChat((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    // Update chat preview & bump to top
    setChats((prev) => {
      const updated = prev.map((c) =>
        c.id === activeChatId ? { ...c, lastMessage: newMsg } : c
      );
      return updated;
    });

    // Simulate delivered & read ticks
    setTimeout(() => {
      setMessagesByChat((prev) => {
        const chatMsgs = prev[activeChatId] || [];
        return {
          ...prev,
          [activeChatId]: chatMsgs.map((m) =>
            m.id === newMsg.id ? { ...m, status: 'delivered' } : m
          ),
        };
      });
    }, 800);

    setTimeout(() => {
      setMessagesByChat((prev) => {
        const chatMsgs = prev[activeChatId] || [];
        return {
          ...prev,
          [activeChatId]: chatMsgs.map((m) =>
            m.id === newMsg.id ? { ...m, status: 'read' } : m
          ),
        };
      });
    }, 1600);

    // Schedule automated reply
    scheduleSimulatedReply(activeChat, newMsg);
  };

  const handleReactMessage = (messageId: string, emoji: string) => {
    setMessagesByChat((prev) => {
      const chatMsgs = prev[activeChatId] || [];
      const updated = chatMsgs.map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = { ...m.reactions };
        const userList = currentReactions[emoji] || [];

        if (userList.includes(currentUser.id)) {
          // toggle off
          const filtered = userList.filter((id) => id !== currentUser.id);
          if (filtered.length === 0) {
            delete currentReactions[emoji];
          } else {
            currentReactions[emoji] = filtered;
          }
        } else {
          // add reaction
          currentReactions[emoji] = [...userList, currentUser.id];
        }

        return { ...m, reactions: currentReactions };
      });

      return { ...prev, [activeChatId]: updated };
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessagesByChat((prev) => {
      const chatMsgs = (prev[activeChatId] || []).filter((m) => m.id !== messageId);
      return { ...prev, [activeChatId]: chatMsgs };
    });
  };

  // Start Call (Voice or Video)
  const handleStartCall = (user: User, type: 'voice' | 'video') => {
    setActiveCall({
      id: `call_${Date.now()}`,
      user,
      type,
      direction: 'outgoing',
      status: 'ringing',
      durationSeconds: 0,
      isMuted: false,
      isVideoEnabled: type === 'video',
      isSpeakerOn: true,
    });
  };

  const handleEndCall = (durationSeconds: number) => {
    if (activeCall) {
      // Record call history
      const durationStr =
        durationSeconds > 0
          ? `${Math.floor(durationSeconds / 60)} min ${durationSeconds % 60} sec`
          : 'Cancelled';

      const newRecord: CallRecord = {
        id: `rec_${Date.now()}`,
        type: activeCall.type,
        direction: 'outgoing',
        userId: activeCall.user.id,
        userName: activeCall.user.name,
        userAvatarBg: activeCall.user.avatarBg,
        timestamp: 'Just now',
        duration: durationStr,
      };

      setCallRecords((prev) => [newRecord, ...prev]);
    }
    setActiveCall(null);
  };

  // Send Location
  const handleSendLocation = (loc: LocationData) => {
    handleSendMessage(`📍 Shared location: ${loc.placeName}`, 'location', {
      locationData: loc,
    });
  };

  // Send Quote to Chat
  const handleSendQuoteToChat = (q: QuoteData) => {
    handleSendMessage(`“${q.text}” — ${q.author}`, 'quote', {
      quoteData: q,
    });
  };

  // Post Quote to Status Stories
  const handlePostQuoteToStatus = (q: QuoteData) => {
    const newStory: StatusStory = {
      id: `story_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatarBg: currentUser.avatarBg,
      userAvatarInitials: currentUser.avatarInitials,
      timestamp: 'Just now',
      type: 'quote',
      content: q.text,
      author: q.author,
      gradient:
        q.theme === 'emerald'
          ? 'from-emerald-600 via-teal-700 to-cyan-800'
          : q.theme === 'amber'
          ? 'from-amber-500 via-orange-600 to-rose-700'
          : q.theme === 'violet'
          ? 'from-purple-600 via-violet-700 to-indigo-900'
          : q.theme === 'rose'
          ? 'from-rose-500 via-pink-600 to-rose-800'
          : q.theme === 'ocean'
          ? 'from-blue-600 via-cyan-700 to-sky-900'
          : 'from-slate-900 via-zinc-900 to-neutral-950',
      viewsCount: 1,
      isViewed: false,
    };

    setStatusStories((prev) => [newStory, ...prev]);
  };

  const handleNewChatSelectUser = (user: User) => {
    const existing = chats.find((c) => c.user.id === user.id);
    if (existing) {
      handleSelectChat(existing.id);
    } else {
      const newChat: Chat = {
        id: `chat_${user.id}`,
        user,
        unreadCount: 0,
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setShowMobileChat(true);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased overflow-hidden">
      {/* Top Universal App Bar */}
      <header
        style={{ color: '#ffffff', borderColor: '#600000' }}
        className="h-12 px-4 sm:px-6 bg-emerald-700 dark:bg-slate-900 text-white flex items-center justify-between shrink-0 border-b z-30 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs tracking-wider">
            PC
          </div>
          <span className="font-bold text-sm tracking-tight">PulseChat Messenger</span>
          <span className="hidden sm:inline text-xs text-emerald-200 dark:text-slate-400">
            · Voice · Video · Audio · Quotes · Location · Emojis
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Dark/Light Mode Switcher */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Messenger Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar: Chat List, Status, Calls */}
        <div
          className={`h-full ${
            showMobileChat ? 'hidden md:flex' : 'flex'
          } w-full md:w-auto shrink-0`}
        >
          <Sidebar
            currentUser={currentUser}
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            statusStories={statusStories}
            callRecords={callRecords}
            onOpenStory={(index) => setViewingStoryIndex(index)}
            onOpenQuotesHub={() => setShowQuotesHubModal(true)}
            onStartCall={handleStartCall}
            onNewChat={() => setShowNewChatModal(true)}
          />
        </div>

        {/* Active Chat Conversation Area */}
        <div
          className={`h-full flex-1 ${
            !showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          <ChatArea
            chat={activeChat}
            currentUser={currentUser}
            messages={activeMessages}
            onSendMessage={handleSendMessage}
            onReactMessage={handleReactMessage}
            onDeleteMessage={handleDeleteMessage}
            onStartCall={handleStartCall}
            onOpenLocationModal={() => setShowLocationModal(true)}
            onOpenQuotesHub={() => setShowQuotesHubModal(true)}
            onBackToSidebar={() => setShowMobileChat(false)}
            isTyping={isContactTyping}
            onTranscribeVoiceNote={handleTranscribeVoiceNote}
          />
        </div>
      </div>

      {/* Modals & Overlays */}
      {/* 1. Voice & Video Calling Screen */}
      {activeCall && (
        <CallModal
          call={activeCall}
          onEndCall={handleEndCall}
          onToggleMute={() =>
            setActiveCall((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null))
          }
          onToggleVideo={() =>
            setActiveCall((prev) =>
              prev ? { ...prev, isVideoEnabled: !prev.isVideoEnabled } : null
            )
          }
          onToggleSpeaker={() =>
            setActiveCall((prev) =>
              prev ? { ...prev, isSpeakerOn: !prev.isSpeakerOn } : null
            )
          }
        />
      )}

      {/* 2. Interactive Location Modal */}
      {showLocationModal && (
        <LocationModal
          onClose={() => setShowLocationModal(false)}
          onSendLocation={handleSendLocation}
        />
      )}

      {/* 3. Quotes & Status Studio Modal */}
      {showQuotesHubModal && (
        <QuotesHubModal
          onClose={() => setShowQuotesHubModal(false)}
          onSendQuoteToChat={handleSendQuoteToChat}
          onPostQuoteToStatus={handlePostQuoteToStatus}
        />
      )}

      {/* 4. Fullscreen Status Stories Viewer */}
      {viewingStoryIndex !== null && (
        <StatusViewer
          stories={statusStories}
          initialIndex={viewingStoryIndex}
          onClose={() => setViewingStoryIndex(null)}
          onReplyToStory={(story, replyText) => {
            handleSendMessage(`Replied to status (“${story.content.slice(0, 30)}...”): ${replyText}`);
          }}
        />
      )}

      {/* 5. New Conversation Modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onSelectUser={handleNewChatSelectUser}
        />
      )}
    </div>
  );
}
