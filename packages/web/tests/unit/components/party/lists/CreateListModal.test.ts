import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import CreateListModal from "../../../../../app/components/party/lists/CreateListModal.vue";

describe("CreateListModal.vue", () => {
  const globalStubs = {
    Dialog: { template: '<div v-if="open"><slot /></div>', props: ["open"] },
    DialogContent: { template: '<div class="dialog-content"><slot /></div>' },
    DialogHeader: { template: '<div class="dialog-header"><slot /></div>' },
    DialogTitle: { template: '<h2 class="dialog-title"><slot /></h2>' },
    DialogDescription: {
      template: '<p class="dialog-description"><slot /></p>',
    },
    DialogFooter: { template: '<div class="dialog-footer"><slot /></div>' },
    Button: {
      template:
        '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
      props: ["disabled"],
    },
    Input: {
      template:
        '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keydown.enter="$emit(\'keydown\', $event)" />',
      props: ["modelValue"],
      emits: ["update:modelValue", "keydown"],
    },
    Label: { template: "<label><slot /></label>" },
    RadioGroup: {
      template: '<div role="radiogroup"><slot /></div>',
      props: ["modelValue"],
    },
    RadioGroupItem: {
      template: '<input type="radio" :value="value" />',
      props: ["id", "value"],
    },
    List: { template: '<span class="icon-list" />' },
    LayoutGrid: { template: '<span class="icon-grid" />' },
    Plus: { template: '<span class="icon-plus" />' },
  };

  function mountComponent(
    props: { open: boolean; isSubmitting?: boolean } = { open: true }
  ) {
    return mount(CreateListModal, {
      props,
      global: {
        stubs: globalStubs,
      },
    });
  }

  describe("rendering", () => {
    it("should render component when open", () => {
      const wrapper = mountComponent({ open: true });
      expect(wrapper.exists()).toBe(true);
    });

    it("should not render content when closed", () => {
      const wrapper = mountComponent({ open: false });
      expect(wrapper.find(".dialog-content").exists()).toBe(false);
    });

    it("should display dialog title", () => {
      const wrapper = mountComponent({ open: true });
      expect(wrapper.text()).toContain("Crear Nueva Lista");
    });

    it("should display list type options", () => {
      const wrapper = mountComponent({ open: true });
      expect(wrapper.text()).toContain("Anime List");
      expect(wrapper.text()).toContain("Tier List");
    });
  });

  describe("submit button", () => {
    it("should disable submit when name is empty", () => {
      const wrapper = mountComponent({ open: true });
      const buttons = wrapper.findAll("button");
      const submitButton = buttons.find((b) =>
        b.text().includes("Crear Lista")
      );
      expect(submitButton?.attributes("disabled")).toBeDefined();
    });

    it("should show loading state when submitting", () => {
      const wrapper = mountComponent({ open: true, isSubmitting: true });
      expect(wrapper.text()).toContain("Creando...");
    });
  });

  describe("events", () => {
    it("should emit close event when cancel clicked", async () => {
      const wrapper = mountComponent({ open: true });
      const cancelButton = wrapper
        .findAll("button")
        .find((b) => b.text().includes("Cancelar"));
      await cancelButton?.trigger("click");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
