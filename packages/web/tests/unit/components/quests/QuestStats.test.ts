import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import QuestStats from "../../../../app/components/quests/QuestStats";

describe("QuestStats.vue", () => {
  it("should render component", () => {
    const wrapper = mount(QuestStats, {
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
