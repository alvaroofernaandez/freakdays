// Primes the WebAudio AudioContext on the first user gesture.
// AudioContext requires a user gesture before it can produce sound;
// this plugin wires a one-shot listener to unblock it early.
import { defineNuxtPlugin } from '#app';
import { useSoundStore } from '~~/stores/useSound';

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  function prime() {
    // Lazily initialises the AudioContext on the first user gesture so it is
    // ready for the next real sound event. playClick() is a no-op while muted,
    // so the actual AudioContext is only created once the user enables sound.
    const store = useSoundStore();
    store.playClick();
    document.removeEventListener('pointerdown', prime);
    document.removeEventListener('keydown', prime);
  }

  document.addEventListener('pointerdown', prime, { once: true });
  document.addEventListener('keydown', prime, { once: true });
});
