import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AnimeMarketplace from "../../../../app/components/anime/AnimeMarketplace";

describe("AnimeMarketplace.vue", () => {
  it("should render component", () => {
    const wrapper = mount(AnimeMarketplace, {
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
