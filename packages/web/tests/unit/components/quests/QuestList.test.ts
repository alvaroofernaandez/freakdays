import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import QuestList from "../../../../app/components/quests/QuestList.vue";

describe("QuestList.vue", () => {
  it("should render component", () => {
    const wrapper = mount(QuestList, {
      props: {
        quests: [],
        loading: false,
        isCompleted: false,
      },
      global: {
        stubs: {
          Empty: true,
          QuestCard: true,
          QuestCardSkeleton: true,
          Button: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
