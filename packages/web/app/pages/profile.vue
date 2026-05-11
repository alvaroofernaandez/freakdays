<script setup lang="ts">
import BannerCropModal from '@/components/profile/BannerCropModal.vue'
import ProfileEditForm from '@/components/profile/ProfileEditForm.vue'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileInfoCards from '@/components/profile/ProfileInfoCards.vue'
import ProfileProgressCard from '@/components/profile/ProfileProgressCard.vue'
import ProfileStats from '@/components/profile/ProfileStats.vue'
import ConfirmDisableDialog from '@/components/settings/ConfirmDisableDialog.vue'
import ModuleCard from '@/components/settings/ModuleCard.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useProfile } from '@/composables/useProfile'
import { useProfilePage } from '@/composables/useProfilePage'
import { useToast } from '@/composables/useToast'
import { Check, LogOut, Power, RefreshCw, Settings, Trash2, Upload, User } from 'lucide-vue-next'
import { toRef } from 'vue'
import { useModulesStore } from '~~/stores/modules'

const modulesStore = useModulesStore()
const toast = useToast()
const profileApi = useProfile()

const profilePage = useProfilePage()

const {
  profile,
  loading,
  saving,
  savingModules,
  modulesSaved,
  uploadingAvatar,
  editing,
  confirmDialog,
  moduleToDisable,
  editForm,
  avatarPreview,
  expProgress,
  favoriteAnime,
  favoriteManga,
  modules,
  animeList,
  mangaList,
  startEditing,
  cancelEditing,
  saveProfile,
  handleAvatarUpload,
  handleDeleteAvatar,
  triggerAvatarUpload,
  handleDeleteBanner,
  handleLogout,
  handleToggleModule,
  confirmDisable,
  cancelDisable,
  handleDisableAll,
  initialize,
} = profilePage

const uploadingBanner = toRef(profilePage, 'uploadingBanner')
const bannerPreview = toRef(profilePage, 'bannerPreview')

const bannerFileInputLocal = ref<HTMLInputElement | null>(null)
const bannerCropModalOpen = ref(false)
const selectedBannerFile = ref<File | null>(null)

function triggerBannerUploadLocal() {
  if (bannerFileInputLocal.value) {
    bannerFileInputLocal.value.click()
  } else {
    console.error('bannerFileInputLocal is not available')
  }
}

function handleBannerFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('Por favor, selecciona una imagen válida')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error('La imagen no puede ser mayor a 10MB')
    return
  }

  selectedBannerFile.value = file
  bannerCropModalOpen.value = true
}

async function handleBannerCrop(croppedFile: File) {
  uploadingBanner.value = true
  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      bannerPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(croppedFile)

    const bannerUrl = await profileApi.uploadBanner(croppedFile)
    if (bannerUrl) {
      await initialize()
      toast.success('Banner actualizado correctamente')
    } else {
      toast.error('Error al subir el banner')
    }
  } catch (error) {
    console.error('Error uploading banner:', error)
    toast.error('Error al subir el banner')
  } finally {
    uploadingBanner.value = false
    selectedBannerFile.value = null
    if (bannerFileInputLocal.value) {
      bannerFileInputLocal.value.value = ''
    }
  }
}

function handleBannerCropCancel() {
  selectedBannerFile.value = null
  if (bannerFileInputLocal.value) {
    bannerFileInputLocal.value.value = ''
  }
}

