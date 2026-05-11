<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import DesktopNav from '@/components/layout/DesktopNav.vue'
import DesktopNavSecondary from '@/components/layout/DesktopNavSecondary.vue'
import MobileHeader from '@/components/layout/MobileHeader.vue'
import MobileMenu from '@/components/layout/MobileMenu.vue'
import MobileNav from '@/components/layout/MobileNav.vue'
import type { UserProfile } from '@/composables/useProfile'
import { getAllNavItems } from '@/utils/nav-items'
import { useModulesStore } from '~~/stores/modules'
import { useAuthStore } from '~~/stores/auth'

const route = useRoute()
const modulesStore = useModulesStore()
const authStore = useAuthStore()
const profileApi = useProfile()
const auth = useAuth()

const profile = ref<UserProfile | null>(null)
const loadingProfile = ref(true)
const mobileMenuOpen = ref(false)

watch(() => route.path, () => {
  mobileMenuOpen.value = false
}, { immediate: true })

let scrollPosition = 0

watch(mobileMenuOpen, (isOpen) => {
  if (process.client) {
    if (isOpen) {
      scrollPosition = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPosition}px`
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollPosition)
    }
  }
}, { immediate: true })

const expProgress = computed(() => {
  if (!profile.value) return { current: 0, needed: 100, progress: 0 }
  return profileApi.expForNextLevel(profile.value.totalExp)
})

const allNavItems = computed(() => getAllNavItems(modulesStore))
const desktopNavItems = computed(() => allNavItems.value.slice(0, 5))
const desktopSecondaryNavItems = computed(() => allNavItems.value.slice(5))
const mobilePreviewItems = computed(() => allNavItems.value.slice(0, 4))

function isActive(to: string) {
  if (to === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(to)
}

async function handleLogout() {
  await auth.signOut()
}

onMounted(async () => {
  if (import.meta.client) {
    loadingProfile.value = true
    try {
      profile.value = await profileApi.fetchProfile()
      
      // Ensure modules are loaded if authenticated
      const supabase = useSupabase()
      if (authStore.isAuthenticated && authStore.userId) {
        // Always reload modules to ensure they're up to date after page refresh
        try {
          const { data, error } = await supabase
            .from("user_modules")
            .select("module_id, enabled")
            .eq("user_id", authStore.userId)
          
          if (!error && data) {
            if (data.length > 0) {
              modulesStore.setModulesFromDb(data)
            } else {
              modulesStore.synced = true
            }
          }
        } catch (error) {
          console.error("Error loading modules in layout:", error)
        }
      }
    } finally {
      loadingProfile.value = false
    }
  }
})

onBeforeUnmount(() => {
  if (process.client) {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
  }
})
</script>

<template>
  <div style="width: 100%; min-height: 100vh; display: flex; flex-direction: column;"
    class="relative font-sans antialiased overflow-hidden">
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-linear-to-br from-background via-background to-background/95" />
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-secondary/3 via-transparent to-transparent" />

      <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
        style="animation-duration: 8s" />
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse"
        style="animation-duration: 10s; animation-delay: 2s" />
      <div class="absolute top-1/2 left-0 w-80 h-80 bg-secondary/3 rounded-full blur-3xl animate-pulse"
        style="animation-duration: 12s; animation-delay: 4s" />
      <div class="absolute bottom-1/3 right-0 w-72 h-72 bg-primary/3 rounded-full blur-3xl animate-pulse"
        style="animation-duration: 9s; animation-delay: 1s" />

      <div class="absolute inset-0"
        style="background-image: radial-gradient(circle at 1px 1px, oklch(0.28 0.04 270 / 0.15) 1px, transparent 0); background-size: 40px 40px;" />
    </div>

    <div class="relative z-0">
      <AppHeader :profile="profile" :loading="loadingProfile" :exp-progress="expProgress" :is-active="isActive"
        :menu-open="mobileMenuOpen" @logout="handleLogout">
        <template #nav>
          <DesktopNav :items="desktopNavItems" :is-active="isActive" />
          <DesktopNavSecondary :items="desktopSecondaryNavItems" :is-active="isActive" />
        </template>
      </AppHeader>

      <MobileHeader :profile="profile" :loading="loadingProfile" :menu-open="mobileMenuOpen" />

      <MobileNav :items="mobilePreviewItems" :is-active="isActive" v-model:menu-open="mobileMenuOpen" />

      <main style="width: 100%; flex: 1; display: block; pointer-events: auto;"
        class="px-4 py-4 lg:py-6 pb-20 lg:pb-6 relative z-0">
        <div style="width: 100%; max-width: 80rem; margin: 0 auto; pointer-events: auto;">
          <slot />
        </div>
      </main>

      <MobileMenu :open="mobileMenuOpen" :items="allNavItems" :is-active="isActive" @close="mobileMenuOpen = false"
        @logout="handleLogout" />
    </div>
  </div>
</template>
