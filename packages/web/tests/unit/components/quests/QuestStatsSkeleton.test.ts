import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import QuestStatsSkeleton from "../../../../app/components/quests/QuestStatsSkeleton";

describe("QuestStatsSkeleton.vue", () => {
  it("should render component", () => {
    const wrapper = mount(QuestStatsSkeleton, {
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
