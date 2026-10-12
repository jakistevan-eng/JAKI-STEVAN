/**
 * Audio synthesis & Web Audio API sound effects for WhatsApp-style messaging
 * Uses zero external audio files - 100% reliable in hermetic environments.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play a friendly WhatsApp-style message sent "pop"
export function playMessageSentSound(): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.09);
  } catch {
    // Ignore audio permission or context errors
  }
}

// Play message received double tone
export function playMessageReceivedSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(980, now, 0.09);
    playTone(1320, now + 0.1, 0.15);
  } catch {
    // Ignore
  }
}

// Ringtone loop controller for outgoing or incoming calls
let ringtoneInterval: number | null = null;

export function startCallingRingtone(type: 'outgoing' | 'incoming'): () => void {
  stopCallingRingtone();

  const playBurst = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      if (type === 'outgoing') {
        // WhatsApp dual-frequency ring tone (440Hz + 480Hz)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.setValueAtTime(0.08, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.3);
      } else {
        // Incoming ring melodic chime
        const notes = [659, 783, 987, 1318];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + idx * 0.12;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.25);
        });
      }
    } catch {
      // Ignore
    }
  };

  playBurst();
  ringtoneInterval = window.setInterval(playBurst, 2800);

  return stopCallingRingtone;
}

export function stopCallingRingtone(): void {
  if (ringtoneInterval !== null) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
}

// Play call connected chime
export function playCallConnectedSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // Ignore
  }
}

// Play call ended click
export function playCallEndedSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // Ignore
  }
}

/**
 * Generate simulated waveform amplitudes (normalized 0.1 to 1.0)
 */
export function generateWaveform(sampleCount = 36): number[] {
  const bars: number[] = [];
  for (let i = 0; i < sampleCount; i++) {
    // Generate organic speech-like waveform with peaks and pauses
    const base = 0.25 + 0.55 * Math.sin((i / sampleCount) * Math.PI);
    const noise = (Math.random() - 0.5) * 0.35;
    const val = Math.max(0.12, Math.min(0.98, base + noise));
    bars.push(Number(val.toFixed(2)));
  }
  return bars;
}

/**
 * Synthesizes a demo audio speech tone note in case user has no mic
 */
export function createSyntheticVoiceBlobUrl(durationSeconds = 4): string {
  try {
    const sampleRate = 22050;
    const numSamples = Math.floor(sampleRate * durationSeconds);
    const buffer = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Speech harmonic simulation (formants at ~250Hz, 800Hz, 2200Hz modulated)
      const pitch = 220 + 40 * Math.sin(t * 3);
      const envelope = 0.5 + 0.4 * Math.sin(t * 7);
      const sample =
        (Math.sin(2 * Math.PI * pitch * t) * 0.5 +
          Math.sin(2 * Math.PI * (pitch * 2) * t) * 0.25 +
          Math.sin(2 * Math.PI * (pitch * 3) * t) * 0.1) *
        envelope;
      buffer[i] = sample * 0.2;
    }

    // Convert Float32 buffer to WAV Blob
    const wavBlob = float32ToWav(buffer, sampleRate);
    return URL.createObjectURL(wavBlob);
  } catch {
    return '';
  }
}

function float32ToWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
