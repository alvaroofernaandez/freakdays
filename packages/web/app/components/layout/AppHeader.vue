<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import ThemeToggle from '@/components/ui/theme-toggle/ThemeToggle.vue';
import type { UserProfile } from '@/composables/useProfile';
import { Hexagon } from 'lucide-vue-next';

interface Props {
  profile: UserProfile | null;
  loading?: boolean;
  expProgress: {
    current: number;
    needed: number;
    progress: number;
  };
  isActive: (to: string) => boolean;
  menuOpen?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  menuOpen: false,
});

const _emit = defineEmits<{
  logout: [];
}>();
</script>

<template>
  <header
    v-if="!menuOpen"
    class="sticky top-0 z-50 w-full border-b-2 border-border/50 bg-background/95 backdrop-blur-xl hidden lg:block"
    style="position: sticky; z-index: 9999; pointer-events: auto"
  >
    <div class="container mx-auto flex h-14 items-center px-3 sm:px-4 md:px-6 gap-3">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 font-bold group shrink-0">
        <div
          class="pixelated relative flex items-center justify-center w-8 h-8 bg-linear-to-br from-primary via-accent to-secondary p-[2px] shadow-[0_0_18px_-6px_var(--color-primary)] [clip-path:polygon(0_4px,4px_4px,4px_0,calc(100%-4px)_0,calc(100%-4px)_4px,100%_4px,100%_calc(100%-4px),calc(100%-4px)_calc(100%-4px),calc(100%-4px)_100%,4px_100%,4px_calc(100%-4px),0_calc(100%-4px))]"
        >
          <div
            class="w-full h-full bg-card flex items-center justify-center [clip-path:polygon(0_3px,3px_3px,3px_0,calc(100%-3px)_0,calc(100%-3px)_3px,100%_3px,100%_calc(100%-3px),calc(100%-3px)_calc(100%-3px),calc(100%-3px)_100%,3px_100%,3px_calc(100%-3px),0_calc(100%-3px))]"
          >
            <img
              src="/logo.png"
              alt="FreakDays"
              class="h-5 w-5"
              loading="eager"
              fetchpriority="high"
            />
          </div>
        </div>
        <span class="text-base font-logo text-gradient whitespace-nowrap">FreakDays</span>
      </NuxtLink>

      <!-- Nav slot -->
      <slot name="nav" />

      <!-- Right side: theme + HUD chip + avatar -->
      <div class="ml-auto flex items-center gap-2 shrink-0">
        <ThemeToggle />

        <template v-if="loading">
          <div class="flex items-center gap-2 pl-2 border-l-2 border-border/50">
            <div class="hidden lg:flex flex-col items-end gap-1">
              <div class="flex items-center gap-1.5">
                <Skeleton class="h-3 w-3 rounded-none" />
                <Skeleton class="h-3 w-10 rounded-none" />
              </div>
              <Skeleton class="h-2 w-20 rounded-none" />
            </div>
            <Skeleton class="h-8 w-8 rounded-none" />
          </div>
        </template>

        <NuxtLink
          v-else-if="profile"
          to="/profile"
          class="flex items-center gap-2 pl-2 border-l-2 border-border/50 group/profile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <!-- HUD level + XP chip (desktop) -->
          <div class="hidden lg:flex flex-col items-end gap-1">
            <div class="flex items-center gap-1.5">
              <Hexagon class="h-3 w-3 text-primary" aria-hidden="true" />
              <span class="font-pixel text-[9px] text-foreground"
                >LV.{{ profile?.level ?? 1 }}</span
              >
            </div>
            <Tooltip>
              <TooltipTrigger as-child>
                <div
                  class="relative w-20 h-2 bg-white/10 ring-1 ring-white/10 overflow-hidden cursor-pointer"
                >
                  <div
                    class="h-full bg-linear-to-r from-primary via-accent to-secondary transition-all duration-500"
                    :style="{ width: `${expProgress.progress}%` }"
                  />
                  <div
                    class="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_8px,var(--color-background)_8px_11px)] pointer-events-none"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div class="space-y-1">
                  <p class="font-semibold">
                    {{ expProgress.current }} / {{ expProgress.needed }} EXP
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ expProgress.needed - expProgress.current }} para subir
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          <!-- Mobile level chip -->
          <div class="flex lg:hidden items-center gap-1">
            <Hexagon class="h-3 w-3 text-primary" aria-hidden="true" />
            <span class="font-pixel text-[8px] text-foreground">LV.{{ profile?.level ?? 1 }}</span>
          </div>

          <!-- Blocky avatar frame -->
          <div class="relative">
            <Avatar
              class="relative h-8 w-8 rounded-none ring-2 ring-transparent group-hover/profile:ring-primary/60 transition-all"
            >
              <AvatarImage
                v-if="profile?.avatarUrl"
                :src="profile.avatarUrl"
                :alt="profile?.displayName || profile?.username"
                class="object-cover"
              />
              <AvatarFallback
                class="rounded-none bg-linear-to-br from-primary to-accent text-xs text-white font-bold"
              >
                {{ profile?.username?.charAt(0)?.toUpperCase() ?? '?' }}
              </AvatarFallback>
            </Avatar>
          </div>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
