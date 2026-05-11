export interface AnimeSearchResult {
  mal_id: number
  title: string
  title_english: string | null
  title_japanese: string | null
  images: {
    jpg: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
    webp: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
  }
  synopsis: string | null
  type: string
  episodes: number | null
  score: number | null
  scored_by: number | null
  rank: number | null
  popularity: number | null
  members: number | null
  favorites: number | null
  year: number | null
  status: string
  genres: Array<{ mal_id: number; type: string; name: string; url: string }>
  studios: Array<{ mal_id: number; type: string; name: string; url: string }>
}

export interface AnimeSearchResponse {
  data: AnimeSearchResult[]
  pagination: {
    last_visible_page: number
    has_next_page: boolean
  }
}

const JIKAN_API_BASE = 'https://api.jikan.moe/v4'
const DEBOUNCE_DELAY = 500

export function useAnimeSearch() {
  const searching = ref(false)
  const searchResults = ref<AnimeSearchResult[]>([])
  const searchQuery = ref('')
  const currentPage = ref(1)
  const hasMorePages = ref(false)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let abortController: AbortController | null = null

  async function searchAnime(query: string, page = 1): Promise<AnimeSearchResult[]> {
    if (!query.trim()) {
      searchResults.value = []
      currentPage.value = 1
      hasMorePages.value = false
      searching.value = false
      return []
    }

    // Cancelar búsqueda anterior si existe
    if (abortController) {
      abortController.abort()
    }

    // Crear nuevo abort controller para esta búsqueda
    const currentAbortController = new AbortController()
    abortController = currentAbortController
    
    searching.value = true
    searchQuery.value = query
    currentPage.value = page

    try {
      const response = await fetch(
        `${JIKAN_API_BASE}/anime?q=${encodeURIComponent(query)}&limit=20&page=${page}`,
        { signal: currentAbortController.signal }
      )

      // Verificar si esta búsqueda fue cancelada
      if (abortController !== currentAbortController || currentAbortController.signal.aborted) {
        return []
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AnimeSearchResponse = await response.json()
      
      // Verificar nuevamente si fue cancelada antes de actualizar resultados
      if (abortController !== currentAbortController || currentAbortController.signal.aborted) {
        return []
      }
      
      if (page === 1) {
        searchResults.value = data.data
      } else {
        searchResults.value.push(...data.data)
      }

      hasMorePages.value = data.pagination.has_next_page
      
      return data.data
    } catch (error: any) {
      // Ignorar errores de cancelación
      if (error.name === 'AbortError' || currentAbortController.signal.aborted) {
        return []
      }
      
      // Solo mostrar error si esta búsqueda no fue cancelada
      if (abortController === currentAbortController && !currentAbortController.signal.aborted) {
        console.error('Error searching anime:', error)
        searchResults.value = []
      }
      
      return []
    } finally {
      // Solo actualizar el estado si esta búsqueda sigue siendo la actual
      if (abortController === currentAbortController && !currentAbortController.signal.aborted) {
        searching.value = false
      }
      // Limpiar abortController solo si es el actual
      if (abortController === currentAbortController) {
        abortController = null
      }
    }
  }

  function debouncedSearch(query: string) {
    // Limpiar timer anterior
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    if (!query || !query.trim()) {
      // Cancelar búsqueda en curso
      if (abortController) {
        abortController.abort()
        abortController = null
      }
      searchResults.value = []
      searchQuery.value = ''
      currentPage.value = 1
      hasMorePages.value = false
      searching.value = false
      return
    }

    const trimmedQuery = query.trim()
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      searchAnime(trimmedQuery, 1)
    }, DEBOUNCE_DELAY)
  }

  async function loadMoreResults() {
    if (!hasMorePages.value || searching.value) return
    
    const nextPage = currentPage.value + 1
    await searchAnime(searchQuery.value, nextPage)
  }

  function clearSearch() {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    searchQuery.value = ''
    searchResults.value = []
    currentPage.value = 1
    hasMorePages.value = false
    searching.value = false
  }

  async function getAnimeDetails(malId: number): Promise<AnimeSearchResult | null> {
    try {
      const response = await fetch(`${JIKAN_API_BASE}/anime/${malId}/full`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error fetching anime details:', error)
      return null
    }
  }

  return {
    searching: readonly(searching),
    searchResults: readonly(searchResults),
    searchQuery: readonly(searchQuery),
    hasMorePages: readonly(hasMorePages),
    searchAnime,
    debouncedSearch,
    loadMoreResults,
    clearSearch,
    getAnimeDetails,
  }
}

