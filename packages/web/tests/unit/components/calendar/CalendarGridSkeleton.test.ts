import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CalendarGridSkeleton from "../../../../app/components/calendar/CalendarGridSkeleton";

describe("CalendarGridSkeleton.vue", () => {
  it("should render component", () => {
    const wrapper = mount(CalendarGridSkeleton, {
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
