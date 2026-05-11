import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CalendarGrid from "../../../../app/components/calendar/CalendarGrid.vue";

describe("CalendarGrid.vue", () => {
  it("should render component", () => {
    const wrapper = mount(CalendarGrid, {
      props: {
        currentMonth: new Date(),
        events: [],
        loading: false,
      },
      global: {
        stubs: {
          Button: true,
          Card: true,
          CardHeader: true,
          CalendarDay: true,
          CalendarEmptyState: true,
          CalendarGridSkeleton: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
