<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Edit2, Save, Trash2, Upload, User, X } from 'lucide-vue-next'
import type { UserProfile } from '@/composables/useProfile'

interface Props {
  profile: UserProfile
  editing: boolean
  avatarPreview: string | null
  uploadingAvatar: boolean
  saving: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  startEditing: []
  cancelEditing: []
  saveProfile: []
  triggerAvatarUpload: []
  deleteAvatar: []
  avatarUpload: [event: Event]
}>()

const avatarFileInput = ref<HTMLInputElement | null>(null)

function triggerUpload() {
  avatarFileInput.value?.click()
}

onMounted(() => {
  if (props.editing) {
    // Expose trigger function to parent
  }
})
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6">
    <div class="relative group">
      <div
        class="absolute -inset-1 bg-linear-to-r from-primary via-accent to-primary rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity"
      />
      <Avatar class="relative h-28 w-28 border-4 border-background shadow-2xl ring-2 ring-primary/20">
        <AvatarImage
          v-if="avatarPreview || profile.avatarUrl"
          :src="avatarPreview || profile.avatarUrl"
          :alt="profile.displayName || profile.username"
          class="object-cover"
        />
        <AvatarFallback class="bg-linear-to-br from-primary to-accent text-4xl text-white font-bold">
          {{ profile.username?.charAt(0)?.toUpperCase() ?? '?' }}
        </AvatarFallback>
      </Avatar>
      <div
        v-if="editing"
        class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
      >
        <div class="flex gap-2">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button size="icon" variant="secondary" class="h-10 w-10" @click="emit('triggerAvatarUpload')"
                :disabled="uploadingAvatar">
                <Upload class="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Subir avatar</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                v-if="avatarPreview"
                size="icon"
                variant="destructive"
                class="h-10 w-10"
                @click="emit('deleteAvatar')"
                :disabled="uploadingAvatar"
              >
                <Trash2 class="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminar avatar</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <input ref="avatarFileInput" type="file" accept="image/*" class="hidden" @change="emit('avatarUpload', $event)" />
    </div>

    <div class="flex-1 text-center sm:text-left space-y-2 min-w-0">
      <div>
        <h2 class="text-3xl font-bold">{{ profile.displayName || profile.username }}</h2>
        <p class="text-muted-foreground text-lg">@{{ profile.username }}</p>
      </div>
      <div v-if="profile.bio && !editing" class="max-w-2xl">
        <p class="text-sm text-muted-foreground leading-relaxed">{{ profile.bio }}</p>
      </div>
    </div>

    <div class="flex gap-2">
      <Button v-if="!editing" variant="outline" size="sm" @click="emit('startEditing')" class="gap-2">
        <Edit2 class="h-4 w-4" />
        Editar
      </Button>
      <template v-else>
        <Button variant="ghost" size="sm" @click="emit('cancelEditing')" :disabled="saving">
          <X class="h-4 w-4" />
        </Button>
        <Button size="sm" @click="emit('saveProfile')" :disabled="saving" class="gap-2">
          <Save class="h-4 w-4" />
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </Button>
      </template>
    </div>
  </div>
</template>

