let isMuted = false;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
  if (isMuted) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    if (type === 'coin') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(880, now); osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
      gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    } else if (type === 'jump' || type === 'spin') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(260, now); osc.frequency.exponentialRampToValueAtTime(620, now + 0.18);
      gain.gain.setValueAtTime(0.18, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'crash') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(140, now); osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
      gain.gain.setValueAtTime(0.25, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.36);
      osc.start(now); osc.stop(now + 0.36);
    } else {
      osc.type = 'sine'; osc.frequency.setValueAtTime(520, now); osc.frequency.exponentialRampToValueAtTime(1040, now + 0.22);
      gain.gain.setValueAtTime(0.18, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);
      osc.start(now); osc.stop(now + 0.24);
    }
  } catch (e) {}
}
