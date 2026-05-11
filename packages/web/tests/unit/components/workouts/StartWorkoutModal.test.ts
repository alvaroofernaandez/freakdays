import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import StartWorkoutModal from "../../../../app/components/workouts/StartWorkoutModal";

describe("StartWorkoutModal.vue", () => {
  it("should render component", () => {
    const wrapper = mount(StartWorkoutModal, {
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
