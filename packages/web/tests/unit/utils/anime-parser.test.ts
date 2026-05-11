import { describe, it, expect } from "vitest";
import { parseJikanAnimeToDTO } from "../../../app/utils/anime-parser";
import type { AnimeSearchResult } from "../../../app/composables/useAnimeSearch";

describe("anime-parser", () => {
  describe("parseJikanAnimeToDTO", () => {
    it("should parse basic anime data", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test Anime",
        title_english: "Test Anime English",
        images: {
          jpg: {
            image_url: "https://example.com/image.jpg",
            large_image_url: "https://example.com/large.jpg",
          },
        },
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.title).toBe("Test Anime English");
      expect(result.status).toBe("plan_to_watch");
      expect(result.cover_url).toBe("https://example.com/large.jpg");
    });

    it("should use title_english over title", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test Anime",
        title_english: "Test Anime English",
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.title).toBe("Test Anime English");
    });

    it("should fallback to title when title_english is missing", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test Anime",
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.title).toBe("Test Anime");
    });

    it("should use large_image_url over image_url", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
        images: {
          jpg: {
            image_url: "https://example.com/image.jpg",
            large_image_url: "https://example.com/large.jpg",
          },
        },
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.cover_url).toBe("https://example.com/large.jpg");
    });

    it("should fallback to webp images", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
        images: {
          webp: {
            large_image_url: "https://example.com/webp.jpg",
          },
        },
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.cover_url).toBe("https://example.com/webp.jpg");
    });

    it("should round and clamp score between 1 and 10", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
        score: 8.7,
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.score).toBe(9);
    });

    it("should clamp score to minimum 1", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
        score: 0.5,
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.score).toBe(1);
    });

    it("should clamp score to maximum 10", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
        score: 11.5,
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.score).toBe(10);
    });

    it("should include synopsis in notes", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
        synopsis: "Test synopsis",
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.notes).toContain("Sinopsis:");
      expect(result.notes).toContain("Test synopsis");
    });

    it("should include Japanese title when different", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
        title_english: "Test English",
        title_japanese: "テスト",
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.notes).toContain("Título japonés: テスト");
    });

    it("should not include Japanese title when same as English", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
        title_english: "Test",
        title_japanese: "Test",
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.notes).not.toContain("Título japonés");
    });

    it("should include genres", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
        genres: [
          { mal_id: 1, name: "Action", type: "anime", url: "" },
          { mal_id: 2, name: "Adventure", type: "anime", url: "" },
        ],
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.notes).toContain("Géneros:");
      expect(result.notes).toContain("Action");
      expect(result.notes).toContain("Adventure");
    });

    it("should include studios", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
        studios: [{ mal_id: 1, name: "Studio Ghibli", type: "anime", url: "" }],
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.notes).toContain("Estudios:");
      expect(result.notes).toContain("Studio Ghibli");
    });

    it("should format members correctly", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
        members: 1500000,
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.notes).toContain("Miembros: 1.5M");
    });

    it("should format members in thousands", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
        members: 5000,
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.notes).toContain("Miembros: 5.0K");
    });

    it("should include MAL ID", () => {
      const anime: AnimeSearchResult = {
        mal_id: 12345,
        title: "Test",
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.notes).toContain("MyAnimeList ID: 12345");
    });

    it("should accept custom status", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime, "watching");

      expect(result.status).toBe("watching");
    });

    it("should include total episodes", () => {
      const anime: AnimeSearchResult = {
        mal_id: 1,
        title: "Test",
        episodes: 24,
      } as AnimeSearchResult;

      const result = parseJikanAnimeToDTO(anime);

      expect(result.total_episodes).toBe(24);
    });
  });
});
