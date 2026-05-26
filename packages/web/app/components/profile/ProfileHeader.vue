<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit2, Save, Trash2, Upload, X } from 'lucide-vue-next';
import type { UserProfile } from '@/composables/useProfile';
import { useAuthStore } from '~~/stores/auth';

interface Props {
  profile: UserProfile;
  editing: boolean;
  avatarPreview: string | null;
  uploadingAvatar: boolean;
  saving: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  startEditing: [];
  cancelEditing: [];
  saveProfile: [];
  triggerAvatarUpload: [];
  deleteAvatar: [];
  avatarUpload: [event: Event];
}>();

const authStore = useAuthStore();

const avatarFileInput = ref<HTMLInputElement | null>(null);

/** Effective avatar: profile upload > Clerk OAuth photo > null (shows initial fallback) */
const effectiveAvatarUrl = computed(
  () => props.avatarPreview || props.profile.avatarUrl || authStore.userImageUrl || null,
);

/** Effective display name: profile field > Clerk full name > username */
const effectiveDisplayName = computed(
  () => props.profile.displayName || authStore.userFullName || props.profile.username,
);

function _triggerUpload() {
  avatarFileInput.value?.click();
}

onMounted(() => {
  if (props.editing) {
    // Expose trigger function to parent
  }
});
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6">
    <!-- Avatar with blocky arcade frame -->
    <div class="relative group shrink-0">
      <!-- Neon glow ring (motion-safe hover) -->
      <div
        class="absolute -inset-1 bg-linear-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-70 motion-safe:transition-opacity motion-safe:duration-300"
        aria-hidden="true"
      />
      <Avatar
        class="relative h-28 w-28 rounded-none ring-2 ring-primary/40 border-2 border-primary/30 shadow-[0_0_18px_-6px_var(--color-primary)]"
      >
        <AvatarImage
          v-if="effectiveAvatarUrl"
          :src="effectiveAvatarUrl"
          :alt="effectiveDisplayName ?? profile.username"
          class="object-cover rounded-none"
        />
        <AvatarFallback
          class="rounded-none bg-linear-to-br from-primary to-accent text-4xl text-white font-bold font-pixel"
        >
          {{ profile.username?.charAt(0)?.toUpperCase() ?? '?' }}
        </AvatarFallback>
      </Avatar>
      <!-- Edit overlay -->
      <div
        v-if="editing"
        class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-200 backdrop-blur-sm"
      >
        <div class="flex gap-2">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                size="icon"
                variant="secondary"
                class="h-9 w-9 rounded-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
                :disabled="uploadingAvatar"
                @click="emit('triggerAvatarUpload')"
              >
                <Upload class="h-4 w-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Subir avatar</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                v-if="avatarPreview || profile.avatarUrl"
                size="icon"
                variant="destructive"
                class="h-9 w-9 rounded-none cursor-pointer focus-visible:ring-2 focus-visible:ring-destructive"
                :disabled="uploadingAvatar"
                @click="emit('deleteAvatar')"
              >
                <Trash2 class="h-4 w-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminar avatar</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <input
        ref="avatarFileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="emit('avatarUpload', $event)"
      />
    </div>

    <!-- Name & handle -->
    <div class="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
      <div>
        <h2 class="text-3xl font-bold [text-shadow:_0_0_20px_var(--color-primary)/0.4] truncate">
          {{ effectiveDisplayName }}
        </h2>
        <p class="font-pixel text-[9px] text-muted-foreground uppercase tracking-wider mt-1">
          @{{ profile.username }}
        </p>
      </div>
      <div v-if="profile.bio && !editing" class="max-w-2xl">
        <p class="text-sm text-muted-foreground leading-relaxed">{{ profile.bio }}</p>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex gap-2 shrink-0">
      <Button
        v-if="!editing"
        variant="outline"
        size="sm"
        class="btn-game gap-2 rounded-none font-pixel text-[9px] uppercase cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
        @click="emit('startEditing')"
      >
        <Edit2 class="h-4 w-4" aria-hidden="true" />
        EDITAR
      </Button>
      <template v-else>
        <Button
          variant="ghost"
          size="sm"
          :disabled="saving"
          class="rounded-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          @click="emit('cancelEditing')"
        >
          <X class="h-4 w-4" aria-hidden="true" />
          <span class="sr-only">Cancelar edición</span>
        </Button>
        <Button
          size="sm"
          :disabled="saving"
          class="btn-game gap-2 rounded-none font-pixel text-[9px] uppercase cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
          @click="emit('saveProfile')"
        >
          <Save class="h-4 w-4" aria-hidden="true" />
          {{ saving ? 'GUARDANDO...' : 'GUARDAR' }}
        </Button>
      </template>
    </div>
  </div>
</template>
