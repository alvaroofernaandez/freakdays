import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AnimeSearchBar from "../../../../app/components/anime/AnimeSearchBar";

describe("AnimeSearchBar.vue", () => {
  it("should render component", () => {
    const wrapper = mount(AnimeSearchBar, {
      global: {
        stubs: {
          NuxtLink: true,
          Button: true,
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardContent: true,
          CardDescription: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
