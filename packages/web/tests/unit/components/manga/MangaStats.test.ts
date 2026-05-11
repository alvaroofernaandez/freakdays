import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MangaStats from "../../../../app/components/manga/MangaStats";

describe("MangaStats.vue", () => {
  it("should render component", () => {
    const wrapper = mount(MangaStats, {
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
