import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MangaStatsSkeleton from "../../../../app/components/manga/MangaStatsSkeleton";

describe("MangaStatsSkeleton.vue", () => {
  it("should render component", () => {
    const wrapper = mount(MangaStatsSkeleton, {
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
