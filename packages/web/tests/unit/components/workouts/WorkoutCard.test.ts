import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WorkoutCard from "../../../../app/components/workouts/WorkoutCard";

describe("WorkoutCard.vue", () => {
  it("should render component", () => {
    const wrapper = mount(WorkoutCard, {
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
