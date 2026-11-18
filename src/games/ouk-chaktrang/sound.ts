/**
 * The crunch of a piece being taken, made on the spot with the Web Audio API
 * (no sound file): a short burst of noise through a falling band-pass filter,
 * like teeth through a biscuit, with a few cracks in it.
 */
let context: AudioContext | null = null;

const audio = (): AudioContext | null => {
  if (typeof window === "undefined" || !("AudioContext" in window)) {
    return null;
  }

  context ??= new AudioContext();

  return context;
};

const LENGTH_S = 0.22;

export const playCrunch = () => {
  const ctx = audio();

  if (!ctx) {
    return;
  }

  // A tab that never had a click starts suspended; a move is a click
  void ctx.resume();

  const frames = Math.floor(ctx.sampleRate * LENGTH_S);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frames; i += 1) {
    const fade = (1 - i / frames) ** 2;
    // Every so often, a sharper crack
    const crack = i % 900 < 40 ? 2.2 : 1;

    data[i] = (Math.random() * 2 - 1) * fade * crack;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  source.buffer = buffer;
  filter.type = "bandpass";
  filter.Q.value = 1.4;
  filter.frequency.setValueAtTime(2600, now);
  filter.frequency.exponentialRampToValueAtTime(500, now + LENGTH_S);
  gain.gain.setValueAtTime(0.55, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + LENGTH_S);

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(now);
};
