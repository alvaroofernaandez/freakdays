<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/composables/useProfile';
import { Hexagon } from 'lucide-vue-next';

interface Props {
  profile: UserProfile | null;
  loading?: boolean;
  menuOpen?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  menuOpen: false,
});
</script>

<template>
  <header
    v-if="!menuOpen"
    class="sticky top-0 z-50 w-full border-b-2 border-border bg-background/90 backdrop-blur-xl lg:hidden"
  >
    <div class="flex h-12 items-center justify-between px-4">
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <div
          class="pixelated flex items-center justify-center w-7 h-7 bg-linear-to-br from-primary via-accent to-secondary p-[2px] [clip-path:polygon(0_3px,3px_3px,3px_0,calc(100%-3px)_0,calc(100%-3px)_3px,100%_3px,100%_calc(100%-3px),calc(100%-3px)_calc(100%-3px),calc(100%-3px)_100%,3px_100%,3px_calc(100%-3px),0_calc(100%-3px))]"
        >
          <div
            class="w-full h-full bg-card flex items-center justify-center [clip-path:polygon(0_2px,2px_2px,2px_0,calc(100%-2px)_0,calc(100%-2px)_2px,100%_2px,100%_calc(100%-2px),calc(100%-2px)_calc(100%-2px),calc(100%-2px)_100%,2px_100%,2px_calc(100%-2px),0_calc(100%-2px))]"
          >
            <img
              src="/logo.png"
              alt="FreakDays"
              class="h-4 w-4"
              loading="eager"
              fetchpriority="high"
            />
          </div>
        </div>
        <span class="text-sm font-logo text-gradient">FreakDays</span>
      </NuxtLink>

      <template v-if="loading">
        <div class="flex items-center gap-2">
          <Skeleton class="h-3 w-3 rounded-none" />
          <Skeleton class="h-3 w-8 rounded-none" />
          <Skeleton class="h-7 w-7 rounded-none" />
        </div>
      </template>

      <NuxtLink
        v-else-if="profile"
        to="/profile"
        class="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div class="flex items-center gap-1">
          <Hexagon class="h-3 w-3 text-primary" aria-hidden="true" />
          <span class="font-pixel text-[8px] text-foreground">LV.{{ profile?.level ?? 1 }}</span>
        </div>
        <Avatar
          class="h-7 w-7 rounded-none ring-2 ring-transparent hover:ring-primary/50 transition-all"
        >
          <AvatarImage
            v-if="profile?.avatarUrl"
            :src="profile.avatarUrl"
            :alt="profile?.displayName || profile?.username"
          />
          <AvatarFallback class="rounded-none bg-primary/20 text-primary text-xs">
            {{ profile?.username?.charAt(0)?.toUpperCase() ?? '?' }}
          </AvatarFallback>
        </Avatar>
      </NuxtLink>
    </div>
  </header>
</template>
