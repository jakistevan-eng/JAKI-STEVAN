export interface User {
  id: string;
  name: string;
  avatarBg: string;
  avatarInitials: string;
  status: 'online' | 'offline' | 'typing' | 'recording';
  lastSeen?: string;
  bio?: string;
  phone?: string;
}

export type MessageType = 'text' | 'voice' | 'location' | 'quote' | 'image';

export interface QuotedMessage {
  id: string;
  senderName: string;
  text: string;
  type: MessageType;
}

export interface VoiceData {
  duration: number; // in seconds
  audioBlobUrl?: string;
  waveform: number[];
  transcription?: string;
  isTranscribing?: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  placeName: string;
  address: string;
  mapImageUrl?: string;
}

export interface QuoteData {
  text: string;
  author: string;
  theme: 'amber' | 'emerald' | 'violet' | 'rose' | 'ocean' | 'dark';
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  text: string;
  timestamp: string; // ISO string or format
  status: 'sent' | 'delivered' | 'read';
  quotedMessage?: QuotedMessage;
  voiceData?: VoiceData;
  locationData?: LocationData;
  quoteData?: QuoteData;
  reactions: Record<string, string[]>; // emoji -> array of userIds
  isStarred?: boolean;
}

export interface Chat {
  id: string;
  user: User;
  isGroup?: boolean;
  groupMembers?: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
  draft?: string;
}

export interface StatusStory {
  id: string;
  userId: string;
  userName: string;
  userAvatarBg: string;
  userAvatarInitials: string;
  timestamp: string;
  type: 'quote' | 'image';
  content: string;
  author?: string;
  gradient: string;
  viewsCount: number;
  isViewed: boolean;
}

export interface CallRecord {
  id: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  userId: string;
  userName: string;
  userAvatarBg: string;
  timestamp: string;
  duration?: string;
}

export interface ActiveCall {
  id: string;
  user: User;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'ringing' | 'connected' | 'ended';
  startedAt?: number;
  durationSeconds: number;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
}
