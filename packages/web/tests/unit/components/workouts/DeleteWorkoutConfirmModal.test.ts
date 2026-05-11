import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import DeleteWorkoutConfirmModal from "../../../../app/components/workouts/DeleteWorkoutConfirmModal.vue";
import type { Workout } from "../../../../app/composables/useWorkouts";

describe("DeleteWorkoutConfirmModal.vue", () => {
  const mockWorkout: Workout = {
    id: "workout-1",
    name: "Leg Day",
    description: "Focus on legs",
    exercises: [],
    workoutDate: new Date(),
    durationMinutes: 60,
    notes: "Good workout",
    status: "completed",
    startedAt: new Date(),
    completedAt: new Date(),
  };

  const globalStubs = {
    ClientOnly: { template: "<div><slot /></div>" },
    Teleport: { template: "<div><slot /></div>" },
    Transition: { template: "<div><slot /></div>" },
    Card: { template: '<div class="card" role="document"><slot /></div>' },
    CardHeader: { template: '<div class="card-header"><slot /></div>' },
    CardTitle: { template: '<h2 class="card-title"><slot /></h2>' },
    CardDescription: { template: '<p class="card-description"><slot /></p>' },
    CardContent: { template: '<div class="card-content"><slot /></div>' },
    Button: {
      template:
        '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
      props: ["disabled", "variant"],
    },
    Trash2: { template: '<span class="icon-trash" />' },
    Dumbbell: { template: '<span class="icon-dumbbell" />' },
  };

  function mountComponent(
    props: {
      open: boolean;
      workout: Workout | null;
      isSubmitting: boolean;
    } = {
      open: true,
      workout: mockWorkout,
      isSubmitting: false,
    }
  ) {
    return mount(DeleteWorkoutConfirmModal, {
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
        workout: null,
        isSubmitting: false,
      });
      expect(wrapper.find(".card").exists()).toBe(false);
    });

    it("should display delete confirmation title", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Eliminar Entrenamiento");
    });

    it("should display workout name in confirmation", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Leg Day");
    });

    it("should show warning message", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Esta acción no se puede deshacer");
    });
  });

  describe("buttons", () => {
    it("should have cancel and confirm buttons", () => {
      const wrapper = mountComponent();
      expect(wrapper.text()).toContain("Cancelar");
      expect(wrapper.text()).toContain("Eliminar");
    });

    it("should show loading state when submitting", () => {
      const wrapper = mountComponent({
        open: true,
        workout: mockWorkout,
        isSubmitting: true,
      });
      expect(wrapper.text()).toContain("Eliminando...");
    });

    it("should disable buttons when submitting", () => {
      const wrapper = mountComponent({
        open: true,
        workout: mockWorkout,
        isSubmitting: true,
      });
      const buttons = wrapper.findAll("button");
      buttons.forEach((button) => {
        expect(button.attributes("disabled")).toBeDefined();
      });
    });
  });

  describe("events", () => {
    it("should emit close when cancel clicked", async () => {
      const wrapper = mountComponent();
      const cancelButton = wrapper
        .findAll("button")
        .find((b) => b.text().includes("Cancelar"));
      await cancelButton?.trigger("click");
      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("should emit confirm with workout id when confirm clicked", async () => {
      const wrapper = mountComponent();
      const confirmButton = wrapper
        .findAll("button")
        .find((b) => b.text().includes("Eliminar"));
      await confirmButton?.trigger("click");
      expect(wrapper.emitted("confirm")).toBeTruthy();
      expect(wrapper.emitted("confirm")?.[0]).toEqual(["workout-1"]);
    });
  });

  describe("accessibility", () => {
    it("should have dialog role", () => {
      const wrapper = mountComponent();
      expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    });

    it("should have aria-modal attribute", () => {
      const wrapper = mountComponent();
      expect(wrapper.find('[aria-modal="true"]').exists()).toBe(true);
    });
  });
});
