import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import QuestFormModal from "../../../../app/components/quests/QuestFormModal";

describe("QuestFormModal.vue", () => {
  it("should render component", () => {
    const wrapper = mount(QuestFormModal, {
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
