import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AnimeCardSkeleton from "../../../../app/components/anime/AnimeCardSkeleton";

describe("AnimeCardSkeleton.vue", () => {
  it("should render component", () => {
    const wrapper = mount(AnimeCardSkeleton, {
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
