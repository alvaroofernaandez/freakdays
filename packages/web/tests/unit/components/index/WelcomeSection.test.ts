import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WelcomeSection from "../../../../app/components/index/WelcomeSection.vue";

describe("WelcomeSection.vue", () => {
  it("should render welcome section", () => {
    const wrapper = mount(WelcomeSection, {
      global: {
        stubs: {
          NuxtLink: true,
          Button: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});

