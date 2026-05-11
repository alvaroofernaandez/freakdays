import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import OverdueBanner from "../../../../app/components/quests/OverdueBanner";

describe("OverdueBanner.vue", () => {
  it("should render component", () => {
    const wrapper = mount(OverdueBanner, {
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
