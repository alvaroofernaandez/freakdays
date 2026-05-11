import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import QuestCardSkeleton from "../../../../app/components/quests/QuestCardSkeleton";

describe("QuestCardSkeleton.vue", () => {
  it("should render component", () => {
    const wrapper = mount(QuestCardSkeleton, {
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
