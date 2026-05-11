<script setup lang="ts">
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Check, AlertCircle, UserPlus } from 'lucide-vue-next'
import PasswordStrengthIndicator from './PasswordStrengthIndicator.vue'

interface Props {
  email: string
  password: string
  confirmPassword: string
  showPassword: boolean
  passwordsMatch: boolean
  isValidPassword: boolean
  passwordStrength: number
  strengthLabel: string
  strengthColor: string
  loading: boolean
  error: string | null | undefined
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:email': [value: string]
  'update:password': [value: string]
  'update:confirmPassword': [value: string]
  'update:showPassword': [value: boolean]
  submit: []
}>()

function togglePasswordVisibility() {
  emit('update:showPassword', !props.showPassword)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="emit('submit')">
    <div class="space-y-2">
      <Label for="email" class="text-sm font-medium">Email</Label>
      <div class="relative group">
        <Mail class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Input
          id="email"
          :model-value="email"
          @update:model-value="emit('update:email', $event)"
          type="email"
          placeholder="tu@email.com"
          class="w-full pl-11 h-12 bg-background/50 border-border/50 focus:border-primary transition-all"
          required
        />
      </div>
    </div>

    <div class="space-y-2">
      <Label for="password" class="text-sm font-medium">Contraseña</Label>
      <div class="relative group">
        <Lock class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Input
          id="password"
          :model-value="password"
          @update:model-value="emit('update:password', $event)"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Mínimo 6 caracteres"
          class="w-full pl-11 pr-12 h-12 bg-background/50 border-border/50 focus:border-primary transition-all"
          required
        />
        <button
          type="button"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          @click="togglePasswordVisibility"
        >
          <Eye v-if="!showPassword" class="h-4 w-4" />
          <EyeOff v-else class="h-4 w-4" />
        </button>
      </div>
      
      <PasswordStrengthIndicator
        :password="password"
        :strength="passwordStrength"
        :label="strengthLabel"
        :color="strengthColor"
      />
    </div>

    <div class="space-y-2">
      <Label for="confirmPassword" class="text-sm font-medium">Confirmar Contraseña</Label>
      <div class="relative group">
        <ShieldCheck class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Input
          id="confirmPassword"
          :model-value="confirmPassword"
          @update:model-value="emit('update:confirmPassword', $event)"
          type="password"
          placeholder="Repite la contraseña"
          class="w-full pl-11 h-12 bg-background/50 border-border/50 focus:border-primary transition-all"
          :class="confirmPassword && !passwordsMatch ? 'border-destructive focus:border-destructive' : ''"
          required
        />
        <Check 
          v-if="confirmPassword && passwordsMatch"
          class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-exp-easy"
        />
      </div>
      <p v-if="confirmPassword && !passwordsMatch" class="text-xs text-destructive flex items-center gap-1">
        <AlertCircle class="h-3 w-3" />
        Las contraseñas no coinciden
      </p>
    </div>

    <div v-if="error" class="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
      <AlertCircle class="h-4 w-4 shrink-0" />
      {{ error }}
    </div>

    <Button 
      type="submit" 
      class="w-full h-12 text-base font-semibold bg-linear-to-r from-primary to-accent hover:opacity-90 transition-opacity" 
      :disabled="!passwordsMatch || !isValidPassword || loading"
    >
      <UserPlus v-if="!loading" class="h-5 w-5 mr-2" />
      <span v-if="loading" class="flex items-center gap-2">
        <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Creando cuenta...
      </span>
      <span v-else>Crear Cuenta</span>
    </Button>
  </form>
</template>

