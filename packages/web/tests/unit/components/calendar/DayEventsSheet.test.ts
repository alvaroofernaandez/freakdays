import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import DayEventsSheet from "../../../../app/components/calendar/DayEventsSheet.vue";
import type { Release } from "../../../../app/composables/useCalendar";

describe("DayEventsSheet.vue", () => {
  const mockEvents: Release[] = [
    {
      id: "event-1",
      title: "One Piece Ep. 1120",
      type: "anime_episode",
      releaseDate: new Date("2025-01-15"),
      description: "New episode",
      url: null,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "event-2",
      title: "Jujutsu Kaisen Vol. 25",
      type: "manga_volume",
      releaseDate: new Date("2025-01-15"),
      description: null,
      url: null,
      createdAt: new Date("2024-01-01"),
    },
  ];

  const globalStubs = {
    Sheet: { template: '<div v-if="open"><slot /></div>', props: ["open"] },
    SheetContent: {
      template: '<div class="sheet-content"><slot /></div>',
      props: ["side"],
    },
    SheetHeader: { template: '<div class="sheet-header"><slot /></div>' },
    SheetTitle: { template: '<h2 class="sheet-title"><slot /></h2>' },
    SheetDescription: { template: '<p class="sheet-description"><slot /></p>' },
    Button: {
      template:
        '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
      props: ["disabled", "variant", "size"],
    },
    DatePicker: { template: '<input type="date" />', props: ["modelValue"] },
    Calendar: { template: '<span class="icon-calendar" />' },
    ChevronLeft: { template: '<span class="icon-left" />' },
    ChevronRight: { template: '<span class="icon-right" />' },
    Edit2: { template: '<span class="icon-edit" />' },
    Trash2: { template: '<span class="icon-trash" />' },
  };

  interface Props {
    open: boolean;
    date: Date | null;
    events: readonly Release[];
    isSubmitting: boolean;
  }

  function mountComponent(
    props: Props = {
      open: true,
      date: new Date("2025-01-15"),
      events: mockEvents,
      isSubmitting: false,
    }
  ) {
    return mount(DayEventsSheet, {
      props,
      global: {
        stubs: globalStubs,
      },
    });
  }

  describe("rendering", () => {
    it("should render component", () => {
      const wrapper = mountComponent();
      expect(wrapper.exists()).toBe(true);
    });

    it("should not render when closed", () => {
      const wrapper = mountComponent({
        open: false,
        date: null,
        events: [],
        isSubmitting: false,
      });
      expect(wrapper.find(".sheet-content").exists()).toBe(false);
    });

    it("should display event count", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("2");
      expect(wrapper.text()).toContain("eventos");
    });

    it("should display event titles", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("One Piece Ep. 1120");
      expect(wrapper.text()).toContain("Jujutsu Kaisen Vol. 25");
    });

    it("should display event types in Spanish", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Episodio Anime");
      expect(wrapper.text()).toContain("Tomo Manga");
    });
  });

  describe("empty state", () => {
    it("should show add button when no events", () => {
      const wrapper = mountComponent({
        open: true,
        date: new Date("2025-01-15"),
        events: [],
        isSubmitting: false,
      });
      expect(wrapper.text()).toContain("No hay eventos programados");
      expect(wrapper.text()).toContain("Añadir evento");
    });
  });

  describe("events", () => {
    it("should emit edit when edit button clicked", async () => {
      const wrapper = mountComponent();
      const editButtons = wrapper.findAll('button[aria-label="Editar evento"]');
      await editButtons[0]?.trigger("click");
      expect(wrapper.emitted("edit")).toBeTruthy();
    });

    it("should emit delete when delete button clicked", async () => {
      const wrapper = mountComponent();
      const deleteButtons = wrapper.findAll(
        'button[aria-label="Eliminar evento"]'
      );
      await deleteButtons[0]?.trigger("click");
      expect(wrapper.emitted("delete")).toBeTruthy();
    });
  });
});
