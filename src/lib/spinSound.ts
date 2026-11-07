/**
 * The "frrrrrrr" of a prize wheel: short clicks, fast at first and slowing down
 * as the wheel does. Synthesised with Web Audio, so there are no sound files.
 *
 * Browsers (iOS especially) only allow audio after a tap, so call `unlockAudio()`
 * from a click handler – opening the spinner is enough for every phone to hear
 * spins started on other phones.
 */

let context: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function audio(): AudioContext | null {
  if (context) return context;
  if (typeof AudioContext === "undefined") return null;
  context = new AudioContext();
  // A few ms of white noise, reused for every click.
  noise = context.createBuffer(1, Math.round(context.sampleRate * 0.02), context.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  return context;
}

export function unlockAudio() {
  const ctx = audio();
  if (ctx?.state === "suspended") void ctx.resume();
}

/** Clicks per spin; more = a denser "frrrr" at the start. */
const CLICKS = 110;

/**
 * Click times (seconds from start) for a wheel that eases out over `durationS`.
 * One click each time the wheel has covered another 1/CLICKS of its turn, using
 * an ease-out cubic (progress = 1 - (1 - t)³) to match the CSS animation.
 */
export function clickTimes(durationS: number, clicks = CLICKS): number[] {
  return Array.from({ length: clicks }, (_, k) => durationS * (1 - Math.cbrt(1 - (k + 1) / clicks)));
}

/** Plays the spin sound over `durationMs`. Returns a function that stops it. */
export function playSpinSound(durationMs: number): () => void {
  const ctx = audio();
  if (!ctx || !noise || ctx.state !== "running") return () => {};

  const start = ctx.currentTime + 0.02;
  const sources = clickTimes(durationMs / 1000).map((offset, i, all) => {
    const at = start + offset;
    const source = ctx.createBufferSource();
    source.buffer = noise;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2400;
    filter.Q.value = 3;

    // Quick attack, short decay; the last clicks ring a little louder, like the final notches.
    const gain = ctx.createGain();
    const peak = 0.35 + 0.35 * (i / all.length);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(peak, at + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.018);

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(at);
    source.stop(at + 0.02);
    return source;
  });

  return () => {
    for (const source of sources) {
      try {
        source.stop();
      } catch {
        // Already finished.
      }
    }
  };
}
