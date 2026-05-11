import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProfileHeader from "../../../../app/components/profile/ProfileHeader.vue";

describe("ProfileHeader.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ProfileHeader, {
      props: {
        profile: {
          id: "1",
          userId: "user1",
          username: "test",
          displayName: "Test User",
          bio: null,
          avatarUrl: null,
          level: 1,
          totalExp: 0,
          location: null,
          website: null,
          socialLinks: {},
          favoriteAnimeId: null,
          favoriteMangaId: null,
          createdAt: new Date(),
        },
        editing: false,
        avatarPreview: null,
        uploadingAvatar: false,
        saving: false,
      },
      global: {
        stubs: {
          Avatar: true,
          AvatarFallback: true,
          AvatarImage: true,
          Button: true,
          Tooltip: true,
          TooltipContent: true,
          TooltipTrigger: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
