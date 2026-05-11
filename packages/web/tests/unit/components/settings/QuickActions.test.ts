import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import QuickActions from "../../../../app/components/settings/QuickActions";

describe("QuickActions.vue", () => {
  it("should render component", () => {
    const wrapper = mount(QuickActions, {
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
