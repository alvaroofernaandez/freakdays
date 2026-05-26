import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

// Oscillator types supported by WebAudio
type OscType = 'sine' | 'square' | 'triangle' | 'sawtooth';

function getAudioContextCtor(): typeof AudioContext | undefined {
  if (!import.meta.client) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).AudioContext ?? (window as any).webkitAudioContext ?? undefined;
}

export const useSoundStore = defineStore('sound', () => {
  // enabled: false = muted (default OFF per design)
  const enabled = useStorage('freakdays-sound', false);

  let ctx: AudioContext | null = null;

  function prefersReducedMotion(): boolean {
    if (!import.meta.client) return false;
    if (typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isMuted(): boolean {
    // Auto-quiet when prefers-reduced-motion is active unless the user has
    // explicitly opted in (enabled.value === true).
    if (prefersReducedMotion() && !enabled.value) return true;
    return !enabled.value;
  }

  function getContext(): AudioContext | null {
    if (!import.meta.client) return null;
    const Ctor = getAudioContextCtor();
    if (!Ctor) return null;

    if (!ctx) {
      ctx = new Ctor();
    }

    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    return ctx;
  }

  /**
   * Schedules a single oscillator note with attack/decay envelope.
   */
  function tone(
    context: AudioContext,
    freq: number,
    type: OscType,
    durMs: number,
    when: number,
  ): void {
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);

    const durSec = durMs / 1000;
    gain.gain.setValueAtTime(0.001, when);
    gain.gain.exponentialRampToValueAtTime(0.3, when + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, when + durSec);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start(when);
    osc.stop(when + durSec);
  }

  function playClick(): void {
    if (isMuted()) return;
    const context = getContext();
    if (!context) return;
    tone(context, 660, 'square', 60, context.currentTime);
  }

  function playXp(): void {
    if (isMuted()) return;
    const context = getContext();
    if (!context) return;
    tone(context, 440, 'triangle', 45, context.currentTime);
    tone(context, 880, 'triangle', 45, context.currentTime + 0.05);
  }

  function playLevelUp(): void {
    if (isMuted()) return;
    const context = getContext();
    if (!context) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      tone(context, freq, 'square', 90, context.currentTime + i * 0.1);
    });
  }

  function playAchievement(): void {
    if (isMuted()) return;
    const context = getContext();
    if (!context) return;
    const notes = [659, 784, 988, 1319];
    notes.forEach((freq, i) => {
      tone(context, freq, 'triangle', 120, context.currentTime + i * 0.12);
    });
  }

  function playError(): void {
    if (isMuted()) return;
    const context = getContext();
    if (!context) return;
    tone(context, 220, 'square', 80, context.currentTime);
    tone(context, 110, 'square', 80, context.currentTime + 0.1);
  }

  function toggleMute(): void {
    enabled.value = !enabled.value;
  }

  return {
    enabled,
    playClick,
    playXp,
    playLevelUp,
    playAchievement,
    playError,
    toggleMute,
  };
});
