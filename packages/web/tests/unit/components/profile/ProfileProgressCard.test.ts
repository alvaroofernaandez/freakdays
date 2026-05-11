import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProfileProgressCard from "../../../../app/components/profile/ProfileProgressCard";

describe("ProfileProgressCard.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ProfileProgressCard, {
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
