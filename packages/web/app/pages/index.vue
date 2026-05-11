<script setup lang="ts">
import { TrendingUp, Calendar, Award, Zap, Target, Flame } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import LoadingSpinner from '@/components/index/LoadingSpinner.vue'
import WelcomeSection from '@/components/index/WelcomeSection.vue'
import ProfileCard from '@/components/index/ProfileCard.vue'
import ProfileCardSkeleton from '@/components/index/ProfileCardSkeleton.vue'
import StatsCardSkeleton from '@/components/index/StatsCardSkeleton.vue'
import ModuleGrid from '@/components/index/ModuleGrid.vue'
import SettingsPrompt from '@/components/index/SettingsPrompt.vue'
import { useIndexPage } from '@/composables/useIndexPage'
import { useAuthStore } from '~~/stores/auth'
import { useProfile } from '@/composables/useProfile'

const authStore = useAuthStore()
const profileApi = useProfile()

const {
  profile,
  isLoading,
  greeting,
  expProgress,
  quickStats,
  loadingStats,
  modulesStore,
} = useIndexPage()
</script>

<template>
  <div class="space-y-6 w-full">
    <ClientOnly>
      <template #default>
        <div v-if="!isLoading && !authStore.isAuthenticated" class="min-h-[600px]">
          <WelcomeSection />
        </div>
        <section v-else-if="authStore.isAuthenticated" class="space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-2 flex-1 min-w-0">
          <template v-if="isLoading || !profile">
            <Skeleton class="h-9 sm:h-11 w-64 sm:w-80 rounded-lg mb-2" />
            <Skeleton class="h-5 sm:h-6 w-48 sm:w-56 rounded-lg" />
          </template>
          <template v-else>
            <h1 class="text-3xl sm:text-4xl font-bold bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {{ greeting }}, {{ profile?.displayName || profile?.username || 'aventurero' }}!
            </h1>
            <p class="text-muted-foreground text-base sm:text-lg">
              ¿Qué quieres hacer hoy?
            </p>
          </template>
        </div>
        <template v-if="isLoading || !profile">
          <Card class="relative overflow-hidden border-exp-legendary/30 bg-linear-to-br from-exp-legendary/10 via-exp-legendary/5 to-primary/10">
            <CardContent class="relative p-4 sm:p-5">
              <div class="flex items-center gap-3 sm:gap-4">
                <Skeleton class="w-12 h-12 sm:w-14 sm:h-14 rounded-full shrink-0" />
                <div class="flex flex-col gap-2 min-w-0">
                  <Skeleton class="h-3 w-12 rounded" />
                  <Skeleton class="h-7 sm:h-9 w-16 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        </template>
        <Card v-else-if="profile" class="relative overflow-hidden border-exp-legendary/30 bg-linear-to-br from-exp-legendary/10 via-exp-legendary/5 to-primary/10 hover:border-exp-legendary/50 transition-all duration-300 group">
          <div class="absolute inset-0 bg-exp-legendary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div class="absolute top-0 right-0 w-24 h-24 bg-exp-legendary/10 rounded-full blur-2xl opacity-50" />
          <CardContent class="relative p-4 sm:p-5">
            <div class="flex items-center gap-3 sm:gap-4">
              <div class="relative flex-shrink-0">
                <div class="absolute inset-0 bg-exp-legendary/30 blur-xl rounded-full animate-pulse opacity-60" />
                <div class="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-linear-to-br from-exp-legendary/30 via-exp-legendary/20 to-primary/30 flex items-center justify-center border-2 border-exp-legendary/40 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Flame class="h-6 w-6 sm:h-7 sm:w-7 text-exp-legendary drop-shadow-lg" />
                </div>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Nivel</span>
                <span class="text-2xl sm:text-3xl font-logo font-bold text-exp-legendary leading-none drop-shadow-sm">{{ profile.level }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileCardSkeleton v-if="isLoading || !profile" class="md:col-span-2" />
        <ProfileCard 
          v-else-if="profile" 
          :profile="profile"
          :exp-progress="expProgress"
          class="md:col-span-2"
        />

        <StatsCardSkeleton v-if="loadingStats" />
        <Card v-else class="group relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div class="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
          <CardContent class="relative p-6 sm:p-7">
            <div class="flex flex-col h-full min-h-[120px] sm:min-h-[140px]">
              <div class="flex-1 space-y-2">
                <p class="text-sm font-medium text-muted-foreground/90 uppercase tracking-wide">Quests Pendientes</p>
                <p class="text-4xl sm:text-5xl font-bold text-primary leading-none">{{ quickStats.questsPending }}</p>
              </div>
              <div class="flex justify-end mt-auto">
                <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
                  <Target class="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <StatsCardSkeleton v-if="loadingStats" />
        <Card v-else class="group relative overflow-hidden border-exp-easy/30 bg-gradient-to-br from-exp-easy/15 via-exp-easy/10 to-exp-easy/5 hover:border-exp-easy/50 hover:shadow-lg hover:shadow-exp-easy/10 transition-all duration-300">
          <div class="absolute inset-0 bg-gradient-to-br from-exp-easy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div class="absolute top-0 right-0 w-40 h-40 bg-exp-easy/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
          <CardContent class="relative p-6 sm:p-7">
            <div class="flex flex-col h-full min-h-[120px] sm:min-h-[140px]">
              <div class="flex-1 space-y-2">
                <p class="text-sm font-medium text-muted-foreground/90 uppercase tracking-wide">Animes en Curso</p>
                <p class="text-4xl sm:text-5xl font-bold text-exp-easy leading-none">{{ quickStats.animeWatching }}</p>
              </div>
              <div class="flex justify-end mt-auto">
                <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-exp-easy/20 backdrop-blur-sm border border-exp-easy/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-exp-easy/30 transition-all duration-300">
                  <TrendingUp class="h-7 w-7 sm:h-8 sm:w-8 text-exp-easy" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <StatsCardSkeleton v-if="loadingStats" />
        <Card v-else class="group relative overflow-hidden border-exp-legendary/30 bg-gradient-to-br from-exp-legendary/15 via-exp-legendary/10 to-exp-legendary/5 hover:border-exp-legendary/50 hover:shadow-lg hover:shadow-exp-legendary/10 transition-all duration-300">
          <div class="absolute inset-0 bg-gradient-to-br from-exp-legendary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div class="absolute top-0 right-0 w-40 h-40 bg-exp-legendary/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
          <CardContent class="relative p-6 sm:p-7">
            <div class="flex flex-col h-full min-h-[120px] sm:min-h-[140px]">
              <div class="flex-1 space-y-2">
                <p class="text-sm font-medium text-muted-foreground/90 uppercase tracking-wide">Quests Hoy</p>
                <p class="text-4xl sm:text-5xl font-bold text-exp-legendary leading-none">{{ quickStats.questsToday }}</p>
              </div>
              <div class="flex justify-end mt-auto">
                <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-exp-legendary/20 backdrop-blur-sm border border-exp-legendary/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-exp-legendary/30 transition-all duration-300">
                  <Award class="h-7 w-7 sm:h-8 sm:w-8 text-exp-legendary" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <StatsCardSkeleton v-if="loadingStats" />
        <Card v-else class="group relative overflow-hidden border-accent/30 bg-gradient-to-br from-accent/15 via-accent/10 to-accent/5 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
          <div class="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div class="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
          <CardContent class="relative p-6 sm:p-7">
            <div class="flex flex-col h-full min-h-[120px] sm:min-h-[140px]">
              <div class="flex-1 space-y-2">
                <p class="text-sm font-medium text-muted-foreground/90 uppercase tracking-wide">Entrenamientos Semana</p>
                <p class="text-4xl sm:text-5xl font-bold text-accent leading-none">{{ quickStats.workoutsThisWeek }}</p>
              </div>
              <div class="flex justify-end mt-auto">
                <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent/30 transition-all duration-300">
                  <Calendar class="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <Zap class="h-5 w-5 text-primary" />
          <h2 class="text-xl font-bold">Módulos</h2>
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
