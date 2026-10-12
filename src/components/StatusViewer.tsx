import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Send, Eye, Heart, MessageCircle } from 'lucide-react';
import { StatusStory } from '../types';

interface StatusViewerProps {
  stories: StatusStory[];
  initialIndex: number;
  onClose: () => void;
  onReplyToStory: (story: StatusStory, replyText: string) => void;
}

export const StatusViewer: React.FC<StatusViewerProps> = ({
  stories,
  initialIndex,
  onClose,
  onReplyToStory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const progressIntervalRef = useRef<number | null>(null);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const stepMs = 50;
    const totalDuration = 5000;
    const increment = (stepMs / totalDuration) * 100;

    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReplyToStory(currentStory, replyText.trim());
    setReplyText('');
    onClose();
  };

  if (!currentStory) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative w-full max-w-md h-full max-h-[880px] bg-slate-900 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Top Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-4 flex gap-1.5 bg-gradient-to-b from-black/70 to-transparent">
          {stories.map((story, idx) => {
            let width = '0%';
            if (idx < currentIndex) width = '100%';
            else if (idx === currentIndex) width = `${progress}%`;

            return (
              <div key={story.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{ width }}
                />
              </div>
            );
          })}
        </div>

        {/* User Info & Close Header */}
        <div className="absolute top-6 left-0 right-0 z-30 px-4 py-2 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500 ${currentStory.userAvatarBg}`}
            >
              {currentStory.userAvatarInitials}
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight">{currentStory.userName}</div>
              <div className="text-[11px] text-white/70">{currentStory.timestamp}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Click navigation overlays */}
        <div className="absolute inset-y-16 left-0 w-1/3 z-20 cursor-pointer" onClick={handlePrev} />
        <div className="absolute inset-y-16 right-0 w-1/3 z-20 cursor-pointer" onClick={handleNext} />

        {/* Main Story Content */}
        <div
          className={`flex-1 w-full flex items-center justify-center p-8 bg-gradient-to-br ${currentStory.gradient} text-white`}
        >
          <div className="max-w-xs text-center">
            <div className="text-4xl sm:text-5xl font-serif text-white/40 mb-3 leading-none">“</div>
            <p className="text-xl sm:text-2xl font-serif italic leading-relaxed text-white drop-shadow-sm">
              {currentStory.content}
            </p>
            {currentStory.author && (
              <div className="mt-4 text-xs font-sans uppercase tracking-widest text-white/80 font-semibold">
                — {currentStory.author}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Reply Bar */}
        <div className="relative z-30 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-white/70 px-1">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>{currentStory.viewsCount} views</span>
            </span>
            <span className="text-emerald-400 font-medium">Status Update</span>
          </div>

          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${currentStory.userName}...`}
              className="flex-1 bg-white/15 backdrop-blur-md text-white placeholder:text-white/60 text-xs px-4 py-2.5 rounded-full outline-none focus:ring-1 focus:ring-emerald-400 border border-white/20"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white flex items-center justify-center transition-transform active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
