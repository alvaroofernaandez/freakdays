import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import PartyAnimeCard from "../../../../../app/components/party/lists/PartyAnimeCard.vue";
import type { PartyAnimeItem } from "../../../../../domain/types/party";

describe("PartyAnimeCard.vue", () => {
  const mockAnime: PartyAnimeItem = {
    id: "anime-1",
    listId: "list-1",
    addedBy: "user-1",
    title: "Attack on Titan",
    status: "watching",
    currentEpisode: 15,
    totalEpisodes: 25,
    score: 9,
    notes: null,
    coverUrl: "https://example.com/cover.jpg",
    startDate: null,
    endDate: null,
    rewatchCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    addedByUser: {
      username: "testuser",
      displayName: "Test User",
      avatarUrl: null,
    },
  };

  const globalStubs = {
    Badge: {
      template: '<span class="badge"><slot /></span>',
      props: ["variant"],
    },
    Button: {
      template:
        '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
      props: ["disabled", "variant", "size"],
    },
    Card: { template: '<div class="card" role="article"><slot /></div>' },
    Loader2: { template: '<span class="loader" />' },
    Trash2: { template: '<span class="trash-icon" />' },
    Tv: { template: '<span class="tv-icon" />' },
    User: { template: '<span class="user-icon" />' },
  };

  function mountComponent(
    anime: PartyAnimeItem = mockAnime,
    isDeleting = false
  ) {
    return mount(PartyAnimeCard, {
      props: { anime, isDeleting },
      global: {
        stubs: globalStubs,
      },
    });
  }

  describe("rendering", () => {
    it("should render component", () => {
      const wrapper = mountComponent();
      expect(wrapper.exists()).toBe(true);
    });

    it("should display anime title", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Attack on Titan");
    });

    it("should display status in Spanish", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("En curso");
    });

    it("should display episode progress", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Ep. 15");
      expect(wrapper.text()).toContain("/ 25");
    });

    it("should display score when available", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("9");
    });

    it("should display who added the anime", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Test User");
    });

    it("should use username when displayName is null", () => {
      const animeWithoutDisplayName = {
        ...mockAnime,
        addedByUser: {
          username: "onlyusername",
          displayName: null,
          avatarUrl: null,
        },
      };
      const wrapper = mountComponent(animeWithoutDisplayName);
      expect(wrapper.text()).toContain("onlyusername");
    });

    it("should show cover image when available", () => {
      const wrapper = mountComponent();
      const img = wrapper.find("img");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toBe("https://example.com/cover.jpg");
    });

    it("should show placeholder when no cover", () => {
      const animeNoCover = { ...mockAnime, coverUrl: null };
      const wrapper = mountComponent(animeNoCover);
      expect(wrapper.find("img").exists()).toBe(false);
    });
  });

  describe("progress", () => {
    it("should calculate progress percentage", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("60%");
    });

    it("should handle anime without total episodes", () => {
      const animeNoTotal = { ...mockAnime, totalEpisodes: null };
      const wrapper = mountComponent(animeNoTotal);
      expect(wrapper.text()).not.toContain("%");
    });
  });

  describe("statuses", () => {
    const statusTests = [
      { status: "completed", expected: "Completado" },
      { status: "on_hold", expected: "En pausa" },
      { status: "dropped", expected: "Droppeado" },
      { status: "plan_to_watch", expected: "Pendiente" },
    ];

    statusTests.forEach(({ status, expected }) => {
      it(`should display "${expected}" for status "${status}"`, () => {
        const anime = { ...mockAnime, status: status as any };
        const wrapper = mountComponent(anime);
        expect(wrapper.text()).toContain(expected);
      });
    });
  });

  describe("delete functionality", () => {
    it("should emit delete event when delete button clicked", async () => {
      const wrapper = mountComponent();
      const deleteButton = wrapper.find('button[aria-label*="Eliminar"]');
      await deleteButton.trigger("click");
      expect(wrapper.emitted("delete")).toBeTruthy();
      expect(wrapper.emitted("delete")?.[0]).toEqual(["anime-1"]);
    });

    it("should disable delete button when deleting", () => {
      const wrapper = mountComponent(mockAnime, true);
      const deleteButton = wrapper.find("button");
      expect(deleteButton.attributes("disabled")).toBeDefined();
    });

    it("should show loader when deleting", () => {
      const wrapper = mountComponent(mockAnime, true);
      expect(wrapper.find("button").text()).not.toContain("trash");
    });
  });

  describe("accessibility", () => {
    it("should have proper aria-label on card", () => {
      const wrapper = mountComponent();
      const card = wrapper.find('[role="article"]');
      expect(card.attributes("aria-label")).toContain("Attack on Titan");
      expect(card.attributes("aria-label")).toContain("En curso");
    });
  });
});
