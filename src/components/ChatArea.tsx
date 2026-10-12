import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
  X,
  MapPin,
  Quote,
  Check,
  CheckCheck,
  CornerUpLeft,
  Copy,
  Trash2,
  ExternalLink,
  Compass,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Chat, Message, User, QuotedMessage, LocationData, QuoteData } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { VoiceRecorder } from './VoiceRecorder';
import { EmojiPicker } from './EmojiPicker';
import { drawVectorMap } from '../utils/location';
import { THEME_GRADIENTS } from '../utils/quotes';

interface ChatAreaProps {
  chat: Chat;
  currentUser: User;
  messages: Message[];
  onSendMessage: (
    text: string,
    type?: 'text' | 'voice' | 'location' | 'quote',
    extra?: {
      voiceData?: { duration: number; audioBlobUrl?: string; waveform: number[] };
      locationData?: LocationData;
      quoteData?: QuoteData;
    }
  ) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onStartCall: (user: User, type: 'voice' | 'video') => void;
  onOpenLocationModal: () => void;
  onOpenQuotesHub: () => void;
  onBackToSidebar?: () => void;
  isTyping?: boolean;
  onTranscribeVoiceNote?: (messageId: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  currentUser,
  messages,
  onSendMessage,
  onReactMessage,
  onDeleteMessage,
  onStartCall,
  onOpenLocationModal,
  onOpenQuotesHub,
  onBackToSidebar,
  isTyping,
  onTranscribeVoiceNote,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<QuotedMessage | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [searchInChat, setSearchInChat] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim(), 'text');
    setInputText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const handleSendVoice = (duration: number, audioBlobUrl: string, waveform: number[]) => {
    onSendMessage(`Voice note (${Math.floor(duration / 60)}:${duration % 60 < 10 ? '0' : ''}${duration % 60})`, 'voice', {
      voiceData: {
        duration,
        audioBlobUrl,
        waveform,
      },
    });
    setIsRecordingVoice(false);
    setReplyingTo(null);
  };

  const handleSelectEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleSetReply = (msg: Message) => {
    setReplyingTo({
      id: msg.id,
      senderName: msg.senderName,
      text: msg.text,
      type: msg.type,
    });
    inputRef.current?.focus();
  };

  const filteredMessages = searchInChat.trim()
    ? messages.filter((m) => m.text.toLowerCase().includes(searchInChat.toLowerCase()))
    : messages;

