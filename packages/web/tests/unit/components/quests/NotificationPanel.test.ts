import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NotificationPanel from "../../../../app/components/quests/NotificationPanel";

describe("NotificationPanel.vue", () => {
  it("should render component", () => {
    const wrapper = mount(NotificationPanel, {
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
