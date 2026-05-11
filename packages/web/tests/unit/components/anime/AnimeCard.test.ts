import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AnimeCard from "../../../../app/components/anime/AnimeCard";

describe("AnimeCard.vue", () => {
  it("should render component", () => {
    const wrapper = mount(AnimeCard, {
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
