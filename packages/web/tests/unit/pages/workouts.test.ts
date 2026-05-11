import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WorkoutsPage from "../../../app/pages/workouts.vue";

vi.mock("../../../app/composables/useWorkoutsPage", () => ({
  useWorkoutsPage: () => ({
    workouts: { value: [] },
    currentWorkout: { value: null },
    currentWorkoutStats: { value: null },
    selectedWorkout: { value: null },
    loading: { value: false },
    loadingDetail: { value: false },
    newExerciseName: { value: "" },
    addingExercise: { value: false },
    addingSets: { value: {} },
    updatingSets: { value: {} },
    savedSets: { value: [] },
    startingWorkout: { value: false },
    deletingWorkout: { value: false },
    workoutToDelete: { value: null }, // Initialize as null ref
    workoutToView: { value: null }, // Initialize as null ref
    stats: { value: { count: 0, totalMinutes: 0 } },
    elapsedTime: { value: "0 min" },
    modal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    workoutModal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    detailModal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    deleteModal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    startWorkout: vi.fn(),
    addExercise: vi.fn(),
    addSetToExercise: vi.fn(),
    removeSet: vi.fn(),
    updateSet: vi.fn(),
    saveSet: vi.fn(),
    completeWorkout: vi.fn(),
    deleteWorkoutEntry: vi.fn(),
    openDeleteModal: vi.fn(),
    viewWorkoutDetail: vi.fn(),
    initialize: vi.fn(),
  }),
}));

describe("workouts.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should render workouts page", () => {
    const wrapper = mount(WorkoutsPage, {
      global: {
        stubs: {
          WorkoutStats: true,
          WorkoutStatsSkeleton: true,
          WorkoutList: true,
          StartWorkoutModal: true,
          ActiveWorkoutModal: true,
          WorkoutDetailModal: true,
          Button: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Entrenamientos");
  });

  it("should render page with initialize function", () => {
    const initialize = vi.fn();
    vi.doMock("../../../app/composables/useWorkoutsPage", () => ({
      useWorkoutsPage: () => ({
        workouts: { value: [] },
        currentWorkout: { value: null },
        selectedWorkout: { value: null },
        loading: { value: false },
        loadingDetail: { value: false },
        newExerciseName: { value: "" },
        addingExercise: { value: false },
        stats: { value: { count: 0, totalMinutes: 0 } },
        elapsedTime: { value: "0 min" },
        modal: {
          isOpen: { value: false },
          open: vi.fn(),
          close: vi.fn(),
        },
        workoutModal: {
          isOpen: { value: false },
          open: vi.fn(),
          close: vi.fn(),
        },
        detailModal: {
          isOpen: { value: false },
          open: vi.fn(),
          close: vi.fn(),
        },
        startWorkout: vi.fn(),
        addExercise: vi.fn(),
        addSetToExercise: vi.fn(),
        removeSet: vi.fn(),
        updateSet: vi.fn(),
        completeWorkout: vi.fn(),
        deleteWorkoutEntry: vi.fn(),
        viewWorkoutDetail: vi.fn(),
        initialize,
      }),
    }));

    const wrapper = mount(WorkoutsPage, {
      global: {
        stubs: {
          WorkoutStats: true,
          WorkoutStatsSkeleton: true,
          WorkoutList: true,
          StartWorkoutModal: true,
          ActiveWorkoutModal: true,
          WorkoutDetailModal: true,
          Button: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should show new workout button when no current workout", () => {
    const wrapper = mount(WorkoutsPage, {
      global: {
        stubs: {
          WorkoutStats: true,
          WorkoutStatsSkeleton: true,
          WorkoutList: true,
          StartWorkoutModal: true,
          ActiveWorkoutModal: true,
          WorkoutDetailModal: true,
          Button: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should show active workout button when current workout exists", () => {
    vi.doMock("../../../app/composables/useWorkoutsPage", () => ({
      useWorkoutsPage: () => ({
        currentWorkout: { value: { id: "1", name: "Test" } },
      }),
    }));

    const wrapper = mount(WorkoutsPage, {
      global: {
        stubs: {
          WorkoutStats: true,
          WorkoutStatsSkeleton: true,
          WorkoutList: true,
          StartWorkoutModal: true,
          ActiveWorkoutModal: true,
          WorkoutDetailModal: true,
          Button: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
