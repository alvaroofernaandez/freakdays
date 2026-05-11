<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserProfile } from '@/composables/useProfile'
import { Trophy } from 'lucide-vue-next'

interface Props {
  profile: UserProfile | null
  loading?: boolean
  menuOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  menuOpen: false,
})
</script>

<template>
  <header v-if="!menuOpen"
    class="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl lg:hidden">
    <div class="flex h-14 items-center justify-between px-4">
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-lg group">
        <div class="relative flex items-center justify-center">
          <div
            class="absolute inset-0 bg-primary/10 blur-lg rounded-full opacity-0 group-active:opacity-100 transition-opacity duration-200" />
          <div
            class="relative p-1 rounded-md bg-primary/5 border border-primary/10 group-active:border-primary/30 group-active:bg-primary/10 transition-all duration-200">
            <img src="/logo.png" alt="FreakDays"
              class="h-6 w-6 rounded-lg transition-transform duration-200 group-active:scale-110" loading="eager"
              fetchpriority="high" />
          </div>
        </div>
      </NuxtLink>

      <template v-if="loading">
        <div class="flex items-center gap-2">
          <Skeleton class="h-4 w-4 rounded" />
          <Skeleton class="h-4 w-10 rounded" />
          <Skeleton class="h-8 w-8 rounded-full" />
        </div>
      </template>
      <NuxtLink v-else-if="profile" to="/profile" class="flex items-center gap-2">
        <div class="flex items-center gap-1.5">
          <Trophy class="h-4 w-4 text-exp-legendary" />
          <span class="text-sm font-semibold">Lv.{{ profile?.level ?? 1 }}</span>
        </div>
        <Avatar class="h-8 w-8">
          <AvatarImage v-if="profile?.avatarUrl" :src="profile.avatarUrl"
            :alt="profile?.displayName || profile?.username" />
          <AvatarFallback class="bg-primary/20 text-primary text-xs">
            {{ profile?.username?.charAt(0)?.toUpperCase() ?? '?' }}
          </AvatarFallback>
        </Avatar>
      </NuxtLink>
    </div>
  </header>
</template>
