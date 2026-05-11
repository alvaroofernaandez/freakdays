import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CalendarDay from "../../../../app/components/calendar/CalendarDay.vue";

describe("CalendarDay.vue", () => {
  it("should render component", () => {
    const wrapper = mount(CalendarDay, {
      props: {
        date: new Date(),
        events: [],
        isToday: false,
        isCurrentMonth: true,
        isDragging: false,
      },
      global: {
        stubs: {
          Card: true,
          CalendarEventCard: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
