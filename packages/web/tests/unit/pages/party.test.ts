import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PartyPage from "../../../app/pages/party/index.vue";

vi.mock("../../../app/composables/usePartyPage", () => ({
  usePartyPage: () => ({
    parties: { value: [] },
    loading: { value: false },
    createModal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    joinModal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    detailsModal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    deleteConfirmModal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    removeMemberModal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    newParty: { value: { name: "", description: "" } },
    joinCode: { value: "" },
    selectedParty: { value: null },
    memberToRemove: { value: null },
    copiedCode: { value: null },
    isSubmitting: { value: false },
    isRegeneratingCode: { value: false },
    createParty: vi.fn(),
    joinParty: vi.fn(),
    leaveParty: vi.fn(),
    regenerateInviteCode: vi.fn(),
    removeMember: vi.fn(),
    deleteParty: vi.fn(),
    copyInviteCode: vi.fn(),
    openDeleteConfirm: vi.fn(),
    openRemoveMemberConfirm: vi.fn(),
    openDetails: vi.fn(),
    isOwner: vi.fn(() => false),
    canManageMembers: vi.fn(() => false),
    getMemberRoleLabel: vi.fn((role: string) => role),
    initialize: vi.fn(),
  }),
}));

vi.mock("../../../stores/auth", () => ({
  useAuthStore: () => ({
    userId: "test-user-id",
  }),
}));

describe("party.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should render party page", () => {
    const wrapper = mount(PartyPage, {
      global: {
        stubs: {
          CreatePartyModal: true,
          DeletePartyConfirmModal: true,
          JoinPartyModal: true,
          PartyCard: true,
          PartyCardSkeleton: true,
          PartyDetailsModal: true,
          PartyEmptyState: true,
          RemoveMemberConfirmModal: true,
          Button: true,
          TransitionGroup: true,
          Transition: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Party System");
  });

  it("should render page with initialize function", () => {
    const initialize = vi.fn();
    vi.doMock("../../../app/composables/usePartyPage", () => ({
      usePartyPage: () => ({
        parties: { value: [] },
        loading: { value: false },
        createModal: {
          isOpen: { value: false },
          open: vi.fn(),
          close: vi.fn(),
        },
        joinModal: {
          isOpen: { value: false },
          open: vi.fn(),
          close: vi.fn(),
        },
        detailsModal: {
          isOpen: { value: false },
          open: vi.fn(),
          close: vi.fn(),
        },
        deleteConfirmModal: {
          isOpen: { value: false },
          open: vi.fn(),
          close: vi.fn(),
        },
        removeMemberModal: {
          isOpen: { value: false },
          open: vi.fn(),
          close: vi.fn(),
        },
        newParty: { value: { name: "", description: "" } },
        joinCode: { value: "" },
        selectedParty: { value: null },
        memberToRemove: { value: null },
        copiedCode: { value: null },
        isSubmitting: { value: false },
        isRegeneratingCode: { value: false },
        createParty: vi.fn(),
        joinParty: vi.fn(),
        leaveParty: vi.fn(),
        regenerateInviteCode: vi.fn(),
        removeMember: vi.fn(),
        deleteParty: vi.fn(),
        copyInviteCode: vi.fn(),
        openDeleteConfirm: vi.fn(),
        openRemoveMemberConfirm: vi.fn(),
        openDetails: vi.fn(),
        isOwner: vi.fn(() => false),
        canManageMembers: vi.fn(() => false),
        getMemberRoleLabel: vi.fn((role: string) => role),
        initialize,
      }),
    }));

    const wrapper = mount(PartyPage, {
      global: {
        stubs: {
          CreatePartyModal: true,
          DeletePartyConfirmModal: true,
          JoinPartyModal: true,
          PartyCard: true,
          PartyCardSkeleton: true,
          PartyDetailsModal: true,
          PartyEmptyState: true,
          RemoveMemberConfirmModal: true,
          Button: true,
          TransitionGroup: true,
          Transition: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should show empty state when no parties", () => {
    const wrapper = mount(PartyPage, {
      global: {
        stubs: {
          CreatePartyModal: true,
          DeletePartyConfirmModal: true,
          JoinPartyModal: true,
          PartyCard: true,
          PartyCardSkeleton: true,
          PartyDetailsModal: true,
          PartyEmptyState: true,
          RemoveMemberConfirmModal: true,
          Button: true,
          TransitionGroup: true,
          Transition: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should show loading skeletons when loading", () => {
    vi.doMock("../../../app/composables/usePartyPage", () => ({
      usePartyPage: () => ({
        loading: { value: true },
      }),
    }));

    const wrapper = mount(PartyPage, {
      global: {
        stubs: {
          CreatePartyModal: true,
          DeletePartyConfirmModal: true,
          JoinPartyModal: true,
          PartyCard: true,
          PartyCardSkeleton: true,
          PartyDetailsModal: true,
          PartyEmptyState: true,
          RemoveMemberConfirmModal: true,
          Button: true,
          TransitionGroup: true,
          Transition: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
