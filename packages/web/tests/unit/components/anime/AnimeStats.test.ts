import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AnimeStats from "../../../../app/components/anime/AnimeStats";

describe("AnimeStats.vue", () => {
  it("should render component", () => {
    const wrapper = mount(AnimeStats, {
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
