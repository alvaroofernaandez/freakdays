import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import EditEventSheet from "../../../../app/components/calendar/EditEventSheet.vue";
import type { Release } from "../../../../app/composables/useCalendar";

describe("EditEventSheet.vue", () => {
  const mockRelease: Release = {
    id: "event-1",
    title: "One Piece Ep. 1120",
    type: "anime_episode",
    releaseDate: new Date("2025-01-15"),
    description: "New episode description",
    url: "https://example.com",
    createdAt: new Date(),
  };

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
    Input: {
      template:
        '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ["modelValue", "disabled"],
    },
    Label: { template: "<label><slot /></label>" },
    DatePicker: {
      template: '<input type="date" />',
      props: ["modelValue", "disabled"],
    },
    Ticket: { template: '<span class="icon-ticket" />' },
    Tv: { template: '<span class="icon-tv" />' },
    BookOpen: { template: '<span class="icon-book" />' },
    Save: { template: '<span class="icon-save" />' },
  };

  function mountComponent(
    props: {
      open: boolean;
      release: Release | null;
      isSubmitting: boolean;
    } = {
      open: true,
      release: mockRelease,
      isSubmitting: false,
    }
  ) {
    return mount(EditEventSheet, {
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
        release: null,
        isSubmitting: false,
      });
      expect(wrapper.find(".sheet-content").exists()).toBe(false);
    });

    it("should display edit title", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Editar Evento");
    });

    it("should have title input", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Título");
    });

    it("should have date picker", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Fecha");
    });

    it("should have type selector", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Tipo");
    });

    it("should have description field", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Descripción");
    });

    it("should have URL field", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("URL");
    });
  });

  describe("type buttons", () => {
    it("should display all event types", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Episodio");
      expect(wrapper.text()).toContain("Tomo");
      expect(wrapper.text()).toContain("Evento");
    });
  });

  describe("buttons", () => {
    it("should have cancel and save buttons", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Cancelar");
      expect(wrapper.text()).toContain("Guardar");
    });

    it("should show loading state when submitting", () => {
      const wrapper = mountComponent({
        open: true,
        release: mockRelease,
        isSubmitting: true,
      });
      expect(wrapper.text()).toContain("Guardando...");
    });
  });

  describe("events", () => {
    it("should emit update:open when cancel clicked", async () => {
      const wrapper = mountComponent();
      const cancelButton = wrapper
        .findAll("button")
        .find((b) => b.text().includes("Cancelar"));
      await cancelButton?.trigger("click");
      expect(wrapper.emitted("update:open")).toBeTruthy();
    });
  });
});
