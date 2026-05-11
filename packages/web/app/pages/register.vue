<script setup lang="ts">
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import RegisterHeader from '@/components/auth/RegisterHeader.vue'
import RegisterSuccessMessage from '@/components/auth/RegisterSuccessMessage.vue'
import { useRegisterPage } from '@/composables/useRegisterPage'
import { Gamepad2 } from 'lucide-vue-next'
import { useAuthStore } from '~~/stores/auth'

definePageMeta({
  layout: false
})

const authStore = useAuthStore()
const {
  email,
  password,
  confirmPassword,
  showPassword,
  success,
  passwordsMatch,
  isValidPassword,
  passwordStrength,
  strengthLabel,
  strengthColor,
  handleSubmit,
  handleGoogleSignIn,
} = useRegisterPage()
</script>

<template>
  <div class="min-h-screen-safe flex flex-col animated-gradient-bg overflow-hidden relative">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
      <div class="absolute bottom-32 left-16 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      <div class="absolute top-1/3 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
    </div>

    <div class="flex-1 flex items-center justify-center p-4 relative z-10">
      <div class="w-full max-w-md">
        <div class="glass rounded-3xl p-8 space-y-6 glow-border">
          <RegisterHeader />

          <RegisterSuccessMessage v-if="success" />

          <template v-else>
            <GoogleSignInButton :loading="authStore.loading" @click="handleGoogleSignIn" />

            <div class="flex items-center gap-4">
              <Separator class="flex-1" />
              <span class="text-xs text-muted-foreground uppercase tracking-wider">o con email</span>
              <Separator class="flex-1" />
            </div>

            <RegisterForm v-model:email="email" v-model:password="password" v-model:confirm-password="confirmPassword"
              v-model:show-password="showPassword" :passwords-match="passwordsMatch"
              :is-valid-password="isValidPassword" :password-strength="passwordStrength" :strength-label="strengthLabel"
              :strength-color="strengthColor" :loading="authStore.loading" :error="authStore.error"
              @submit="handleSubmit" />

            <p class="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?
              <NuxtLink to="/login" class="text-primary hover:text-accent transition-colors font-semibold ml-1">
                Inicia sesión
              </NuxtLink>
            </p>
          </template>
        </div>

        <p class="text-center text-xs text-muted-foreground/60 mt-6 flex items-center justify-center gap-1">
          <Gamepad2 class="h-3 w-3" />
          Nivel 1 · +500 XP de bienvenida
        </p>
      </div>
    </div>
  </div>
</template>
