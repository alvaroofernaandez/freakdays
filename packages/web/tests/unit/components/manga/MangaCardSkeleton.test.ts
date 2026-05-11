import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MangaCardSkeleton from "../../../../app/components/manga/MangaCardSkeleton";

describe("MangaCardSkeleton.vue", () => {
  it("should render component", () => {
    const wrapper = mount(MangaCardSkeleton, {
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
