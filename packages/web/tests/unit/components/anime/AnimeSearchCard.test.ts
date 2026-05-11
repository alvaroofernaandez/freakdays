import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AnimeSearchCard from "../../../../app/components/anime/AnimeSearchCard";

describe("AnimeSearchCard.vue", () => {
  it("should render component", () => {
    const wrapper = mount(AnimeSearchCard, {
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
