import type { AnimeSearchResult } from '@/composables/useAnimeSearch'
import type { CreateAnimeDTO } from '@/composables/useAnime'

export function parseJikanAnimeToDTO(anime: AnimeSearchResult, status: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch' = 'plan_to_watch'): CreateAnimeDTO {
  const coverUrl = anime.images?.jpg?.large_image_url || 
                  anime.images?.jpg?.image_url ||
                  anime.images?.webp?.large_image_url ||
                  null

  const title = anime.title_english || anime.title || ''
  
  const score = anime.score 
    ? Math.max(1, Math.min(10, Math.round(anime.score))) 
    : undefined

  const notesParts: string[] = []
  
  if (anime.synopsis) {
    const synopsis = anime.synopsis.replace(/\n\n/g, '\n').trim()
    notesParts.push(`Sinopsis:\n${synopsis}`)
  }
  
  if (anime.title_japanese && anime.title_japanese !== anime.title && anime.title_japanese !== anime.title_english) {
    notesParts.push(`Título japonés: ${anime.title_japanese}`)
  }
  
  if (anime.genres && anime.genres.length > 0) {
    const genres = anime.genres.map(g => g.name).join(', ')
    notesParts.push(`Géneros: ${genres}`)
  }
  
  if (anime.studios && anime.studios.length > 0) {
    const studios = anime.studios.map(s => s.name).join(', ')
    notesParts.push(`Estudios: ${studios}`)
  }
  
  const metadataParts: string[] = []
  
  if (anime.type) {
    metadataParts.push(`Tipo: ${anime.type}`)
  }
  
  if (anime.year) {
    metadataParts.push(`Año: ${anime.year}`)
  }
  
  if (anime.status) {
    metadataParts.push(`Estado: ${anime.status}`)
  }
  
  if (anime.rank) {
    metadataParts.push(`Ranking: #${anime.rank}`)
  }
  
  if (anime.popularity) {
    metadataParts.push(`Popularidad: #${anime.popularity}`)
  }
  
  if (anime.members) {
    const membersFormatted = anime.members >= 1000000 
      ? `${(anime.members / 1000000).toFixed(1)}M`
      : anime.members >= 1000
      ? `${(anime.members / 1000).toFixed(1)}K`
      : anime.members.toString()
    metadataParts.push(`Miembros: ${membersFormatted}`)
  }
  
  if (anime.favorites) {
    const favoritesFormatted = anime.favorites >= 1000000 
      ? `${(anime.favorites / 1000000).toFixed(1)}M`
      : anime.favorites >= 1000
      ? `${(anime.favorites / 1000).toFixed(1)}K`
      : anime.favorites.toString()
    metadataParts.push(`Favoritos: ${favoritesFormatted}`)
  }
  
  if (metadataParts.length > 0) {
    notesParts.push(`\nInformación:\n${metadataParts.join(' • ')}`)
  }
  
  if (anime.mal_id) {
    notesParts.push(`\nMyAnimeList ID: ${anime.mal_id}`)
  }

  const notes = notesParts.length > 0 ? notesParts.join('\n\n') : undefined

  return {
    title,
    status,
    total_episodes: anime.episodes || undefined,
    score,
    cover_url: coverUrl || undefined,
    notes,
  }
}

