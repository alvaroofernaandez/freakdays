import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DesktopNav from "../../../../app/components/layout/DesktopNav";

describe("DesktopNav.vue", () => {
  it("should render component", () => {
    const wrapper = mount(DesktopNav, {
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
