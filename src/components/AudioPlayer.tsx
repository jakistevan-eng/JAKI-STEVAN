import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic, Sparkles, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  duration: number; // in seconds
  waveform: number[];
  audioUrl?: string;
  isOutgoing: boolean;
  transcription?: string;
  isTranscribing?: boolean;
  onTranscribe?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  duration,
  waveform,
  audioUrl,
  isOutgoing,
  transcription,
  isTranscribing,
  onTranscribe,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize or handle audio element
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      return () => {
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [audioUrl]);

  // Synthetic progress timer if no real audioUrl exists
  useEffect(() => {
    if (!audioUrl && isPlaying) {
      const startTime = performance.now() - currentTime * 1000;
      const step = () => {
        const elapsed = (performance.now() - startTime) / 1000 * playbackRate;
        if (elapsed >= duration) {
          setIsPlaying(false);
          setCurrentTime(0);
        } else {
          setCurrentTime(elapsed);
          animFrameRef.current = requestAnimationFrame(step);
        }
      };
      animFrameRef.current = requestAnimationFrame(step);

      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }
  }, [isPlaying, audioUrl, duration, playbackRate, currentTime]);

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = () => {
    const nextRate: 1 | 1.5 | 2 = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleSeek = (idx: number) => {
    const progress = idx / (waveform.length - 1);
    const newTime = progress * duration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentProgressPercent = duration > 0 ? (currentTime / duration) : 0;

  return (
    <div className="flex flex-col gap-1.5 py-1 px-1 min-w-[240px] max-w-[320px]">
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm ${
            isOutgoing
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
          aria-label={isPlaying ? 'Pause audio note' : 'Play audio note'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform Scrubber & Timer */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[2.5px] h-8 cursor-pointer select-none py-1" role="slider" aria-valuenow={currentTime} aria-valuemin={0} aria-valuemax={duration}>
            {waveform.map((bar, idx) => {
              const barProgress = idx / waveform.length;
              const isPlayed = barProgress <= currentProgressPercent;
              const heightPx = Math.max(6, Math.min(26, bar * 26));

              return (
                <div
                  key={idx}
                  onClick={() => handleSeek(idx)}
                  className={`flex-1 rounded-full transition-colors ${
                    isPlayed
                      ? isOutgoing
                        ? 'bg-emerald-800'
                        : 'bg-emerald-600'
                      : isOutgoing
                      ? 'bg-emerald-300'
                      : 'bg-slate-300'
                  }`}
                  style={{ height: `${heightPx}px` }}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-600 pt-0.5">
            <span>{isPlaying ? formatTime(currentTime) : formatTime(duration)}</span>
            <div className="flex items-center gap-2">
              <Mic className="w-3 h-3 text-slate-500" />
              <button
                type="button"
                onClick={handleSpeedChange}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 hover:bg-slate-300 transition-colors text-slate-700 active:scale-95"
              >
                {playbackRate}x
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transcription Section (Powered by Gemini 3.5 Transcribe) */}
      {transcription ? (
        <div className="mt-1 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 mb-0.5">
            <Sparkles className="w-3 h-3" />
            <span>Transcription</span>
          </div>
          <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed">
            "{transcription}"
          </p>
        </div>
      ) : onTranscribe ? (
        <div className="flex justify-start pt-0.5">
          <button
            type="button"
            onClick={onTranscribe}
            disabled={isTranscribing}
            className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 px-2 py-0.5 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-colors active:scale-95 disabled:opacity-50"
          >
            {isTranscribing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Transcribing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                <span>Transcribe Audio (Gemini 3.5)</span>
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
};
