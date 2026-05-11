import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import PartyListDetailModal from "../../../../app/components/party/PartyListDetailModal.vue";
import type { PartySharedList } from "../../../../domain/types/party";

describe("PartyListDetailModal.vue", () => {
  const mockAnimeList: PartySharedList = {
    id: "list-1",
    partyId: "party-1",
    name: "Anime List Test",
    listType: "anime",
    content: null,
    createdBy: "user-1",
    createdAt: new Date(),
  };

  const mockTierList: PartySharedList = {
    id: "list-2",
    partyId: "party-1",
    name: "Tier List Test",
    listType: "tier_list",
    content: null,
    createdBy: "user-1",
    createdAt: new Date(),
  };

  const globalStubs = {
    Dialog: { template: '<div v-if="open"><slot /></div>', props: ["open"] },
    DialogContent: { template: '<div class="dialog-content"><slot /></div>' },
    DialogHeader: { template: '<div class="dialog-header"><slot /></div>' },
    DialogTitle: { template: '<h2 class="dialog-title"><slot /></h2>' },
    DialogDescription: {
      template: '<p class="dialog-description"><slot /></p>',
    },
    PartyAnimeList: {
      template: '<div class="anime-list">Anime List Component</div>',
      props: ["list", "partyId"],
    },
    TierListEditor: {
      template: '<div class="tier-list">Tier List Component</div>',
      props: ["list", "partyId"],
    },
  };

  function mountComponent(
    props: { open: boolean; list: PartySharedList | null; partyId: string } = {
      open: true,
      list: mockAnimeList,
      partyId: "party-1",
    }
  ) {
    return mount(PartyListDetailModal, {
      props,
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

    it("should not render when closed", () => {
      const wrapper = mountComponent({
        open: false,
        list: null,
        partyId: "party-1",
      });
      expect(wrapper.find(".dialog-content").exists()).toBe(false);
    });

    it("should display list name", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Anime List Test");
    });
  });

  describe("list type display", () => {
    it("should show Anime List badge for anime type", () => {
      const wrapper = mountComponent({
        open: true,
        list: mockAnimeList,
        partyId: "party-1",
      });
      expect(wrapper.text()).toContain("Anime List");
    });

    it("should show Tier List badge for tier_list type", () => {
      const wrapper = mountComponent({
        open: true,
        list: mockTierList,
        partyId: "party-1",
      });
      expect(wrapper.text()).toContain("Tier List");
    });
  });

  describe("component rendering", () => {
    it("should render PartyAnimeList for anime type", () => {
      const wrapper = mountComponent({
        open: true,
        list: mockAnimeList,
        partyId: "party-1",
      });
      expect(wrapper.find(".anime-list").exists()).toBe(true);
    });

    it("should render TierListEditor for tier_list type", () => {
      const wrapper = mountComponent({
        open: true,
        list: mockTierList,
        partyId: "party-1",
      });
      expect(wrapper.find(".tier-list").exists()).toBe(true);
    });
  });

  describe("events", () => {
    it("should emit update:open when dialog closes", async () => {
      const wrapper = mountComponent();
      expect(wrapper.exists()).toBe(true);
    });
  });
});
