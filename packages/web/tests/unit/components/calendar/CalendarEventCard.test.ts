import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CalendarEventCard from "../../../../app/components/calendar/CalendarEventCard.vue";
import type { Release } from "../../../../app/composables/useCalendar";

describe("CalendarEventCard.vue", () => {
  const mockRelease: Release = {
    id: "1",
    title: "Test Event",
    type: "anime_episode",
    releaseDate: new Date(),
    description: null,
    url: null,
  };

  it("should render component", () => {
    const wrapper = mount(CalendarEventCard, {
      props: {
        release: mockRelease,
      },
      global: {
        stubs: {
          Button: true,
          Card: true,
          CardContent: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
