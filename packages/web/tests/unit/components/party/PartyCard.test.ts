import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import PartyCard from "../../../../app/components/party/PartyCard.vue";

describe("PartyCard.vue", () => {
  const mockParty = {
    id: "party-1",
    name: "Test Party",
    description: "A test party description",
    maxMembers: 10,
    inviteCode: "ABC123",
    ownerId: "owner-1",
    members: [
      {
        id: "member-1",
        partyId: "party-1",
        userId: "user-1",
        joinedAt: new Date(),
        profile: {
          username: "testuser",
          displayName: "Test User",
          avatarUrl: null,
        },
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should render component", () => {
    const wrapper = mount(PartyCard, {
      props: {
        party: mockParty,
        isOwner: false,
        copiedCode: null,
        isSubmitting: false,
      },
      global: {
        stubs: {
          NuxtLink: true,
          Button: true,
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardContent: true,
          CardDescription: true,
          Avatar: true,
          AvatarFallback: true,
          AvatarImage: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
