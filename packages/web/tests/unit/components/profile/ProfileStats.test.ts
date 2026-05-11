import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProfileStats from "../../../../app/components/profile/ProfileStats";

describe("ProfileStats.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ProfileStats, {
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
