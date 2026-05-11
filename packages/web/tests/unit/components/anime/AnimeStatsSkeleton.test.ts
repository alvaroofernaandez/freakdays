import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AnimeStatsSkeleton from "../../../../app/components/anime/AnimeStatsSkeleton";

describe("AnimeStatsSkeleton.vue", () => {
  it("should render component", () => {
    const wrapper = mount(AnimeStatsSkeleton, {
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