  return (
    <main className="flex-1 h-full flex flex-col bg-slate-50 dark:bg-slate-950 relative overflow-hidden select-none">
      {/* Top Chat Header */}
      <div className="h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Button */}
          {onBackToSidebar && (
            <button
              type="button"
              onClick={onBackToSidebar}
              className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Contact Avatar */}
          <div className="relative shrink-0">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs ${chat.user.avatarBg}`}
            >
              {chat.user.avatarInitials}
            </div>
            {chat.user.status === 'online' && !chat.isGroup && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </div>

          {/* Contact Name & Status */}
          <div className="min-w-0">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
              {chat.user.name}
            </h2>
            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
              {isTyping ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                  typing...
                </span>
              ) : chat.user.status === 'online' ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">online</span>
              ) : (
                <span>{chat.user.lastSeen || 'offline'}</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Actions: Voice Call, Video Call, Search */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Video Call */}
          <button
            type="button"
            onClick={() => onStartCall(chat.user, 'video')}
            className="p-2 sm:px-3 sm:py-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
            title="Start Video Call"
            aria-label="Start video call"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-medium">Video</span>
          </button>

          {/* Voice Call */}
          <button
            type="button"
            onClick={() => onStartCall(chat.user, 'voice')}
            className="p-2 sm:px-3 sm:py-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
            title="Start Voice Call"
            aria-label="Start voice call"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-medium">Call</span>
          </button>

          {/* In-chat Search toggle */}
          <button
            type="button"
            onClick={() => setShowSearchBox(!showSearchBox)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Search in conversation"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Search in Chat bar */}
      {showSearchBox && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInChat}
            onChange={(e) => setSearchInChat(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none"
            autoFocus
          />
          {searchInChat && (
            <button
              type="button"
              onClick={() => setSearchInChat('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setShowSearchBox(false);
              setSearchInChat('');
            }}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages Timeline Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 scrollbar-thin">
        {/* Date separator */}
        <div className="flex justify-center my-2">
          <span className="text-[11px] font-medium text-slate-500 bg-slate-200/70 dark:bg-slate-800/80 px-3 py-1 rounded-full shadow-2xs">
            Today
          </span>
        </div>

        {/* Message bubbles */}
        {filteredMessages.map((msg) => {
          const isOutgoing = msg.senderId === currentUser.id;
          const isHovered = hoveredMessageId === msg.id;

          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
              className={`flex flex-col group relative ${
                isOutgoing ? 'items-end' : 'items-start'
              }`}
            >
              {/* Message Bubble Container */}
              <div
                className={`max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl p-3 shadow-xs relative transition-all ${
                  isOutgoing
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-slate-900 dark:text-slate-100 rounded-tr-xs border border-emerald-200/60 dark:border-emerald-800/40'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Quoted Message Preview snippet */}
                {msg.quotedMessage && (
                  <div
                    className={`mb-2 p-2 rounded-xl text-xs border-l-4 transition-colors select-none ${
                      isOutgoing
                        ? 'bg-emerald-100/70 dark:bg-emerald-900/50 border-emerald-600 text-slate-700 dark:text-slate-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-emerald-500 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-emerald-700 dark:text-emerald-400 mb-0.5">
                      {msg.quotedMessage.senderName}
                    </div>
                    <div className="truncate text-xs italic">
                      {msg.quotedMessage.type === 'voice' ? '🎙 Voice note' : msg.quotedMessage.text}
                    </div>
                  </div>
                )}

                {/* 1. Voice Note Bubble */}
                {msg.type === 'voice' && msg.voiceData && (
                  <AudioPlayer
                    duration={msg.voiceData.duration}
                    waveform={msg.voiceData.waveform}
                    audioUrl={msg.voiceData.audioBlobUrl}
                    isOutgoing={isOutgoing}
                    transcription={msg.voiceData.transcription}
                    isTranscribing={msg.voiceData.isTranscribing}
                    onTranscribe={onTranscribeVoiceNote ? () => onTranscribeVoiceNote(msg.id) : undefined}
                  />
                )}

                {/* 2. Location Message Bubble */}
                {msg.type === 'location' && msg.locationData && (
                  <div className="space-y-2 select-text">
                    {/* Rendered map card */}
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative shadow-inner">
                      <canvas
                        ref={(node) => {
                          if (node) {
                            drawVectorMap(
                              node,
                              msg.locationData!.latitude,
                              msg.locationData!.longitude,
                              msg.locationData!.placeName
                            );
                          }
                        }}
                        width={300}
                        height={140}
                        className="w-full h-32 object-cover block"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{msg.locationData.placeName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {msg.locationData.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`https://maps.google.com/?q=${msg.locationData.latitude},${msg.locationData.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-1 rounded-lg"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in Maps</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* 3. Quote Card Bubble */}
                {msg.type === 'quote' && msg.quoteData && (
                  <div className="my-1 select-text">
                    <div
                      className={`rounded-xl p-4 shadow-sm text-white ${
                        THEME_GRADIENTS[msg.quoteData.theme || 'emerald'].bg
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Quote className="w-5 h-5 fill-current opacity-70 shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm font-serif italic leading-relaxed">
                          “{msg.quoteData.text}”
                        </p>
                      </div>
                      <div className="mt-2 text-right text-[11px] opacity-80 font-sans tracking-wide">
                        — {msg.quoteData.author}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Regular Text Message */}
                {msg.type === 'text' && (
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text">
                    {msg.text}
                  </p>
                )}

                {/* Timestamp & Status ticks */}
                <div className="flex items-center justify-end gap-1.5 mt-1 pt-0.5 select-none">
                  <span className="text-[10px] font-mono text-slate-500">
                    {msg.timestamp}
                  </span>
                  {isOutgoing && (
                    <span className="text-emerald-600">
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </div>

                {/* Reactions badge */}
                {Object.keys(msg.reactions).length > 0 && (
                  <div
                    className={`absolute -bottom-2.5 flex items-center gap-1 bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-full text-xs ${
                      isOutgoing ? 'right-2' : 'left-2'
                    }`}
                  >
                    {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                      <span key={emoji} className="flex items-center gap-0.5 cursor-pointer">
                        <span>{emoji}</span>
                        {userIds.length > 1 && (
                          <span className="text-[10px] font-bold text-slate-500 font-mono">
                            {userIds.length}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover Floating Actions Menu */}
              {isHovered && (
                <div
                  className={`absolute -top-4 z-30 flex items-center gap-1 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 p-1 rounded-full animate-in fade-in duration-100 ${
                    isOutgoing ? 'right-4' : 'left-4'
                  }`}
                >
                  {/* Quick Reactions */}
                  {['👍', '❤️', '😂', '😮', '🔥'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onReactMessage(msg.id, emoji)}
                      className="w-6 h-6 flex items-center justify-center text-sm hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}

                  <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

                  {/* Reply / Quote Action */}
                  <button
                    type="button"
                    onClick={() => handleSetReply(msg)}
                    className="p-1 text-slate-500 hover:text-emerald-600 rounded-full"
                    title="Quote / Reply"
                  >
                    <CornerUpLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy Action */}
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(msg.text)}
                    className="p-1 text-slate-500 hover:text-emerald-600 rounded-full"
                    title="Copy message"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Action (only outgoing) */}
                  {isOutgoing && (
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(msg.id)}
                      className="p-1 text-slate-500 hover:text-rose-600 rounded-full"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Bubble */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-1 px-3 bg-white dark:bg-slate-900 w-fit rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 animate-pulse">
            <span className="font-semibold text-emerald-600">{chat.user.name}</span>
            <span>is typing</span>
            <span className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Replying Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-slate-200/70 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <CornerUpLeft className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                Replying to {replyingTo.senderName}:
              </span>{' '}
              <span className="text-slate-600 dark:text-slate-300 italic">{replyingTo.text}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Compose Input Toolbar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative z-30">
        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <EmojiPicker
            onSelectEmoji={handleSelectEmoji}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        {/* Attachment Options Drawer */}
        {showAttachMenu && (
          <div className="absolute bottom-16 left-12 z-40 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 flex flex-col gap-1 w-48 animate-in fade-in zoom-in-95 duration-100">
            {/* Share Location Button */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(false);
                onOpenLocationModal();
              }}
              className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Share Location</span>
            </button>

            {/* Write / Send Quote Button */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(false);
                onOpenQuotesHub();
              }}
              className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Quote className="w-4 h-4 fill-current" />
              </div>
              <span>Share Quote Card</span>
            </button>
          </div>
        )}

        {/* Main Compose Bar: either Voice Recorder or Text Form */}
        {isRecordingVoice ? (
          <VoiceRecorder
            onCancel={() => setIsRecordingVoice(false)}
            onSend={handleSendVoice}
          />
        ) : (
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            {/* Emoji Trigger */}
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachMenu(false);
              }}
              className={`p-2.5 rounded-full transition-colors ${
                showEmojiPicker
                  ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Add Emoji"
              aria-label="Emoji picker"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Attachment Trigger (Location & Quotes) */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowEmojiPicker(false);
              }}
              className={`p-2.5 rounded-full transition-colors ${
                showAttachMenu
                  ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Attach Location or Quote"
              aria-label="Attachments"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message, quote, or tap mic for voice..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-full outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400 transition-all"
            />

            {/* Microphone OR Send Action */}
            {inputText.trim() ? (
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 shrink-0"
                title="Send message"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 shrink-0"
                title="Record Voice Note"
                aria-label="Record voice note"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </form>
        )}
      </div>
    </main>
  );
};
