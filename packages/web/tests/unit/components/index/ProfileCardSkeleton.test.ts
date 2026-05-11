import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProfileCardSkeleton from "../../../../app/components/index/ProfileCardSkeleton";

describe("ProfileCardSkeleton.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ProfileCardSkeleton, {
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
