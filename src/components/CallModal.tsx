import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Camera,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { ActiveCall } from '../types';
import {
  startCallingRingtone,
  stopCallingRingtone,
  playCallConnectedSound,
  playCallEndedSound,
} from '../utils/audio';

interface CallModalProps {
  call: ActiveCall;
  onEndCall: (durationSeconds: number) => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  call,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
}) => {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>(call.status);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  // Ringtone and call connection handling
  useEffect(() => {
    let stopRingtone: (() => void) | null = null;

    if (callStatus === 'ringing') {
      stopRingtone = startCallingRingtone(call.direction === 'outgoing' ? 'outgoing' : 'incoming');

      // Automatically simulate pickup after 3.2 seconds if outgoing
      const connectTimeout = window.setTimeout(() => {
        stopCallingRingtone();
        playCallConnectedSound();
        setCallStatus('connected');
      }, 3400);

      return () => {
        clearTimeout(connectTimeout);
        if (stopRingtone) stopRingtone();
      };
    }
  }, [callStatus, call.direction]);

  // Duration timer when connected
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = window.setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Handle local camera stream for video calls
  useEffect(() => {
    let active = true;

    if (call.type === 'video' && call.isVideoEnabled) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: cameraFacing },
            audio: false, // avoid feedback loop in same browser
          });

          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          localStreamRef.current = stream;
          setCameraActive(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch(() => {});
          }
        } catch {
          // Camera permission denied or unsupported in test sandbox
          setCameraActive(false);
        }
      };

      startCamera();
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      setCameraActive(false);
    }

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [call.type, call.isVideoEnabled, cameraFacing]);

  const handleEnd = () => {
    stopCallingRingtone();
    playCallEndedSound();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    onEndCall(secondsElapsed);
  };

  const handleSwitchFacing = () => {
    setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const formatCallDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Minimized Floating Widget
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${call.user.avatarBg}`}>
          {call.user.avatarInitials}
        </div>
        <div>
          <div className="text-xs font-semibold">{call.user.name}</div>
          <div className="text-[11px] font-mono text-emerald-400">
            {callStatus === 'ringing' ? 'Ringing...' : formatCallDuration(secondsElapsed)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          title="Expand Call"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleEnd}
          className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white"
          title="End Call"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 p-2 sm:p-4">
      <div className="relative w-full max-w-2xl h-[90vh] max-h-[720px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between">
        {/* Top Control Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs font-medium text-slate-300 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${callStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{call.type === 'video' ? 'Video Call' : 'Voice Call'}</span>
              <span>·</span>
              <span className="font-mono tabular-nums text-slate-300">
                {callStatus === 'ringing' ? 'Calling...' : formatCallDuration(secondsElapsed)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video or Avatar Center Canvas */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
          {call.type === 'video' ? (
            /* Video Screen */
            <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
              {/* Simulated Remote Partner Stream */}
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
                {/* Simulated remote video animated visual */}
                <div className="relative flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-ping" />
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl text-white ${call.user.avatarBg}`}>
                      {call.user.avatarInitials}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{call.user.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {callStatus === 'ringing' ? 'Connecting high-definition stream...' : 'Connected (HD 1080p)'}
                  </p>
                </div>
              </div>

              {/* Local User Picture-in-Picture Webcam */}
              <div className="absolute bottom-24 right-4 sm:right-6 w-32 sm:w-44 h-44 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/80 bg-slate-900 z-20">
                {call.isVideoEnabled ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2 bg-slate-800">
                    <VideoOff className="w-6 h-6 text-slate-500" />
                    <span>Camera off</span>
                  </div>
                )}
                {call.isVideoEnabled && (
                  <button
                    type="button"
                    onClick={handleSwitchFacing}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white"
                    title="Flip camera"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Voice Call Screen */
            <div className="flex flex-col items-center justify-center px-4 py-8">
              <div className="relative mb-6">
                {callStatus === 'connected' && (
                  <>
                    <div className="absolute -inset-6 rounded-full bg-emerald-500/10 animate-ping opacity-75" />
                    <div className="absolute -inset-12 rounded-full border border-emerald-500/20 animate-pulse" />
                  </>
                )}
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl text-white relative z-10 ${call.user.avatarBg}`}
                >
                  {call.user.avatarInitials}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight">{call.user.name}</h2>
              <p className="text-sm text-slate-400 mt-1">
                {callStatus === 'ringing' ? 'Calling...' : `Voice Connected · ${formatCallDuration(secondsElapsed)}`}
              </p>

              {/* Audio Amplitude Bars Indicator */}
              {callStatus === 'connected' && !call.isMuted && (
                <div className="flex items-center gap-1.5 mt-8 h-8">
                  {[12, 24, 18, 30, 16, 28, 14, 26, 20].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-500 rounded-full animate-pulse"
                      style={{
                        height: `${h}px`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Call Controls Toolbar */}
        <div className="relative z-30 p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-center gap-4 sm:gap-6">
          {/* Mute Mic */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              call.isMuted
                ? 'bg-rose-600 text-white shadow-lg'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title={call.isMuted ? 'Unmute' : 'Mute'}
          >
            {call.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video (if video call) */}
          {call.type === 'video' && (
            <button
              type="button"
              onClick={onToggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                !call.isVideoEnabled
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
              title={call.isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {call.isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          )}

          {/* Speaker Toggle */}
          <button
            type="button"
            onClick={onToggleSpeaker}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              !call.isSpeakerOn
                ? 'bg-slate-700 text-slate-400'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title={call.isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
          >
            {call.isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call (Red Button) */}
          <button
            type="button"
            onClick={handleEnd}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xl shadow-rose-900/40 transition-transform active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
