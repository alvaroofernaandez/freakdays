import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WorkoutStats from "../../../../app/components/workouts/WorkoutStats";

describe("WorkoutStats.vue", () => {
  it("should render component", () => {
    const wrapper = mount(WorkoutStats, {
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
