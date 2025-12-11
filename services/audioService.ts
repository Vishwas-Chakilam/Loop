
// Simple Audio Service using Web Audio API to generate sounds
// This avoids needing external MP3 files and works offline

let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0) => {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
};

export const playSound = (type: 'complete' | 'success' | 'levelUp' | 'timer') => {
  const ctx = getContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  switch (type) {
    case 'complete':
      // Satisfying "pop" or "ding"
      playTone(600, 'sine', 0.1);
      playTone(800, 'sine', 0.1, 0.05);
      break;
    
    case 'success':
      // Major chord arpeggio
      playTone(523.25, 'sine', 0.2, 0);   // C5
      playTone(659.25, 'sine', 0.2, 0.1); // E5
      playTone(783.99, 'sine', 0.4, 0.2); // G5
      break;

    case 'levelUp':
      // Ascending fanfare
      playTone(440, 'triangle', 0.1, 0);
      playTone(554, 'triangle', 0.1, 0.1);
      playTone(659, 'triangle', 0.1, 0.2);
      playTone(880, 'triangle', 0.6, 0.3);
      break;

    case 'timer':
      // Digital alarm
      playTone(880, 'square', 0.1, 0);
      playTone(880, 'square', 0.1, 0.2);
      playTone(880, 'square', 0.1, 0.4);
      break;
  }
};
