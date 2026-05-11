import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MobileNav from "../../../../app/components/layout/MobileNav";

describe("MobileNav.vue", () => {
  it("should render component", () => {
    const wrapper = mount(MobileNav, {
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
