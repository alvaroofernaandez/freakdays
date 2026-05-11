import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MangaCard from "../../../../app/components/manga/MangaCard";

describe("MangaCard.vue", () => {
  it("should render component", () => {
    const wrapper = mount(MangaCard, {
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
