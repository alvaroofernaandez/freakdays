import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MobileMenu from "../../../../app/components/layout/MobileMenu";

describe("MobileMenu.vue", () => {
  it("should render component", () => {
    const wrapper = mount(MobileMenu, {
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
