/**
 * The two-note beep when the wheel lands, drawn with Web Audio so there is no
 * sound file to load. Browsers only allow audio after a click, so the context
 * is opened by primeAudio from the Spin button and played once the wheel stops.
 */
let context: AudioContext | null = null;

export const primeAudio = () => {
  try {
    context ??= new AudioContext();
    void context.resume();
  } catch {
    context = null;
  }
};

const NOTES = [880, 1320];
const NOTE_GAP = 0.12;
const NOTE_LENGTH = 0.18;
const VOLUME = 0.12;

export const beep = () => {
  if (!context) {
    return;
  }

  const start = context.currentTime;

  for (const [i, frequency] of NOTES.entries()) {
    const at = start + i * NOTE_GAP;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(VOLUME, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + NOTE_LENGTH);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + NOTE_LENGTH + 0.02);
  }
};
