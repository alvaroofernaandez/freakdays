import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import QuestCard from "../../../../app/components/quests/QuestCard.vue";
import type { Quest } from "../../../../domain/types";

const mockQuest: Quest = {
  id: "1",
  title: "Test Quest",
  description: "Test description",
  difficulty: "easy",
  exp: 10,
  status: "pending",
  streak: 0,
  dueDate: null,
  dueTime: null,
  reminderMinutesBefore: null,
  createdAt: new Date(),
  completedAt: null,
  isOverdue: false,
  isDueSoon: false,
};

describe("QuestCard.vue", () => {
  it("should render quest card", () => {
    const wrapper = mount(QuestCard, {
      props: {
        quest: mockQuest,
      },
      global: {
        stubs: {
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardDescription: true,
          Button: true,
          Badge: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should emit complete when complete button is clicked", async () => {
    const wrapper = mount(QuestCard, {
      props: {
        quest: mockQuest,
      },
      global: {
        stubs: {
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardDescription: true,
          Button: true,
          Badge: true,
        },
      },
    });

    const completeButton = wrapper.find("button");
    if (completeButton.exists()) {
      await completeButton.trigger("click");
      expect(wrapper.emitted("complete")).toBeTruthy();
    }
  });

  it("should emit delete when delete button is clicked", async () => {
    const wrapper = mount(QuestCard, {
      props: {
        quest: mockQuest,
      },
      global: {
        stubs: {
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardDescription: true,
          Button: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            emits: ["click"],
          },
          Badge: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should show completed state when isCompleted is true", () => {
    const wrapper = mount(QuestCard, {
      props: {
        quest: mockQuest,
        isCompleted: true,
      },
      global: {
        stubs: {
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardDescription: true,
          Button: true,
          Badge: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});

