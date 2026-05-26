<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Instagram, MapPin, MessageSquare, Twitter } from 'lucide-vue-next';
import type { AnimeEntry } from '@/composables/useAnime';
import type { MangaEntry } from '@/composables/useManga';

interface EditForm {
  username: string;
  display_name: string;
  bio: string;
  favorite_anime_id: string;
  favorite_manga_id: string;
  location: string;
  website: string;
  twitter: string;
  instagram: string;
  discord: string;
}

interface Props {
  form: EditForm;
  animeList: readonly AnimeEntry[];
  mangaList: readonly MangaEntry[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:form': [value: EditForm];
}>();

function updateField<K extends keyof EditForm>(field: K, value: EditForm[K] | number) {
  emit('update:form', { ...props.form, [field]: value as EditForm[K] });
}

const inputClass =
  'w-full rounded-none border-2 border-input bg-background px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:text-muted-foreground/50';

const selectClass =
  'w-full h-10 rounded-none border-2 border-input bg-background px-3 py-2 text-sm outline-none cursor-pointer transition-[border-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40';
</script>

<template>
  <div class="mt-6 space-y-6 p-5 bg-muted/20 border-2 border-primary/15 relative">
    <!-- HUD brackets -->
    <span
      class="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-primary/35"
      aria-hidden="true"
    />
    <span
      class="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-primary/35"
      aria-hidden="true"
    />
    <span
      class="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-primary/35"
      aria-hidden="true"
    />
    <span
      class="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-primary/35"
      aria-hidden="true"
    />

    <!-- ▸ DATOS -->
    <section class="space-y-4">
      <p
        class="font-pixel text-[9px] text-primary/80 uppercase tracking-wider flex items-center gap-1.5"
      >
        <span class="text-primary">▸</span> DATOS
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <Label
            for="username"
            class="font-pixel text-[8px] uppercase tracking-wider text-muted-foreground"
          >
            Nombre de usuario *
          </Label>
          <Input
            id="username"
            :model-value="form.username"
            placeholder="Tu nombre de usuario"
            :class="inputClass"
            class="rounded-none"
            @update:model-value="updateField('username', $event)"
          />
        </div>
        <div class="space-y-1.5">
          <Label
            for="displayName"
            class="font-pixel text-[8px] uppercase tracking-wider text-muted-foreground"
          >
            Nombre para mostrar
          </Label>
          <Input
            id="displayName"
            :model-value="form.display_name"
            placeholder="Tu nombre público"
            :class="inputClass"
            class="rounded-none"
            @update:model-value="updateField('display_name', $event)"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <Label
          for="bio"
          class="font-pixel text-[8px] uppercase tracking-wider text-muted-foreground"
        >
          Biografía
        </Label>
        <textarea
          id="bio"
          :value="form.bio"
          placeholder="Cuéntanos sobre ti..."
          class="w-full min-h-[120px] rounded-none border-2 border-input bg-background px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:text-muted-foreground/50 resize-none"
          @input="updateField('bio', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
    </section>

    <!-- ▸ FAVORITOS -->
    <section class="space-y-4">
      <p
        class="font-pixel text-[9px] text-accent/80 uppercase tracking-wider flex items-center gap-1.5"
      >
        <span class="text-accent">▸</span> FAVORITOS
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <Label
            for="favoriteAnime"
            class="font-pixel text-[8px] uppercase tracking-wider text-muted-foreground"
          >
            Anime favorito
          </Label>
          <select
            id="favoriteAnime"
            :value="form.favorite_anime_id"
            :class="selectClass"
            @change="updateField('favorite_anime_id', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Ninguno</option>
            <option v-for="anime in animeList" :key="anime.id" :value="anime.id">
              {{ anime.title }}
            </option>
          </select>
        </div>
        <div class="space-y-1.5">
          <Label
            for="favoriteManga"
            class="font-pixel text-[8px] uppercase tracking-wider text-muted-foreground"
          >
            Manga favorito
          </Label>
          <select
            id="favoriteManga"
            :value="form.favorite_manga_id"
            :class="selectClass"
            @change="updateField('favorite_manga_id', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Ninguno</option>
            <option v-for="manga in mangaList" :key="manga.id" :value="manga.id">
              {{ manga.title }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <!-- ▸ CONTACTO -->
    <section class="space-y-4">
      <p
        class="font-pixel text-[9px] text-secondary/80 uppercase tracking-wider flex items-center gap-1.5"
      >
        <span class="text-secondary">▸</span> CONTACTO
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <Label
            for="location"
            class="font-pixel text-[8px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
          >
            <MapPin class="h-3 w-3 text-primary" aria-hidden="true" />
            Ubicación
          </Label>
          <Input
            id="location"
            :model-value="form.location"
            placeholder="Tu ciudad o país"
            :class="inputClass"
            class="rounded-none"
            @update:model-value="updateField('location', $event)"
          />
        </div>
        <div class="space-y-1.5">
          <Label
            for="website"
            class="font-pixel text-[8px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
          >
            <Globe class="h-3 w-3 text-primary" aria-hidden="true" />
            Sitio web
          </Label>
          <Input
            id="website"
            :model-value="form.website"
            placeholder="https://..."
            type="url"
            :class="inputClass"
            class="rounded-none"
            @update:model-value="updateField('website', $event)"
          />
        </div>
      </div>
    </section>

    <!-- ▸ REDES SOCIALES -->
    <section class="space-y-4">
      <p
        class="font-pixel text-[9px] text-primary/80 uppercase tracking-wider flex items-center gap-1.5"
      >
        <span class="text-primary">▸</span> REDES SOCIALES
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-1.5">
          <Label
            for="twitter"
            class="font-pixel text-[8px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
          >
            <Twitter class="h-3 w-3 text-primary" aria-hidden="true" />
            Twitter / X
          </Label>
          <Input
            id="twitter"
            :model-value="form.twitter"
            placeholder="@usuario"
            :class="inputClass"
            class="rounded-none"
            @update:model-value="updateField('twitter', $event)"
          />
        </div>
        <div class="space-y-1.5">
          <Label
            for="instagram"
            class="font-pixel text-[8px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
          >
            <Instagram class="h-3 w-3 text-secondary" aria-hidden="true" />
            Instagram
          </Label>
          <Input
            id="instagram"
            :model-value="form.instagram"
            placeholder="@usuario"
            :class="inputClass"
            class="rounded-none"
            @update:model-value="updateField('instagram', $event)"
          />
        </div>
        <div class="space-y-1.5">
          <Label
            for="discord"
            class="font-pixel text-[8px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
          >
            <MessageSquare class="h-3 w-3 text-accent" aria-hidden="true" />
            Discord
          </Label>
          <Input
            id="discord"
            :model-value="form.discord"
            placeholder="usuario#1234"
            :class="inputClass"
            class="rounded-none"
            @update:model-value="updateField('discord', $event)"
          />
        </div>
      </div>
    </section>
  </div>
</template>