onMounted(() => {
  initialize()
})
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <header class="space-y-2">
      <h1
        class="text-3xl sm:text-4xl font-bold bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <User class="h-5 w-5 text-primary" />
        </div>
        Mi Perfil
      </h1>
      <p class="text-muted-foreground text-base">
        Gestiona tu cuenta, estadísticas, preferencias y módulos
      </p>
    </header>

    <div v-if="loading" class="space-y-6">
      <Card class="overflow-hidden">
        <div class="h-32 bg-linear-to-r from-primary/20 via-primary/10 to-accent/20 relative">
          <Skeleton class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full" />
        </div>
        <CardContent class="pt-16 pb-6">
          <div class="space-y-4">
            <Skeleton class="h-8 w-48 mx-auto" />
            <Skeleton class="h-4 w-32 mx-auto" />
            <Skeleton class="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Skeleton class="h-24" />
        <Skeleton class="h-24" />
        <Skeleton class="h-24" />
        <Skeleton class="h-24" />
      </div>
    </div>

    <template v-else-if="profile">
      <Card
        class="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 via-background to-accent/5">
        <div class="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div class="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

        <div class="h-32 sm:h-40 md:h-48 relative overflow-hidden group">
          <img v-if="bannerPreview || profile.bannerUrl" :src="(bannerPreview || profile.bannerUrl) ?? undefined"
            :alt="`Banner de ${profile.displayName || profile.username}`" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full bg-linear-to-r from-primary/20 via-accent/10 to-primary/20">
            <div
              class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary),0.2),transparent)]" />
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(var(--accent),0.15),transparent)]" />
          </div>
          <div v-if="editing"
            class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
            <div class="flex gap-2">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button size="icon" variant="secondary" class="h-10 w-10" @click="triggerBannerUploadLocal"
                    :disabled="uploadingBanner">
                    <Upload class="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Subir banner</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button v-if="bannerPreview || profile.bannerUrl" size="icon" variant="destructive" class="h-10 w-10"
                    @click="handleDeleteBanner" :disabled="uploadingBanner">
                    <Trash2 class="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Eliminar banner</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
        <input ref="bannerFileInputLocal" type="file" accept="image/*" class="hidden"
          @change="handleBannerFileSelect" />

        <CardContent class="-mt-16 relative z-10">
          <ProfileHeader :profile="profile" :editing="editing" :avatar-preview="avatarPreview"
            :uploading-avatar="uploadingAvatar" :saving="saving" @start-editing="startEditing"
            @cancel-editing="cancelEditing" @save-profile="saveProfile" @trigger-avatar-upload="triggerAvatarUpload"
            @delete-avatar="handleDeleteAvatar" @avatar-upload="handleAvatarUpload" />

          <ProfileEditForm v-if="editing" v-model:form="editForm" :anime-list="animeList" :manga-list="mangaList" />

          <div v-else class="mt-6 space-y-6">
            <div v-if="profile.bio" class="p-5 bg-muted/30 rounded-xl border border-primary/10">
              <p class="text-sm leading-relaxed text-foreground">{{ profile.bio }}</p>
            </div>

            <ProfileInfoCards :profile="profile" :favorite-anime="favoriteAnime" :favorite-manga="favoriteManga" />
          </div>
        </CardContent>
      </Card>

      <ProfileStats :level="profile.level" :total-exp="profile.totalExp" :current-exp="expProgress.current"
        :needed-exp="expProgress.needed" />

      <ProfileProgressCard :level="profile.level" :current-exp="expProgress.current" :needed-exp="expProgress.needed" />

      <Card
        class="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 via-background to-accent/5">
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="flex items-center gap-2">
              <Settings class="h-5 w-5 text-primary" />
              Configuración de Módulos
            </CardTitle>
            <div v-if="savingModules || modulesSaved" class="flex items-center gap-2 text-sm">
              <div v-if="savingModules"
                class="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              <div v-else-if="modulesSaved" class="flex items-center gap-1 text-exp-easy">
                <Check class="h-4 w-4" />
                <span>Guardado</span>
              </div>
            </div>
          </div>
          <CardDescription>
            Activa o desactiva los módulos que quieres usar
          </CardDescription>
        </CardHeader>
        <CardContent class="relative space-y-4">
          <div class="space-y-2">
            <ModuleCard v-for="module in modules" :key="`module-${module.id}`" :module="module"
              @toggle="handleToggleModule" />
          </div>

          <Separator />

          <div class="space-y-3">
            <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Acciones Rápidas
            </h3>
            <div class="grid grid-cols-2 gap-2">
              <Button variant="outline" class="h-auto py-3 flex-col gap-1" @click="handleDisableAll"
                :disabled="savingModules">
                <Power class="h-4 w-4" />
                <span class="text-xs">Desactivar Todos</span>
              </Button>
              <Button variant="outline" class="h-auto py-3 flex-col gap-1" as-child>
                <NuxtLink to="/onboarding">
                  <RefreshCw class="h-4 w-4" />
                  <span class="text-xs">Reconfigurar</span>
                </NuxtLink>
              </Button>
            </div>
          </div>

          <Separator />

          <div class="space-y-3">
            <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Información
            </h3>
            <Card>
              <CardContent class="py-4 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Versión</span>
                  <span class="font-mono">1.0.0</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Módulos activos</span>
                  <Badge variant="secondary">{{ modulesStore.enabledModules.length }}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card class="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle class="text-base text-destructive flex items-center gap-2">
            <LogOut class="h-5 w-5" />
            Zona de peligro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" class="w-full gap-2" @click="handleLogout">
            <LogOut class="h-4 w-4" />
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </template>

    <ConfirmDisableDialog :open="confirmDialog.isOpen.value" :module-name="moduleToDisable?.name ?? null"
      :saving="savingModules" @confirm="confirmDisable" @cancel="cancelDisable" />

    <BannerCropModal :open="bannerCropModalOpen" :image-file="selectedBannerFile" :aspect-ratio="16 / 9"
      @update:open="bannerCropModalOpen = $event" @crop="handleBannerCrop" @cancel="handleBannerCropCancel" />
  </div>
</template>
