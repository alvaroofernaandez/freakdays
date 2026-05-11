import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import InfoSection from "../../../../app/components/settings/InfoSection";

describe("InfoSection.vue", () => {
  it("should render component", () => {
    const wrapper = mount(InfoSection, {
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
