<script setup lang="ts">
import BannerCropModal from '@/components/profile/BannerCropModal.vue';
import ProfileEditForm from '@/components/profile/ProfileEditForm.vue';
import ProfileHeader from '@/components/profile/ProfileHeader.vue';
import ProfileInfoCards from '@/components/profile/ProfileInfoCards.vue';
import ProfileProgressCard from '@/components/profile/ProfileProgressCard.vue';
import ProfileStats from '@/components/profile/ProfileStats.vue';
import ConfirmDisableDialog from '@/components/settings/ConfirmDisableDialog.vue';
import ModuleCard from '@/components/settings/ModuleCard.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useProfile } from '@/composables/useProfile';
import { useProfilePage } from '@/composables/useProfilePage';
import { useToast } from '@/composables/useToast';
import { Check, LogOut, Power, RefreshCw, Settings, Trash2, Upload, User } from 'lucide-vue-next';
import { ref, toRef, watch } from 'vue';
import { useApiClient } from '@/composables/useApiClient';
import { useModulesStore } from '~~/stores/modules';

const modulesStore = useModulesStore();
const toast = useToast();
const profileApi = useProfile();

const profilePage = useProfilePage();

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
} = profilePage;

useSeoMeta({
  title: 'Tu perfil',
  description: 'Gestiona tu perfil y configuración en FreakDays',
});

// ─── Leaderboard opt-in ───────────────────────────────────────────────────────
const leaderboardOptIn = ref<boolean>(false);
const leaderboardOptInSaving = ref(false);

// Sync from profile when it loads
watch(
  () => profile.value,
  (p) => {
    if (p) {
      leaderboardOptIn.value = Boolean(p.leaderboardOptIn);
    }
  },
  { immediate: true },
);

async function handleLeaderboardOptInToggle() {
  leaderboardOptInSaving.value = true;
  try {
    const { patch } = useApiClient();
    await patch('/v1/profile/me', { leaderboardOptIn: leaderboardOptIn.value });
    toast.success(
      leaderboardOptIn.value
        ? 'Tu perfil aparece en el leaderboard global.'
        : 'Tu perfil ya no aparece en el leaderboard global.',
    );
  } catch {
    // Revert on error
    leaderboardOptIn.value = !leaderboardOptIn.value;
    toast.error('No se pudo actualizar la preferencia. Intenta de nuevo.');
  } finally {
    leaderboardOptInSaving.value = false;
  }
}

const uploadingBanner = toRef(profilePage, 'uploadingBanner');
const bannerPreview = toRef(profilePage, 'bannerPreview');

const bannerFileInputLocal = ref<HTMLInputElement | null>(null);
const bannerCropModalOpen = ref(false);
const selectedBannerFile = ref<File | null>(null);

function triggerBannerUploadLocal() {
  if (bannerFileInputLocal.value) {
    bannerFileInputLocal.value.click();
  } else {
    console.error('bannerFileInputLocal is not available');
  }
}

function handleBannerFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.error('Por favor, selecciona una imagen válida');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error('La imagen no puede ser mayor a 10MB');
    return;
  }

  selectedBannerFile.value = file;
  bannerCropModalOpen.value = true;
}

async function handleBannerCrop(croppedFile: File) {
  uploadingBanner.value = true;
  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      bannerPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(croppedFile);

    const bannerUrl = await profileApi.uploadBanner(croppedFile);
    if (bannerUrl) {
      await initialize();
      toast.success('Banner actualizado correctamente');
    } else {
      toast.error('Error al subir el banner');
    }
  } catch (error) {
    console.error('Error uploading banner:', error);
    toast.error('Error al subir el banner');
  } finally {
    uploadingBanner.value = false;
    selectedBannerFile.value = null;
    if (bannerFileInputLocal.value) {
      bannerFileInputLocal.value.value = '';
    }
  }
}

function handleBannerCropCancel() {
  selectedBannerFile.value = null;
  if (bannerFileInputLocal.value) {
    bannerFileInputLocal.value.value = '';
  }
}

