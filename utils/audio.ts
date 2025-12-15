
// Procedural Audio Synthesizer for Cyberpunk UI
// Uses Web Audio API to generate sounds without external assets

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

type SoundType = 'CLICK' | 'HOVER' | 'SUCCESS' | 'ERROR' | 'GLITCH' | 'OPEN';

export const playSound = (type: SoundType) => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  switch (type) {
    case 'CLICK':
      // High pitched mechanical click
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;

    case 'HOVER':
      // Very short, subtle high freq tick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000, now);
      gainNode.gain.setValueAtTime(0.02, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
      break;

    case 'SUCCESS':
      // Ascending major arpeggio / digital chime
      const t = now;
      const notes = [440, 554, 659, 880]; // A Major
      notes.forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'triangle';
        o.connect(g);
        g.connect(audioCtx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t + i * 0.05);
        g.gain.linearRampToValueAtTime(0.1, t + i * 0.05 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.3);
        o.start(t + i * 0.05);
        o.stop(t + i * 0.05 + 0.3);
      });
      break;

    case 'ERROR':
      // Low buzz / error
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.2);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;

    case 'GLITCH':
      // Random noise burst
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(Math.random() * 500 + 200, now);
      osc.frequency.linearRampToValueAtTime(Math.random() * 1000, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
      
    case 'OPEN':
        // Sci-fi Swish
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
  }
};