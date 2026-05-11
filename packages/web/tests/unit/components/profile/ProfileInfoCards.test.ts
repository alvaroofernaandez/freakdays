import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProfileInfoCards from "../../../../app/components/profile/ProfileInfoCards.vue";

describe("ProfileInfoCards.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ProfileInfoCards, {
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
        favoriteAnime: null,
        favoriteManga: null,
      },
      global: {
        stubs: {
          Card: true,
          CardContent: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
