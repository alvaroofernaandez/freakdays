import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WorkoutStatsSkeleton from "../../../../app/components/workouts/WorkoutStatsSkeleton";

describe("WorkoutStatsSkeleton.vue", () => {
  it("should render component", () => {
    const wrapper = mount(WorkoutStatsSkeleton, {
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
