import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WorkoutList from "../../../../app/components/workouts/WorkoutList.vue";

describe("WorkoutList.vue", () => {
  it("should render component", () => {
    const wrapper = mount(WorkoutList, {
      props: {
        workouts: [],
        loading: false,
      },
      global: {
        stubs: {
          Empty: true,
          WorkoutCard: true,
          WorkoutCardSkeleton: true,
          Button: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
