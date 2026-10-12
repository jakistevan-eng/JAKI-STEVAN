import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Send, Mic, StopCircle } from 'lucide-react';
import { generateWaveform, createSyntheticVoiceBlobUrl } from '../utils/audio';

interface VoiceRecorderProps {
  onCancel: () => void;
  onSend: (duration: number, audioBlobUrl: string, waveform: number[]) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onCancel, onSend }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const amplitudesRef = useRef<number[]>([]);

  useEffect(() => {
    let isCancelled = false;

    // Start timer
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Initialize microphone or fallback to synthetic visualizer
    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.start(100);

        // Web Audio analyser for real-time waveform visualization
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        drawLiveWaveform();
      } catch {
        // Fallback to simulated ambient audio bars if mic unavailable
        drawSimulatedWaveform();
      }
    };

    initMic();

    return () => {
      isCancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const drawLiveWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let sum = 0;
    const barWidth = 4;
    const gap = 3;
    const count = Math.floor(canvas.width / (barWidth + gap));
    const step = Math.floor(dataArray.length / count) || 1;

    for (let i = 0; i < count; i++) {
      const val = (dataArray[i * step] || 20) / 255;
      sum += val;
      const height = Math.max(4, val * (canvas.height - 4));
      const x = i * (barWidth + gap);
      const y = (canvas.height - height) / 2;

      ctx.fillStyle = '#10b981'; // Emerald 500
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, height, 2);
      ctx.fill();
    }

    const currentAmp = Math.max(0.1, Math.min(0.95, sum / (count || 1) * 1.8));
    if (amplitudesRef.current.length < 36) {
      amplitudesRef.current.push(Number(currentAmp.toFixed(2)));
    } else {
      amplitudesRef.current[amplitudesRef.current.length - 1] = Number(currentAmp.toFixed(2));
    }

    animationRef.current = requestAnimationFrame(drawLiveWaveform);
  };

  const drawSimulatedWaveform = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = 4;
    const gap = 3;
    const count = Math.floor(canvas.width / (barWidth + gap));

    const time = Date.now() / 200;
    for (let i = 0; i < count; i++) {
      const noise = Math.sin(time + i * 0.4) * 0.5 + 0.5;
      const height = Math.max(4, noise * (canvas.height - 4));
      const x = i * (barWidth + gap);
      const y = (canvas.height - height) / 2;

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, height, 2);
      ctx.fill();
    }

    animationRef.current = requestAnimationFrame(drawSimulatedWaveform);
  };

  const handleStopOrSend = () => {
    const finalDuration = Math.max(1, elapsedSeconds);
    const recordedWaveform = amplitudesRef.current.length >= 10
      ? amplitudesRef.current
      : generateWaveform(32);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(audioBlob);
        onSend(finalDuration, blobUrl, recordedWaveform);
      };
      mediaRecorderRef.current.stop();
    } else {
      // Fallback synthetic voice blob URL
      const syntheticUrl = createSyntheticVoiceBlobUrl(finalDuration);
      onSend(finalDuration, syntheticUrl, recordedWaveform);
    }
  };

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="flex items-center gap-3 w-full bg-slate-100 dark:bg-slate-800/90 rounded-2xl px-4 py-2 border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Delete / Cancel button */}
      <button
        type="button"
        onClick={onCancel}
        className="w-10 h-10 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors active:scale-95 shrink-0"
        title="Discard voice message"
        aria-label="Discard recording"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Recording indicator & timer */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
        <span className="font-mono text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
          {formatTimer(elapsedSeconds)}
        </span>
      </div>

      {/* Waveform Canvas */}
      <div className="flex-1 h-9 flex items-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={240}
          height={36}
          className="w-full h-full"
        />
      </div>

      {/* Send Voice Note Button */}
      <button
        type="button"
        onClick={handleStopOrSend}
        className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 shrink-0"
        title="Send voice note"
        aria-label="Send voice note"
      >
        <Send className="w-4 h-4 ml-0.5" />
      </button>
    </div>
  );
};
