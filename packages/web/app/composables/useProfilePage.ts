import type { AnimeEntry } from '@/composables/useAnime';
import type { MangaEntry } from '@/composables/useManga';
import type { UserProfile } from '@/composables/useProfile';
import type { ModuleId } from '~~/domain/types';
import { nextTick } from 'vue';
import { useAuthStore } from '~~/stores/auth';
import { useModulesStore } from '~~/stores/modules';

export function useProfilePage() {
  const profileApi = useProfile();
  const auth = useAuth();
  const authStore = useAuthStore();
  const modulesStore = useModulesStore();
  const userModulesApi = useUserModules();
  const animeApi = useAnime();
  const mangaApi = useManga();
  const toast = useToast();
  const confirmDialog = useModal();

  const {
    data: profile,
    loading,
    reload: reloadProfile,
  } = usePageData({
    fetcher: () => profileApi.fetchProfile(),
  });

  const animeList = ref<AnimeEntry[]>([]);
  const mangaList = ref<MangaEntry[]>([]);

  const saving = ref(false);
  const savingModules = ref(false);
  const modulesSaved = ref(false);
  const uploadingAvatar = ref(false);
  const editing = ref(false);
  const moduleToDisable = ref<{ id: ModuleId; name: string } | null>(null);

  const editForm = ref({
    username: '',
    display_name: '',
    bio: '',
    favorite_anime_id: '',
    favorite_manga_id: '',
    location: '',
    website: '',
    twitter: '',
    instagram: '',
    discord: '',
  });

  const avatarFileInput = ref<HTMLInputElement | null>(null);
  const avatarPreview = ref<string | null>(null);
  const bannerFileInput = ref<HTMLInputElement | null>(null);
  const bannerPreview = ref<string | null>(null);
  const uploadingBanner = ref(false);

  const expProgress = computed(() => {
    if (!profile.value) return { current: 0, needed: 100, progress: 0 };
    return profileApi.expForNextLevel(profile.value.totalExp);
  });

  const favoriteAnime = computed(() => {
    if (!profile.value?.favoriteAnimeId) return null;
    return animeList.value.find((a) => a.id === profile.value!.favoriteAnimeId) || null;
  });

  const favoriteManga = computed(() => {
    if (!profile.value?.favoriteMangaId) return null;
    return mangaList.value.find((m) => m.id === profile.value!.favoriteMangaId) || null;
  });

  const modules = computed(() => {
    // Access moduleMap directly to ensure reactivity
    const moduleMap = modulesStore.moduleMap;
    return modulesStore.modules.map((m) => ({
      ...m,
      enabled: moduleMap[m.id] ?? false,
    }));
  });

  async function loadAnimeAndManga() {
    try {
      const [anime, manga] = await Promise.all([
        animeApi.fetchAnimeList(),
        mangaApi.fetchCollection(),
      ]);
      animeList.value = anime;
      mangaList.value = manga;
    } catch (error) {
      console.error('Error loading anime/manga:', error);
    }
  }

  async function loadModules() {
    if (!authStore.isAuthenticated) {
      return;
    }

    try {
      const modules = await userModulesApi.fetchUserModules();

      if (modules.length > 0) {
        modulesStore.setModulesFromDb(modules);
      } else {
        modulesStore.synced = true;
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      modulesStore.synced = true;
    }
  }

  function startEditing() {
    editing.value = true;
    if (profile.value) {
      editForm.value = {
        username: profile.value.username ?? '',
        display_name: profile.value.displayName ?? '',
        bio: profile.value.bio ?? '',
        favorite_anime_id: profile.value.favoriteAnimeId ?? '',
        favorite_manga_id: profile.value.favoriteMangaId ?? '',
        location: profile.value.location ?? '',
        website: profile.value.website ?? '',
        twitter: profile.value.socialLinks?.twitter ?? '',
        instagram: profile.value.socialLinks?.instagram ?? '',
        discord: profile.value.socialLinks?.discord ?? '',
      };
      avatarPreview.value = profile.value.avatarUrl;
    }
  }

  function cancelEditing() {
    editing.value = false;
    if (profile.value) {
      editForm.value = {
        username: profile.value.username ?? '',
        display_name: profile.value.displayName ?? '',
        bio: profile.value.bio ?? '',
        favorite_anime_id: profile.value.favoriteAnimeId ?? '',
        favorite_manga_id: profile.value.favoriteMangaId ?? '',
        location: profile.value.location ?? '',
        website: profile.value.website ?? '',
        twitter: profile.value.socialLinks?.twitter ?? '',
        instagram: profile.value.socialLinks?.instagram ?? '',
        discord: profile.value.socialLinks?.discord ?? '',
      };
      avatarPreview.value = profile.value.avatarUrl;
    }
  }

  async function saveProfile() {
    if (!editForm.value.username.trim()) {
      toast.error('El nombre de usuario es obligatorio');
      return;
    }

    saving.value = true;
    try {
      const socialLinks: Record<string, string> = {};
      if (editForm.value.twitter) socialLinks.twitter = editForm.value.twitter;
      if (editForm.value.instagram) socialLinks.instagram = editForm.value.instagram;
      if (editForm.value.discord) socialLinks.discord = editForm.value.discord;

      const success = await profileApi.updateProfile({
        username: editForm.value.username,
        display_name: editForm.value.display_name || undefined,
        bio: editForm.value.bio || undefined,
        favorite_anime_id: editForm.value.favorite_anime_id || null,
        favorite_manga_id: editForm.value.favorite_manga_id || null,
        location: editForm.value.location || undefined,
        website: editForm.value.website || undefined,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      });

      if (success) {
        await reloadProfile();
        if (profile.value) {
          editForm.value = {
            username: profile.value.username ?? '',
            display_name: profile.value.displayName ?? '',
            bio: profile.value.bio ?? '',
            favorite_anime_id: profile.value.favoriteAnimeId ?? '',
            favorite_manga_id: profile.value.favoriteMangaId ?? '',
            location: profile.value.location ?? '',
            website: profile.value.website ?? '',
            twitter: profile.value.socialLinks?.twitter ?? '',
            instagram: profile.value.socialLinks?.instagram ?? '',
            discord: profile.value.socialLinks?.discord ?? '',
          };
          avatarPreview.value = profile.value.avatarUrl;
        }
        editing.value = false;
        toast.success('Perfil actualizado correctamente');
      } else {
        toast.error('Error al actualizar el perfil');
      }
    } finally {
      saving.value = false;
    }
  }

  async function handleAvatarUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede ser mayor a 5MB');
      return;
    }

    uploadingAvatar.value = true;
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarPreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      const avatarUrl = await profileApi.uploadAvatar(file);
      if (avatarUrl) {
        await reloadProfile();
        toast.success('Avatar actualizado correctamente');
      } else {
        toast.error('Error al subir el avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error al subir el avatar');
    } finally {
      uploadingAvatar.value = false;
      if (avatarFileInput.value) {
        avatarFileInput.value.value = '';
      }
    }
  }

  async function handleDeleteAvatar() {
    if (!confirm('¿Estás seguro de que quieres eliminar tu avatar?')) return;

    uploadingAvatar.value = true;
    try {
      const success = await profileApi.deleteAvatar();
      if (success) {
        avatarPreview.value = null;
        await reloadProfile();
        toast.success('Avatar eliminado correctamente');
      } else {
        toast.error('Error al eliminar el avatar');
      }
    } finally {
      uploadingAvatar.value = false;
    }
  }

  function triggerAvatarUpload() {
    avatarFileInput.value?.click();
  }

  function triggerBannerUpload() {
    if (bannerFileInput.value) {
      bannerFileInput.value.click();
    } else {
      console.error('bannerFileInput is not available - input may not be mounted');
    }
  }

  async function handleBannerUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede ser mayor a 5MB');
      return;
    }

    uploadingBanner.value = true;
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        bannerPreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      const bannerUrl = await profileApi.uploadBanner(file);
      if (bannerUrl) {
        await reloadProfile();
        toast.success('Banner actualizado correctamente');
      } else {
        toast.error('Error al subir el banner');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Error al subir el banner');
    } finally {
      uploadingBanner.value = false;
      if (bannerFileInput.value) {
        bannerFileInput.value.value = '';
      }
    }
  }

  async function handleDeleteBanner() {
    if (!confirm('¿Estás seguro de que quieres eliminar tu banner?')) return;

    uploadingBanner.value = true;
    try {
      const success = await profileApi.deleteBanner();
      if (success) {
        bannerPreview.value = null;
        await reloadProfile();
        toast.success('Banner eliminado correctamente');
      } else {
        toast.error('Error al eliminar el banner');
      }
    } finally {
      uploadingBanner.value = false;
    }
  }

  async function handleLogout() {
    await auth.signOut();
  }

  async function handleToggleModule(moduleId: ModuleId) {
    const module = modulesStore.modules.find((m) => m.id === moduleId);
    if (!module) return;

    if (module.enabled) {
      moduleToDisable.value = { id: moduleId, name: module.name };
      confirmDialog.open();
    } else {
      modulesStore.toggleModule(moduleId);
      await syncModules();
    }
  }

  async function confirmDisable() {
    if (!moduleToDisable.value) return;

    modulesStore.toggleModule(moduleToDisable.value.id);
    await syncModules();
    confirmDialog.close();
    moduleToDisable.value = null;
  }

  function cancelDisable() {
    confirmDialog.close();
    moduleToDisable.value = null;
  }

  async function handleDisableAll() {
    modulesStore.disableAllModules();
    await syncModules();
  }

  async function syncModules() {
    if (!authStore.isAuthenticated) return;

    savingModules.value = true;
    modulesSaved.value = false;

    try {
      const modules = modulesStore.modules.map((module) => ({
        module_id: module.id,
        enabled: modulesStore.moduleMap[module.id] ?? false,
      }));
      const savedModules = await userModulesApi.saveUserModules(modules);
      if (savedModules.length > 0) {
        modulesStore.setModulesFromDb(savedModules);
      } else {
        modulesStore.synced = true;
      }
      modulesSaved.value = true;
      setTimeout(() => {
        modulesSaved.value = false;
      }, 2000);
      toast.success('Módulos actualizados');
    } catch (error) {
      toast.error('Error al guardar módulos');
    } finally {
      savingModules.value = false;
    }
  }

  async function initialize() {
    await Promise.all([loadAnimeAndManga(), loadModules()]);
    // Force reactivity update after loading modules
    await nextTick();
  }

  return {
    profile: computed(() => profile.value),
    loading,
    saving: readonly(saving),
    savingModules: readonly(savingModules),
    modulesSaved: readonly(modulesSaved),
    uploadingAvatar: readonly(uploadingAvatar),
    uploadingBanner,
    editing,
    confirmDialog,
    moduleToDisable: readonly(moduleToDisable),
    editForm,
    avatarFileInput,
    avatarPreview,
    bannerPreview,
    expProgress,
    favoriteAnime,
    favoriteManga,
    modules,
    animeList: computed(() => animeList.value),
    mangaList: computed(() => mangaList.value),
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
  };
}
