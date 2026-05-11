import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WorkoutDetailStats from "../../../../app/components/workouts/WorkoutDetailStats";

describe("WorkoutDetailStats.vue", () => {
  it("should render component", () => {
    const wrapper = mount(WorkoutDetailStats, {
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
