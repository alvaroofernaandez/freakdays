import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import PartyContentModal from "../../../../../app/components/party/PartyContentModal.vue";

vi.mock("@/composables/usePartyLists", () => ({
  usePartyLists: () => ({
    lists: [],
    fetchLists: vi.fn().mockResolvedValue([]),
    createList: vi.fn().mockResolvedValue(null),
  }),
}));

describe("PartyContentModal.vue", () => {
  const mockParty = {
    id: "party-1",
    name: "Test Party",
    description: "A test party",
    inviteCode: "ABC123",
    ownerId: "owner-1",
    maxMembers: 10,
    createdAt: new Date(),
    members: [
      {
        id: "member-1",
        partyId: "party-1",
        userId: "user-1",
        role: "owner",
        joinedAt: new Date(),
        profile: {
          username: "testuser",
          displayName: "Test User",
          avatarUrl: null,
        },
      },
    ],
  };

  const globalStubs = {
    Dialog: { template: '<div v-if="open"><slot /></div>', props: ["open"] },
    DialogContent: { template: '<div class="dialog-content"><slot /></div>' },
    DialogHeader: { template: '<div class="dialog-header"><slot /></div>' },
    DialogTitle: { template: '<h2 class="dialog-title"><slot /></h2>' },
    DialogDescription: {
      template: '<p class="dialog-description"><slot /></p>',
    },
    Tabs: {
      template: '<div class="tabs"><slot /></div>',
      props: ["modelValue"],
    },
    TabsList: { template: '<div class="tabs-list"><slot /></div>' },
    TabsTrigger: {
      template: '<button class="tabs-trigger"><slot /></button>',
      props: ["value"],
    },
    TabsContent: {
      template: '<div class="tabs-content"><slot /></div>',
      props: ["value"],
    },
    Button: { template: "<button @click=\"$emit('click')\"><slot /></button>" },
    Card: { template: '<div class="card"><slot /></div>' },
    CardHeader: { template: '<div class="card-header"><slot /></div>' },
    CardTitle: { template: '<h3 class="card-title"><slot /></h3>' },
    CardDescription: { template: '<p class="card-description"><slot /></p>' },
    SharedListsOverview: {
      template: '<div class="shared-lists">Lists Overview</div>',
      props: ["lists"],
    },
    CreateListModal: {
      template: '<div class="create-list-modal" />',
      props: ["open"],
    },
    PartyListDetailModalInternal: {
      template: '<div class="list-detail-modal" />',
      props: ["open", "list", "partyId"],
    },
    Layers: { template: '<span class="icon-layers" />' },
    Plus: { template: '<span class="icon-plus" />' },
    Users: { template: '<span class="icon-users" />' },
  };

  function mountComponent(props = { open: true, party: mockParty }) {
    return mount(PartyContentModal, {
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
      const wrapper = mountComponent({ open: false, party: null });
      expect(wrapper.find(".dialog-content").exists()).toBe(false);
    });

    it("should display party name", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Test Party");
    });

    it("should display member count", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("1/10 miembros");
    });

    it("should display invite code", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("ABC123");
    });
  });

  describe("tabs", () => {
    it("should display lists tab", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Listas Compartidas");
    });

    it("should display members tab", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Miembros");
    });
  });

  describe("members section", () => {
    it("should display member cards", () => {
      const wrapper = mountComponent();
      expect(wrapper.findAll(".card").length).toBeGreaterThan(0);
    });
  });
});
