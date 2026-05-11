import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WorkoutCardSkeleton from "../../../../app/components/workouts/WorkoutCardSkeleton";

describe("WorkoutCardSkeleton.vue", () => {
  it("should render component", () => {
    const wrapper = mount(WorkoutCardSkeleton, {
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
