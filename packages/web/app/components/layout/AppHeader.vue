<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserProfile } from '@/composables/useProfile'
import { Trophy } from 'lucide-vue-next'

interface Props {
  profile: UserProfile | null
  loading?: boolean
  expProgress: {
    current: number
    needed: number
    progress: number
  }
  isActive: (to: string) => boolean
  menuOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  menuOpen: false,
})

const emit = defineEmits<{
  logout: []
}>()
</script>

<template>
  <header
    v-if="!menuOpen"
    class="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl hidden lg:block shadow-sm"
    style="position: sticky; z-index: 9999; pointer-events: auto;">
    <div class="container mx-auto flex h-14 md:h-16 items-center px-3 sm:px-4 md:px-6">
      <NuxtLink to="/" class="flex items-center gap-2 md:gap-3 font-bold group shrink-0">
        <div class="relative flex items-center justify-center">
          <div
            class="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div
            class="relative p-1.5 md:p-2 rounded-lg md:rounded-xl bg-linear-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 group-hover:border-primary/40 group-hover:bg-primary/15 transition-all duration-300 shadow-sm">
            <img src="/logo.png" alt="FreakDays"
              class="h-6 w-6 md:h-8 md:w-8 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              loading="eager" fetchpriority="high" />
          </div>
        </div>
        <span
          class="text-base md:text-xl font-logo bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 whitespace-nowrap">
          FreakDays
        </span>
      </NuxtLink>

      <slot name="nav" />

      <div class="ml-auto flex items-center gap-2 md:gap-3 shrink-0">
        <template v-if="loading">
          <div class="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-border/50">
            <div class="hidden lg:flex flex-col items-end gap-1.5">
              <div class="flex items-center gap-2">
                <Skeleton class="h-4 w-4 rounded" />
                <Skeleton class="h-4 w-10 rounded" />
              </div>
              <Skeleton class="h-2 w-20 rounded-full" />
            </div>
            <div class="flex lg:hidden items-center gap-1.5">
              <Skeleton class="h-4 w-4 rounded" />
              <Skeleton class="h-4 w-10 rounded" />
            </div>
            <Skeleton class="h-8 w-8 md:h-10 md:w-10 rounded-full" />
          </div>
        </template>
        <NuxtLink v-else-if="profile" to="/profile"
          class="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-border/50 group/profile">
          <div class="hidden lg:flex flex-col items-end gap-1.5">
            <div class="flex items-center gap-2">
              <div class="relative">
                <div
                  class="absolute inset-0 bg-exp-legendary/20 blur-md rounded-full opacity-0 group-hover/profile:opacity-100 transition-opacity" />
                <Trophy class="h-4 w-4 text-exp-legendary relative z-10" />
              </div>
              <span class="text-sm font-bold text-foreground">Lv.{{ profile?.level ?? 1 }}</span>
            </div>
            <Tooltip>
              <TooltipTrigger as-child>
                <div class="w-20 h-2 bg-muted rounded-full overflow-hidden cursor-pointer">
                  <div
                    class="h-full bg-linear-to-r from-primary via-accent to-primary rounded-full transition-all duration-500"
                    :style="{ width: `${expProgress.progress}%` }" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div class="space-y-1">
                  <p class="font-semibold">{{ expProgress.current }} / {{ expProgress.progress }} EXP</p>
                  <p class="text-xs text-muted-foreground">{{ expProgress.needed - expProgress.current }} para subir</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div class="flex lg:hidden items-center gap-1.5">
            <Trophy class="h-4 w-4 text-exp-legendary" />
            <span class="text-xs md:text-sm font-bold text-foreground">Lv.{{ profile?.level ?? 1 }}</span>
          </div>
          <div class="relative">
            <div
              class="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover/profile:opacity-100 transition-opacity" />
            <Avatar
              class="relative h-8 w-8 md:h-10 md:w-10 ring-2 ring-transparent group-hover/profile:ring-primary/50 transition-all shadow-md">
              <AvatarImage v-if="profile?.avatarUrl" :src="profile.avatarUrl"
                :alt="profile?.displayName || profile?.username" class="object-cover" />
              <AvatarFallback class="bg-linear-to-br from-primary to-accent text-xs md:text-sm text-white font-bold">
                {{ profile?.username?.charAt(0)?.toUpperCase() ?? '?' }}
              </AvatarFallback>
            </Avatar>
          </div>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
