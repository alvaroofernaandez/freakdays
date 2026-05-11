import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ActiveWorkoutModal from "../../../../app/components/workouts/ActiveWorkoutModal.vue";

describe("ActiveWorkoutModal.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ActiveWorkoutModal, {
      props: {
        workout: {
          id: "1",
          name: "Test Workout",
          description: null,
          workoutDate: new Date(),
          durationMinutes: null,
          notes: null,
          status: "in_progress",
          startedAt: new Date(),
          completedAt: null,
          exercises: [],
        },
        elapsedTime: "0 min",
        newExerciseName: "",
        addingExercise: false,
      },
      global: {
        stubs: {
          ExerciseCard: true,
          Button: true,
          Input: true,
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardContent: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
