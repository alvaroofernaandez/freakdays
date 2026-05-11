import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ExerciseCard from "../../../../app/components/workouts/ExerciseCard.vue";

describe("ExerciseCard.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ExerciseCard, {
      props: {
        exercise: {
          id: "1",
          exerciseName: "Test Exercise",
          notes: null,
          orderIndex: 0,
          sets: [],
        },
      },
      global: {
        stubs: {
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardContent: true,
          Button: true,
          Input: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
