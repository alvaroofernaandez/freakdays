<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Globe, Image as ImageIcon, Instagram, Link2, MapPin, MessageSquare, Twitter } from 'lucide-vue-next'
import type { AnimeEntry } from '@/composables/useAnime'
import type { MangaEntry } from '@/composables/useManga'
import type { UserProfile } from '@/composables/useProfile'

interface Props {
  profile: UserProfile
  favoriteAnime: AnimeEntry | null
  favoriteManga: MangaEntry | null
}

const props = defineProps<Props>()
</script>

<template>
  <div
    v-if="favoriteAnime || favoriteManga || profile.location || profile.website || Object.keys(profile.socialLinks || {}).length > 0"
    class="grid grid-cols-1 md:grid-cols-2 gap-4"
  >
    <Card
      v-if="favoriteAnime"
      class="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-transparent hover:border-primary/40 transition-colors"
    >
      <div class="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
      <CardContent class="relative p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <ImageIcon class="h-6 w-6 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-muted-foreground mb-1">Anime Favorito</p>
            <p class="text-sm font-semibold truncate">{{ favoriteAnime.title }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card
      v-if="favoriteManga"
      class="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-transparent hover:border-primary/40 transition-colors"
    >
      <div class="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
      <CardContent class="relative p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <ImageIcon class="h-6 w-6 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-muted-foreground mb-1">Manga Favorito</p>
            <p class="text-sm font-semibold truncate">{{ favoriteManga.title }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card
      v-if="profile.location"
      class="relative overflow-hidden border-accent/20 bg-linear-to-br from-accent/5 to-transparent hover:border-accent/40 transition-colors"
    >
      <div class="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
      <CardContent class="relative p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
            <MapPin class="h-6 w-6 text-accent" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-muted-foreground mb-1">Ubicación</p>
            <p class="text-sm font-semibold truncate">{{ profile.location }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card
      v-if="profile.website"
      class="relative overflow-hidden border-accent/20 bg-linear-to-br from-accent/5 to-transparent hover:border-accent/40 transition-colors"
    >
      <div class="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
      <CardContent class="relative p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
            <Globe class="h-6 w-6 text-accent" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-muted-foreground mb-1">Sitio web</p>
            <a
              :href="profile.website"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm font-semibold text-accent hover:underline truncate flex items-center gap-1"
            >
              {{ profile.website }}
              <Link2 class="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card
      v-if="profile.socialLinks?.twitter"
      class="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-transparent hover:border-primary/40 transition-colors"
    >
      <div class="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
      <CardContent class="relative p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Twitter class="h-6 w-6 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-muted-foreground mb-1">Twitter/X</p>
            <p class="text-sm font-semibold truncate">{{ profile.socialLinks.twitter }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card
      v-if="profile.socialLinks?.instagram"
      class="relative overflow-hidden border-secondary/20 bg-linear-to-br from-secondary/5 to-transparent hover:border-secondary/40 transition-colors"
    >
      <div class="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />
      <CardContent class="relative p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
            <Instagram class="h-6 w-6 text-secondary" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-muted-foreground mb-1">Instagram</p>
            <p class="text-sm font-semibold truncate">{{ profile.socialLinks.instagram }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card
      v-if="profile.socialLinks?.discord"
      class="relative overflow-hidden border-accent/20 bg-linear-to-br from-accent/5 to-transparent hover:border-accent/40 transition-colors"
    >
      <div class="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
      <CardContent class="relative p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
            <MessageSquare class="h-6 w-6 text-accent" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-muted-foreground mb-1">Discord</p>
            <p class="text-sm font-semibold truncate">{{ profile.socialLinks.discord }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

