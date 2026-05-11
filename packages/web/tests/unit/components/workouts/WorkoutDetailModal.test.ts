import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WorkoutDetailModal from "../../../../app/components/workouts/WorkoutDetailModal";

describe("WorkoutDetailModal.vue", () => {
  it("should render component", () => {
    const wrapper = mount(WorkoutDetailModal, {
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
