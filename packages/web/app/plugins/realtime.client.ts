import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  if (import.meta.server) {
    return;
  }

  const config = useRuntimeConfig();
  const wsUrl = config.public.wsUrl as string;

  if (!wsUrl) {
    if (import.meta.dev) {
      console.warn('[realtime] NUXT_PUBLIC_WS_URL not set — real-time push disabled');
    }
    return;
  }

  const authContext = useAuthContext();

  const socket = io(wsUrl, {
    autoConnect: false,
    auth: (cb: (data: { token: string | null }) => void) => {
      authContext
        .refresh()
        .then(() => {
          cb({ token: authContext.token.value });
        })
        .catch(() => {
          cb({ token: null });
        });
    },
  });

  return {
    provide: {
      socket,
    },
  };
});
