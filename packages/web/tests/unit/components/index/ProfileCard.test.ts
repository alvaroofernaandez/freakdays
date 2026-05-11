import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProfileCard from "../../../../app/components/index/ProfileCard";

describe("ProfileCard.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ProfileCard, {
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
