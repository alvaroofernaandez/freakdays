import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import SharedListsOverview from "../../../../../app/components/party/lists/SharedListsOverview.vue";
import type { PartySharedList } from "../../../../../domain/types/party";

describe("SharedListsOverview.vue", () => {
  const mockLists: PartySharedList[] = [
    {
      id: "list-1",
      partyId: "party-1",
      name: "Anime List Test",
      listType: "anime",
      content: null,
      createdBy: "user-1",
      createdAt: new Date("2025-01-01"),
      creator: {
        username: "testuser",
        displayName: "Test User",
        avatarUrl: null,
      },
      _count: {
        animeItems: 5,
      },
    },
    {
      id: "list-2",
      partyId: "party-1",
      name: "Tier List Test",
      listType: "tier_list",
      content: null,
      createdBy: "user-2",
      createdAt: new Date("2025-01-02"),
      creator: {
        username: "anotheruser",
        displayName: null,
        avatarUrl: null,
      },
    },
  ];

  const globalStubs = {
    Card: {
      template:
        '<div class="card" @click="$emit(\'click\')" @keydown="$emit(\'keydown\', $event)"><slot /></div>',
    },
    CardHeader: { template: '<div class="card-header"><slot /></div>' },
    CardTitle: { template: '<h3 class="card-title"><slot /></h3>' },
    CardDescription: { template: '<p class="card-description"><slot /></p>' },
    CardContent: { template: '<div class="card-content"><slot /></div>' },
    CardFooter: { template: '<div class="card-footer"><slot /></div>' },
    Clock: { template: '<span class="icon-clock" />' },
    LayoutGrid: { template: '<span class="icon-grid" />' },
    List: { template: '<span class="icon-list" />' },
    User: { template: '<span class="icon-user" />' },
  };

  function mountComponent(lists: PartySharedList[] = mockLists) {
    return mount(SharedListsOverview, {
      props: { lists },
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

    it("should show empty state when no lists", () => {
      const wrapper = mountComponent([]);
      expect(wrapper.text()).toContain("No hay listas compartidas");
    });

    it("should display list names", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Anime List Test");
      expect(wrapper.text()).toContain("Tier List Test");
    });

    it("should display list type descriptions", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Lista de Anime Compartida");
      expect(wrapper.text()).toContain("Tier List Colaborativa");
    });

    it("should display creator info", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Test User");
      expect(wrapper.text()).toContain("anotheruser");
    });

    it("should display item count when available", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("5");
      expect(wrapper.text()).toContain("items");
    });
  });

  describe("events", () => {
    it("should emit select when card is clicked", async () => {
      const wrapper = mountComponent();
      const cards = wrapper.findAll(".card");
      await cards[0]?.trigger("click");
      expect(wrapper.emitted("select")).toBeTruthy();
      expect(wrapper.emitted("select")?.[0]).toEqual([mockLists[0]]);
    });
  });

  describe("accessibility", () => {
    it("should have list role when lists exist", () => {
      const wrapper = mountComponent();
      expect(wrapper.find('[role="list"]').exists()).toBe(true);
    });

    it("should have status role when empty", () => {
      const wrapper = mountComponent([]);
      expect(wrapper.find('[role="status"]').exists()).toBe(true);
    });
  });
});
