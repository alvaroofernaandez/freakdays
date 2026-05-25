<script setup lang="ts">
import { TrendingUp, Calendar, Award, Zap, Target, Hexagon } from 'lucide-vue-next';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingSpinner from '@/components/index/LoadingSpinner.vue';
import WelcomeSection from '@/components/index/WelcomeSection.vue';
import ProfileCard from '@/components/index/ProfileCard.vue';
import ProfileCardSkeleton from '@/components/index/ProfileCardSkeleton.vue';
import StatsCardSkeleton from '@/components/index/StatsCardSkeleton.vue';
import StatCard from '@/components/index/StatCard.vue';
import ModuleGrid from '@/components/index/ModuleGrid.vue';
import SettingsPrompt from '@/components/index/SettingsPrompt.vue';
import { useIndexPage } from '@/composables/useIndexPage';
import { useAuthStore } from '~~/stores/auth';

const authStore = useAuthStore();

const { profile, isLoading, greeting, expProgress, quickStats, loadingStats, modulesStore } =
  useIndexPage();

/**
 * Returns a display name that never leaks a raw Clerk user id (starts with "user_").
 * Priority: displayName → username (if not a user_ id) → email local-part → fallback
 */
const displayName = computed(() => {
  const p = profile.value;
  if (!p) return 'Jugador';
  if (p.displayName) return p.displayName;
  if (p.username && !p.username.startsWith('user_')) return p.username;
  // Try email local-part from auth store
  const email = authStore.userEmail;
  if (email) return email.split('@')[0];
  return 'Jugador';
});
</script>

<template>
  <div class="space-y-5 w-full">
    <ClientOnly>
      <template #default>
        <div v-if="!isLoading && !authStore.isAuthenticated" class="min-h-[600px]">
          <WelcomeSection />
        </div>

        <section v-else-if="authStore.isAuthenticated" class="space-y-5">
          <!-- Greeting header -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="space-y-1.5 flex-1 min-w-0">
              <template v-if="isLoading || !profile">
                <Skeleton class="h-8 w-56 sm:w-72 rounded-none mb-1.5" />
                <Skeleton class="h-4 w-40 rounded-none" />
              </template>
              <template v-else>
                <p class="font-pixel text-[9px] text-primary uppercase tracking-wide">
                  ▸ {{ greeting.toUpperCase() }}
                </p>
                <h1
                  class="text-3xl sm:text-4xl font-bold bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight"
                >
                  {{ displayName }}
                </h1>
                <p class="font-pixel text-[9px] text-muted-foreground/80 uppercase tracking-wide">
                  ¿QUÉ QUIERES HACER HOY?
                </p>
              </template>
            </div>

            <!-- Level badge -->
            <template v-if="isLoading || !profile">
              <div class="border-2 border-border/50 p-4">
                <div class="flex items-center gap-3">
                  <Skeleton class="w-10 h-10 rounded-none shrink-0" />
                  <div class="flex flex-col gap-1.5">
                    <Skeleton class="h-2.5 w-10 rounded-none" />
                    <Skeleton class="h-6 w-14 rounded-none" />
                  </div>
                </div>
              </div>
            </template>
            <div
              v-else-if="profile"
              class="relative border-2 border-primary/30 bg-primary/5 hover:border-primary/50 hover:shadow-[0_0_22px_-8px_var(--color-primary)] transition-all duration-200 p-4 group"
            >
              <div class="flex items-center gap-3">
                <!-- Notched level hexagon -->
                <div
                  class="pixelated grid h-12 w-12 shrink-0 place-items-center bg-linear-to-br from-primary to-accent shadow-[0_0_18px_-4px_var(--color-primary)] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]"
                >
                  <span class="font-pixel text-[10px] text-white">{{ profile.level }}</span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <div class="flex items-center gap-1.5">
                    <Hexagon class="h-3 w-3 text-primary" aria-hidden="true" />
                    <span class="font-pixel text-[8px] text-muted-foreground">NIVEL</span>
                  </div>
                  <span class="font-pixel text-[18px] text-primary leading-none">{{
                    profile.level
                  }}</span>
                </div>
              </div>
              <!-- Scanline particle -->
              <span
                class="pixelated absolute top-1 right-2 h-1.5 w-1.5 bg-accent motion-safe:animate-pulse"
                aria-hidden="true"
              />
            </div>
          </div>

          <!-- Profile card + stats grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileCardSkeleton v-if="isLoading || !profile" class="md:col-span-2" />
            <ProfileCard
              v-else-if="profile"
              :profile="profile"
              :exp-progress="expProgress"
              class="md:col-span-2"
            />

            <StatsCardSkeleton v-if="loadingStats" />
            <StatCard
              v-else
              label="Quests Pendientes"
              :value="quickStats.questsPending"
              :icon="Target"
              color-variant="primary"
            />

            <StatsCardSkeleton v-if="loadingStats" />
            <StatCard
              v-else
              label="Animes en Curso"
              :value="quickStats.animeWatching"
              :icon="TrendingUp"
              color-variant="exp-easy"
            />

            <StatsCardSkeleton v-if="loadingStats" />
            <StatCard
              v-else
              label="Quests Hoy"
              :value="quickStats.questsToday"
              :icon="Award"
              color-variant="exp-legendary"
            />

            <StatsCardSkeleton v-if="loadingStats" />
            <StatCard
              v-else
              label="Entrenamientos Semana"
              :value="quickStats.workoutsThisWeek"
              :icon="Calendar"
              color-variant="accent"
            />
          </div>

          <!-- Modules section -->
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <Zap class="h-4 w-4 text-primary" aria-hidden="true" />
              <span class="font-pixel text-[9px] text-foreground uppercase">▸ MÓDULOS</span>
            </div>
            <ClientOnly>
              <ModuleGrid :modules="modulesStore.enabledModules" />
            </ClientOnly>
          </div>

          <SettingsPrompt />
        </section>
      </template>

      <template #fallback>
        <div class="min-h-[600px] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
