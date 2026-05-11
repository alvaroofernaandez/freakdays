import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DesktopNavSecondary from "../../../../app/components/layout/DesktopNavSecondary.vue";

describe("DesktopNavSecondary.vue", () => {
  it("should render component", () => {
    const wrapper = mount(DesktopNavSecondary, {
      props: {
        items: [],
        isActive: () => false,
      },
      global: {
        stubs: {
          NuxtLink: true,
          ClientOnly: {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
