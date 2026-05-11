import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import StatsCardSkeleton from "../../../../app/components/index/StatsCardSkeleton";

describe("StatsCardSkeleton.vue", () => {
  it("should render component", () => {
    const wrapper = mount(StatsCardSkeleton, {
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
