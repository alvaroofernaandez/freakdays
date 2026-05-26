// Client-only GSAP plugin — ensures GSAP is imported only in the browser.
// SSR never executes this file due to the `.client.ts` convention.
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    await import('gsap');
  }
});
