import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useAnimeSearch } from '../../../app/composables/useAnimeSearch'

global.fetch = vi.fn()

describe('useAnimeSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('searchAnime', () => {
    it('should return empty array for empty query', async () => {
      const { searchAnime, searchResults } = useAnimeSearch()
      
      const results = await searchAnime('')
      
      expect(results).toEqual([])
      expect(searchResults.value).toEqual([])
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should fetch anime from Jikan API', async () => {
      const mockResponse = {
        data: [
          {
            mal_id: 1,
            title: 'Test Anime',
            title_english: 'Test Anime',
            title_japanese: null,
            images: { jpg: { image_url: '' }, webp: { image_url: '' } },
            synopsis: null,
            type: 'TV',
            episodes: 12,
            score: 8.5,
            scored_by: 1000,
            rank: 1,
            popularity: 1,
            members: 10000,
            favorites: 1000,
            year: 2024,
            status: 'Airing',
            genres: [],
            studios: [],
          },
        ],
        pagination: {
          last_visible_page: 1,
          has_next_page: false,
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const { searchAnime } = useAnimeSearch()
      const results = await searchAnime('test')

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Test Anime')
      expect(global.fetch).toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('API Error'))

      const { searchAnime } = useAnimeSearch()
      const results = await searchAnime('test')

      expect(results).toEqual([])
    })

    it('should cancel previous search when new search starts', async () => {
      vi.useRealTimers()
      const abortSpy = vi.fn()
      
      class MockAbortController {
        abort = abortSpy
        signal = { aborted: false } as AbortSignal
      }

      const originalAbortController = global.AbortController
      global.AbortController = MockAbortController as any

      vi.mocked(global.fetch).mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      )

      const { searchAnime } = useAnimeSearch()
      const promise1 = searchAnime('test1')
      await new Promise(resolve => setTimeout(resolve, 10))
      const promise2 = searchAnime('test2')
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(abortSpy).toHaveBeenCalled()
      
      global.AbortController = originalAbortController
      vi.useFakeTimers()
    })
  })

  describe('debouncedSearch', () => {
    it('should debounce search requests', async () => {
      const { debouncedSearch } = useAnimeSearch()
      
      debouncedSearch('t')
      debouncedSearch('te')
      debouncedSearch('test')

      expect(global.fetch).not.toHaveBeenCalled()

      vi.advanceTimersByTime(500)

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('loadMore', () => {
    it('should load next page of results', async () => {
      const mockResponse = {
        data: [],
        pagination: {
          last_visible_page: 2,
          has_next_page: true,
        },
      }

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response)

      const { searchAnime, loadMoreResults } = useAnimeSearch()
      await searchAnime('test')
      await loadMoreResults()

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('clearSearch', () => {
    it('should clear search results', async () => {
      const mockResponse = {
        data: [{ mal_id: 1, title: 'Test' }],
        pagination: { has_next_page: false },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const { searchAnime, searchResults, clearSearch } = useAnimeSearch()
      await searchAnime('test')
      
      expect(searchResults.value.length).toBeGreaterThan(0)
      
      clearSearch()
      
      expect(searchResults.value).toEqual([])
    })
  })
})

