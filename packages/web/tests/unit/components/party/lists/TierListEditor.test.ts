import { mount, VueWrapper } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import TierListEditor from "../../../../../app/components/party/lists/TierListEditor.vue";
import type { PartySharedList } from "../../../../../domain/types/party";

vi.mock("@/composables/useToast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock("vuedraggable", () => ({
  default: {
    name: "draggable",
    template: "<div><slot></slot></div>",
    props: ["modelValue", "group", "itemKey", "disabled"],
  },
}));

describe("TierListEditor.vue", () => {
  const mockList: PartySharedList = {
    id: "list-1",
    partyId: "party-1",
    name: "Test Tier List",
    listType: "tier_list",
    content: null,
    createdBy: "user-1",
    createdAt: new Date(),
  };

  const mockListWithContent: PartySharedList = {
    ...mockList,
    content: {
      tiers: [
        { id: "s", name: "S", color: "#FF7F7F", items: [] },
        {
          id: "a",
          name: "A",
          color: "#FFBF7F",
          items: [
            { id: "item-1", content: "Test Item", type: "text" as const },
          ],
        },
      ],
      pool: [{ id: "pool-1", content: "Pool Item", type: "text" as const }],
    },
  };

  const globalStubs = {
    Button: { template: "<button><slot /></button>" },
    Input: {
      template:
        '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ["modelValue"],
    },
    Label: { template: "<label><slot /></label>" },
    draggable: {
      template: '<div class="draggable"><slot /></div>',
      props: ["modelValue", "group", "itemKey", "disabled"],
    },
    ChevronUp: { template: '<span class="icon-up" />' },
    ChevronDown: { template: '<span class="icon-down" />' },
    LayoutGrid: { template: '<span class="icon-grid" />' },
    Pencil: { template: '<span class="icon-pencil" />' },
    Plus: { template: '<span class="icon-plus" />' },
    Save: { template: '<span class="icon-save" />' },
    Trash2: { template: '<span class="icon-trash" />' },
    AlertCircle: { template: '<span class="icon-alert" />' },
  };

  function mountComponent(list: PartySharedList = mockList): VueWrapper {
    return mount(TierListEditor, {
      props: {
        list,
        partyId: "party-1",
      },
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

    it("should display list name in input", async () => {
      const wrapper = mountComponent();
      await nextTick();
      const nameInput = wrapper.find(
        'input[aria-label="Nombre de la tier list"]'
      );
      expect(nameInput.exists()).toBe(true);
    });

    it("should create default tiers when content is empty", async () => {
      const wrapper = mountComponent();
      await nextTick();
      const tierElements = wrapper.findAll(
        '[role="group"][aria-label^="Tier "]'
      );
      expect(tierElements.length).toBe(4);
    });

    it("should load existing tiers from content", async () => {
      const wrapper = mountComponent(mockListWithContent);
      await nextTick();
      const tierElements = wrapper.findAll(
        '[role="group"][aria-label^="Tier "]'
      );
      expect(tierElements.length).toBe(2);
    });
  });

  describe("addTier", () => {
    it("should add a new tier when clicking add tier button", async () => {
      const wrapper = mountComponent();
      await nextTick();

      const initialTiers = wrapper.findAll('[role="group"]');
      const initialCount = initialTiers.length;

      const addButton = wrapper.find('button[aria-label="Añadir nuevo tier"]');
      expect(addButton.exists()).toBe(true);
      await addButton.trigger("click");
      await nextTick();

      const newTiers = wrapper.findAll('[role="group"]');
      expect(newTiers.length).toBe(initialCount + 1);
    });
  });

  describe("removeTier", () => {
    it("should render delete button for each tier", async () => {
      const wrapper = mountComponent();
      await nextTick();

      const deleteButtons = wrapper.findAll(
        'button[aria-label^="Eliminar tier"]'
      );
      expect(deleteButtons.length).toBe(4);
    });

    it("should remove tier when clicking delete button", async () => {
      const wrapper = mountComponent();
      await nextTick();

      const initialTiers = wrapper.findAll('[role="group"]');
      const initialCount = initialTiers.length;

      const deleteButtons = wrapper.findAll(
        'button[aria-label^="Eliminar tier"]'
      );
      await deleteButtons[0]?.trigger("click");
      await nextTick();

      const newTiers = wrapper.findAll('[role="group"]');
      expect(newTiers.length).toBe(initialCount - 1);
    });
  });

  describe("moveTier", () => {
    it("should not show move up button for first tier", async () => {
      const wrapper = mountComponent();
      await nextTick();

      const firstTier = wrapper.findAll('[role="group"]')[0];
      const moveUpButton = firstTier?.find('button[aria-label*="arriba"]');
      expect(moveUpButton?.exists()).toBeFalsy();
    });

    it("should not show move down button for last tier", async () => {
      const wrapper = mountComponent();
      await nextTick();

      const tiers = wrapper.findAll('[role="group"]');
      const lastTier = tiers[tiers.length - 1];
      const moveDownButton = lastTier?.find('button[aria-label*="abajo"]');
      expect(moveDownButton?.exists()).toBeFalsy();
    });

    it("should show move up button for non-first tiers", async () => {
      const wrapper = mountComponent();
      await nextTick();

      const secondTier = wrapper.findAll('[role="group"]')[1];
      const moveUpButton = secondTier?.find('button[aria-label*="arriba"]');
      expect(moveUpButton?.exists()).toBe(true);
    });

    it("should show move down button for non-last tiers", async () => {
      const wrapper = mountComponent();
      await nextTick();

      const firstTier = wrapper.findAll('[role="group"]')[0];
      const moveDownButton = firstTier?.find('button[aria-label*="abajo"]');
      expect(moveDownButton?.exists()).toBe(true);
    });
  });

  describe("pool items", () => {
    it("should show empty state when pool is empty", async () => {
      const wrapper = mountComponent();
      await nextTick();

      const emptyText = wrapper.text();
      expect(emptyText).toContain("No hay items sin clasificar");
    });

    it("should display pool items count", async () => {
      const wrapper = mountComponent(mockListWithContent);
      await nextTick();

      const poolCount = wrapper.find('[aria-label*="items sin clasificar"]');
      expect(poolCount.text()).toContain("1");
    });
  });

  describe("save button", () => {
    it("should render save button", async () => {
      const wrapper = mountComponent();
      await nextTick();

      const saveButton = wrapper.find(
        'button[aria-label="Guardar cambios en la tier list"]'
      );
      expect(saveButton.exists()).toBe(true);
      expect(saveButton.text()).toContain("Guardar");
    });
  });

  describe("accessibility", () => {
    it("should have proper aria labels", async () => {
      const wrapper = mountComponent();
      await nextTick();

      expect(wrapper.find('[role="main"]').exists()).toBe(true);
      expect(wrapper.find('[aria-label="Editor de Tier List"]').exists()).toBe(
        true
      );
      expect(
        wrapper.find('[aria-label="Tiers de clasificación"]').exists()
      ).toBe(true);
    });
  });
});
