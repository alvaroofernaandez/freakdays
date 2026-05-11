<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Globe, Instagram, Link2, MapPin, MessageSquare, Twitter } from 'lucide-vue-next'
import type { AnimeEntry } from '@/composables/useAnime'
import type { MangaEntry } from '@/composables/useManga'

interface EditForm {
  username: string
  display_name: string
  bio: string
  favorite_anime_id: string
  favorite_manga_id: string
  location: string
  website: string
  twitter: string
  instagram: string
  discord: string
}

interface Props {
  form: EditForm
  animeList: readonly AnimeEntry[]
  mangaList: readonly MangaEntry[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:form': [value: EditForm]
}>()

function updateField<K extends keyof EditForm>(field: K, value: EditForm[K]) {
  emit('update:form', { ...props.form, [field]: value })
}
</script>

<template>
  <div class="mt-6 space-y-6 p-6 bg-muted/30 rounded-xl border border-primary/10">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="username">Nombre de usuario *</Label>
        <Input
          id="username"
          :model-value="form.username"
          @update:model-value="updateField('username', $event)"
          placeholder="Tu nombre de usuario"
          class="w-full"
        />
      </div>
      <div class="space-y-2">
        <Label for="displayName">Nombre para mostrar</Label>
        <Input
          id="displayName"
          :model-value="form.display_name"
          @update:model-value="updateField('display_name', $event)"
          placeholder="Tu nombre público"
          class="w-full"
        />
      </div>
    </div>

    <div class="space-y-2">
      <Label for="bio">Biografía</Label>
      <textarea
        id="bio"
        :model-value="form.bio"
        @input="updateField('bio', ($event.target as HTMLTextAreaElement).value)"
        placeholder="Cuéntanos sobre ti..."
        class="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="favoriteAnime">Anime Favorito</Label>
        <select
          id="favoriteAnime"
          :model-value="form.favorite_anime_id"
          @change="updateField('favorite_anime_id', ($event.target as HTMLSelectElement).value)"
          class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <option value="">Ninguno</option>
          <option v-for="anime in animeList" :key="anime.id" :value="anime.id">
            {{ anime.title }}
          </option>
        </select>
      </div>
      <div class="space-y-2">
        <Label for="favoriteManga">Manga Favorito</Label>
        <select
          id="favoriteManga"
          :model-value="form.favorite_manga_id"
          @change="updateField('favorite_manga_id', ($event.target as HTMLSelectElement).value)"
          class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <option value="">Ninguno</option>
          <option v-for="manga in mangaList" :key="manga.id" :value="manga.id">
            {{ manga.title }}
          </option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="location" class="flex items-center gap-2">
          <MapPin class="h-4 w-4 text-primary" />
          Ubicación
        </Label>
        <Input
          id="location"
          :model-value="form.location"
          @update:model-value="updateField('location', $event)"
          placeholder="Tu ciudad o país"
          class="w-full"
        />
      </div>
      <div class="space-y-2">
        <Label for="website" class="flex items-center gap-2">
          <Globe class="h-4 w-4 text-primary" />
          Sitio web
        </Label>
        <Input
          id="website"
          :model-value="form.website"
          @update:model-value="updateField('website', $event)"
          placeholder="https://..."
          type="url"
          class="w-full"
        />
      </div>
    </div>

    <div class="space-y-3">
      <Label class="text-base font-semibold">Redes sociales</Label>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-2">
          <Label for="twitter" class="flex items-center gap-2 text-sm">
            <Twitter class="h-4 w-4 text-primary" />
            Twitter/X
          </Label>
          <Input
            id="twitter"
            :model-value="form.twitter"
            @update:model-value="updateField('twitter', $event)"
            placeholder="@usuario"
            class="w-full"
          />
        </div>
        <div class="space-y-2">
          <Label for="instagram" class="flex items-center gap-2 text-sm">
            <Instagram class="h-4 w-4 text-primary" />
            Instagram
          </Label>
          <Input
            id="instagram"
            :model-value="form.instagram"
            @update:model-value="updateField('instagram', $event)"
            placeholder="@usuario"
            class="w-full"
          />
        </div>
        <div class="space-y-2">
          <Label for="discord" class="flex items-center gap-2 text-sm">
            <MessageSquare class="h-4 w-4 text-primary" />
            Discord
          </Label>
          <Input
            id="discord"
            :model-value="form.discord"
            @update:model-value="updateField('discord', $event)"
            placeholder="Usuario#1234"
            class="w-full"
          />
        </div>
      </div>
    </div>
  </div>
</template>

