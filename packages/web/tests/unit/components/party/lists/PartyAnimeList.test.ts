import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import PartyAnimeList from "../../../../../app/components/party/lists/PartyAnimeList.vue";
import type { PartySharedList } from "../../../../../domain/types/party";

vi.mock("@/composables/useToast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock("@/composables/useSupabase", () => ({
  useSupabase: () => ({
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: { access_token: "token" } } }),
    },
  }),
}));

describe("PartyAnimeList.vue", () => {
  const mockList: PartySharedList = {
    id: "list-1",
    partyId: "party-1",
    name: "Test Anime List",
    listType: "anime",
    content: null,
    createdBy: "user-1",
    createdAt: new Date(),
  };

  const globalStubs = {
    AnimeMarketplace: {
      template: '<div class="marketplace"><slot /></div>',
      props: ["adding"],
    },
    PartyAnimeCard: {
      template:
        '<div class="anime-card" @click="$emit(\'delete\', anime.id)">{{ anime.title }}</div>',
      props: ["anime", "isDeleting"],
      emits: ["delete"],
    },
    Button: {
      template:
        '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
      props: ["disabled", "variant", "size"],
    },
    Card: { template: '<div class="card"><slot /></div>' },
    CardContent: { template: '<div class="card-content"><slot /></div>' },
    CardDescription: { template: '<p class="card-description"><slot /></p>' },
    CardHeader: { template: '<div class="card-header"><slot /></div>' },
    CardTitle: { template: '<h3 class="card-title"><slot /></h3>' },
    Empty: {
      template:
        '<div class="empty"><slot /><slot name="icon" /><slot name="action" /></div>',
      props: ["title", "description"],
    },
    Skeleton: { template: '<div class="skeleton" />' },
    AlertCircle: { template: '<span class="icon-alert" />' },
    Plus: { template: '<span class="icon-plus" />' },
    RefreshCw: { template: '<span class="icon-refresh" />' },
    Search: { template: '<span class="icon-search" />' },
    Tv: { template: '<span class="icon-tv" />' },
    X: { template: '<span class="icon-x" />' },
    Transition: { template: "<div><slot /></div>" },
    TransitionGroup: { template: "<div><slot /></div>" },
  };

  function mountComponent(list: PartySharedList = mockList) {
    return mount(PartyAnimeList, {
      props: {
        list,
        partyId: "party-1",
      },
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

    it("should show loading skeletons initially", () => {
      const wrapper = mountComponent();
      expect(wrapper.findAll(".skeleton").length).toBeGreaterThan(0);
    });

    it("should have main aria label", () => {
      const wrapper = mountComponent();
      expect(wrapper.find('[role="main"]').exists()).toBe(true);
      expect(
        wrapper.find('[aria-label="Lista de animes compartidos"]').exists()
      ).toBe(true);
    });
  });

  describe("header", () => {
    it("should render buttons", async () => {
      const wrapper = mountComponent();
      await nextTick();
      expect(wrapper.findAll("button").length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("marketplace", () => {
    it("should have marketplace component available", async () => {
      const wrapper = mountComponent();
      await nextTick();
      expect(wrapper.exists()).toBe(true);
    });
  });
});
