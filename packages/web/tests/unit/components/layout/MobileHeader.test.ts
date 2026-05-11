import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MobileHeader from "../../../../app/components/layout/MobileHeader";

describe("MobileHeader.vue", () => {
  it("should render component", () => {
    const wrapper = mount(MobileHeader, {
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
