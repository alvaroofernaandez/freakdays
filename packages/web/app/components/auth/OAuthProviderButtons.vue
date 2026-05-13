<script setup lang="ts">
type AuthMode = 'login' | 'register';

interface Props {
  loading?: boolean;
  mode?: AuthMode;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  mode: 'login',
});

const emit = defineEmits<{
  google: [];
  github: [];
  discord: [];
}>();

const helperText = computed(() => {
  return props.mode === 'register' ? 'Registro rápido con OAuth' : 'Ingreso rápido con OAuth';
});
</script>

<template>
  <div class="space-y-3">
    <p class="text-xs text-muted-foreground text-center">{{ helperText }}</p>

    <Button
      type="button"
      variant="outline"
      class="w-full h-12 text-base font-medium gap-3"
      :disabled="loading"
      @click="emit('google')"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continuar con Google
    </Button>

    <Button
      type="button"
      variant="outline"
      class="w-full h-12 text-base font-medium gap-3"
      :disabled="loading"
      @click="emit('github')"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M12 2C6.48 2 2 6.59 2 12.24c0 4.51 2.87 8.34 6.84 9.69.5.09.68-.22.68-.5 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.15-4.56-5.1 0-1.13.39-2.05 1.03-2.77-.11-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.06a9.25 9.25 0 0 1 5.01 0c1.9-1.34 2.74-1.06 2.74-1.06.55 1.41.21 2.46.11 2.72.64.72 1.03 1.64 1.03 2.77 0 3.96-2.34 4.84-4.57 5.09.36.31.68.92.68 1.86 0 1.34-.01 2.42-.01 2.75 0 .27.18.6.69.5A10.25 10.25 0 0 0 22 12.24C22 6.59 17.52 2 12 2Z"
        />
      </svg>
      Continuar con GitHub
    </Button>

    <Button
      type="button"
      variant="outline"
      class="w-full h-12 text-base font-medium gap-3"
      :disabled="loading"
      @click="emit('discord')"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M20.32 4.37A18.3 18.3 0 0 0 15.8 3l-.22.43c1.96.54 2.86 1.32 3.67 2.04a13.88 13.88 0 0 0-4.2-1.3 15.1 15.1 0 0 0-6.1 0 13.9 13.9 0 0 0-4.2 1.3c.8-.72 1.7-1.5 3.67-2.04L8.2 3c-1.56.24-3.08.71-4.52 1.37C.95 8.36.22 12.24.58 16.06A18.5 18.5 0 0 0 6.13 19l1.19-1.66a11.79 11.79 0 0 1-1.86-.91l.44-.35c3.58 1.7 8.62 1.7 12.16 0l.44.35c-.59.35-1.21.66-1.87.91L17.87 19a18.42 18.42 0 0 0 5.55-2.94c.45-4.42-.76-8.3-3.1-11.69ZM9.53 13.73c-.96 0-1.74-.9-1.74-2s.77-2 1.74-2c.98 0 1.75.9 1.74 2 0 1.1-.77 2-1.74 2Zm4.94 0c-.96 0-1.74-.9-1.74-2s.77-2 1.74-2c.98 0 1.75.9 1.74 2 0 1.1-.76 2-1.74 2Z"
        />
      </svg>
      Continuar con Discord
    </Button>
  </div>
</template>