onMounted(() => {
  initialize();
});
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <header class="space-y-1">
      <p
        class="flex items-center gap-1.5 font-pixel text-[8px] text-primary/80 uppercase tracking-wider"
      >
        <span class="text-primary">▸</span> PROFILE
      </p>
      <h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-3">
        <div
          class="w-10 h-10 bg-primary/10 flex items-center justify-center border-2 border-primary/25"
          style="
            clip-path: polygon(
              0 4px,
              4px 4px,
              4px 0,
              calc(100% - 4px) 0,
              calc(100% - 4px) 4px,
              100% 4px,
              100% calc(100% - 4px),
              calc(100% - 4px) calc(100% - 4px),
              calc(100% - 4px) 100%,
              4px 100%,
              4px calc(100% - 4px),
              0 calc(100% - 4px)
            );
          "
          aria-hidden="true"
        >
          <User class="h-5 w-5 text-primary" />
        </div>
        Mi Perfil
      </h1>
    </header>

    <div v-if="loading" class="space-y-6">
      <Card class="rounded-none border-2 border-primary/20 overflow-hidden">
        <div class="h-32 bg-linear-to-r from-primary/10 via-accent/5 to-primary/10 relative">
          <Skeleton
            class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-none"
          />
        </div>
        <CardContent class="pt-16 pb-6">
          <div class="space-y-3">
            <Skeleton class="h-7 w-48 mx-auto rounded-none" />
            <Skeleton class="h-3 w-32 mx-auto rounded-none" />
            <Skeleton class="h-16 w-full rounded-none" />
          </div>
        </CardContent>
      </Card>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Skeleton v-for="i in 4" :key="i" class="h-28 rounded-none" />
      </div>
    </div>

    <template v-else-if="profile">
      <Card class="relative overflow-hidden rounded-none border-2 border-primary/25 bg-card/60">
        <!-- HUD brackets -->
        <span
          class="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/40 z-10"
          aria-hidden="true"
        />
        <span
          class="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/40 z-10"
          aria-hidden="true"
        />
        <span
          class="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/40 z-10"
          aria-hidden="true"
        />
        <span
          class="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/40 z-10"
          aria-hidden="true"
        />
        <div
          class="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          class="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
          aria-hidden="true"
        />

        <div class="h-32 sm:h-40 md:h-48 relative overflow-hidden group">
          <img
            v-if="bannerPreview || profile.bannerUrl"
            :src="(bannerPreview || profile.bannerUrl) ?? undefined"
            :alt="`Banner de ${profile.displayName || profile.username}`"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full bg-linear-to-r from-primary/20 via-accent/10 to-primary/20"
          >
            <div
              class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary),0.2),transparent)]"
            />
            <div
              class="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(var(--accent),0.15),transparent)]"
            />
          </div>
          <div
            v-if="editing"
            class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <div class="flex gap-2">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    size="icon"
                    variant="secondary"
                    class="h-10 w-10"
                    :disabled="uploadingBanner"
                    @click="triggerBannerUploadLocal"
                  >
                    <Upload class="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Subir banner</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    v-if="bannerPreview || profile.bannerUrl"
                    size="icon"
                    variant="destructive"
                    class="h-10 w-10"
                    :disabled="uploadingBanner"
                    @click="handleDeleteBanner"
                  >
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
        <input
          ref="bannerFileInputLocal"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleBannerFileSelect"
        />

        <CardContent class="-mt-16 relative z-10">
          <ProfileHeader
            :profile="profile"
            :editing="editing"
            :avatar-preview="avatarPreview"
            :uploading-avatar="uploadingAvatar"
            :saving="saving"
            @start-editing="startEditing"
            @cancel-editing="cancelEditing"
            @save-profile="saveProfile"
            @trigger-avatar-upload="triggerAvatarUpload"
            @delete-avatar="handleDeleteAvatar"
            @avatar-upload="handleAvatarUpload"
          />

          <ProfileEditForm
            v-if="editing"
            v-model:form="editForm"
            :anime-list="animeList"
            :manga-list="mangaList"
          />

          <div v-else class="mt-6 space-y-6">
            <div v-if="profile.bio" class="p-5 bg-muted/30 rounded-none border border-primary/10">
              <p class="text-sm leading-relaxed text-foreground">{{ profile.bio }}</p>
            </div>

            <ProfileInfoCards
              :profile="profile"
              :favorite-anime="favoriteAnime"
              :favorite-manga="favoriteManga"
            />
          </div>
        </CardContent>
      </Card>

      <ProfileStats
        :level="profile.level"
        :total-exp="profile.totalExp"
        :current-exp="expProgress.current"
        :needed-exp="expProgress.needed"
      />

      <ProfileProgressCard
        :level="profile.level"
        :current-exp="expProgress.current"
        :needed-exp="expProgress.needed"
      />

      <!-- Leaderboard opt-in card -->
      <Card class="relative overflow-hidden rounded-none border-2 border-secondary/25 bg-card/60">
        <span
          class="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-secondary/35 z-10"
          aria-hidden="true"
        />
        <span
          class="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-secondary/35 z-10"
          aria-hidden="true"
        />
        <span
          class="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-secondary/35 z-10"
          aria-hidden="true"
        />
        <span
          class="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-secondary/35 z-10"
          aria-hidden="true"
        />
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <span class="font-pixel text-[9px] text-secondary uppercase tracking-wider"
              >▸ LEADERBOARD GLOBAL</span
            >
          </CardTitle>
          <CardDescription>
            Elige si tu perfil aparece en el ranking global de todos los jugadores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label
            class="flex items-center justify-between gap-4 cursor-pointer group"
            :class="leaderboardOptInSaving ? 'opacity-60 pointer-events-none' : ''"
          >
            <div class="space-y-0.5">
              <p class="text-sm font-medium leading-none">Mostrar en el leaderboard global</p>
              <p class="text-xs text-muted-foreground">
                <template v-if="leaderboardOptIn">
                  Tu perfil aparece en el leaderboard global.
                </template>
                <template v-else> Tu perfil no aparece en el leaderboard global. </template>
              </p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="leaderboardOptIn"
              :aria-label="
                leaderboardOptIn ? 'Desactivar leaderboard global' : 'Activar leaderboard global'
              "
              :disabled="leaderboardOptInSaving"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed"
              :class="leaderboardOptIn ? 'bg-secondary' : 'bg-input'"
              @click="
                leaderboardOptIn = !leaderboardOptIn;
                handleLeaderboardOptInToggle();
              "
            >
              <span
                class="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform"
                :class="leaderboardOptIn ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </label>
        </CardContent>
      </Card>

      <Card class="relative overflow-hidden rounded-none border-2 border-primary/20 bg-card/60">
        <span
          class="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/35 z-10"
          aria-hidden="true"
        />
        <span
          class="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/35 z-10"
          aria-hidden="true"
        />
        <span
          class="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/35 z-10"
          aria-hidden="true"
        />
        <span
          class="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/35 z-10"
          aria-hidden="true"
        />
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="flex items-center gap-2">
              <Settings class="h-5 w-5 text-primary" aria-hidden="true" />
              Configuración de Módulos
            </CardTitle>
            <div v-if="savingModules || modulesSaved" class="flex items-center gap-2 text-sm">
              <div
                v-if="savingModules"
                class="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
              />
              <div v-else-if="modulesSaved" class="flex items-center gap-1 text-exp-easy">
                <Check class="h-4 w-4" />
                <span>Guardado</span>
              </div>
            </div>
          </div>
          <CardDescription> Activa o desactiva los módulos que quieres usar </CardDescription>
        </CardHeader>
        <CardContent class="relative space-y-4">
          <div class="space-y-2">
            <ModuleCard
              v-for="module in modules"
              :key="`module-${module.id}`"
              :module="module"
              @toggle="handleToggleModule"
            />
          </div>

          <Separator />

          <div class="space-y-3">
            <p
              class="flex items-center gap-1 font-pixel text-[8px] text-muted-foreground/70 uppercase tracking-wider"
            >
              <span class="inline-block w-1.5 h-1.5 bg-primary/50" aria-hidden="true" />
              ACCIONES RÁPIDAS
            </p>
            <div class="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                class="btn-game h-auto py-3 flex-col gap-1 rounded-none font-pixel text-[8px] cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                :disabled="savingModules"
                @click="handleDisableAll"
              >
                <Power class="h-4 w-4" aria-hidden="true" />
                <span>DESACTIVAR TODOS</span>
              </Button>
              <Button
                variant="outline"
                class="btn-game h-auto py-3 flex-col gap-1 rounded-none font-pixel text-[8px] cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                as-child
              >
                <NuxtLink to="/onboarding">
                  <RefreshCw class="h-4 w-4" aria-hidden="true" />
                  <span>RECONFIGURAR</span>
                </NuxtLink>
              </Button>
            </div>
          </div>

          <Separator />

          <div class="space-y-3">
            <p
              class="flex items-center gap-1 font-pixel text-[8px] text-muted-foreground/70 uppercase tracking-wider"
            >
              <span class="inline-block w-1.5 h-1.5 bg-accent/50" aria-hidden="true" />
              INFORMACIÓN
            </p>
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

      <Card class="relative rounded-none border-2 border-destructive/30 bg-destructive/5">
        <span
          class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-destructive/40"
          aria-hidden="true"
        />
        <span
          class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-destructive/40"
          aria-hidden="true"
        />
        <span
          class="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-destructive/40"
          aria-hidden="true"
        />
        <span
          class="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-destructive/40"
          aria-hidden="true"
        />
        <CardHeader>
          <CardTitle
            class="font-pixel text-[9px] text-destructive uppercase tracking-wider flex items-center gap-2"
          >
            <LogOut class="h-4 w-4" aria-hidden="true" />
            ▸ ZONA DE PELIGRO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            class="btn-game w-full gap-2 rounded-none font-pixel text-[10px] cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" aria-hidden="true" />
            CERRAR SESIÓN
          </Button>
        </CardContent>
      </Card>
    </template>

    <ConfirmDisableDialog
      :open="confirmDialog.isOpen.value"
      :module-name="moduleToDisable?.name ?? null"
      :saving="savingModules"
      @confirm="confirmDisable"
      @cancel="cancelDisable"
    />

    <BannerCropModal
      :open="bannerCropModalOpen"
      :image-file="selectedBannerFile"
      :aspect-ratio="16 / 9"
      @update:open="bannerCropModalOpen = $event"
      @crop="handleBannerCrop"
      @cancel="handleBannerCropCancel"
    />
  </div>
</template>
