import { useColorMode } from '@/composables/useColorMode';

export default defineNuxtPlugin(() => {
  const { init } = useColorMode();
  init();
});
