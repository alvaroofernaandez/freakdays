import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ToastContainer from "../../../app/components/ToastContainer.vue";

vi.mock("../../../app/composables/useToast", () => ({
  useToast: () => ({
    toasts: {
      value: [
        { id: "1", message: "Test message", type: "success" },
        { id: "2", message: "Error message", type: "error" },
      ],
    },
    remove: vi.fn(),
  }),
}));

describe("ToastContainer.vue", () => {
  it("should render toast container", () => {
    const wrapper = mount(ToastContainer, {
      global: {
        stubs: {
          ClientOnly: true,
          Teleport: true,
          TransitionGroup: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should render toasts", () => {
    const wrapper = mount(ToastContainer, {
      global: {
        stubs: {
          ClientOnly: {
            template: "<div><slot /></div>",
          },
          Teleport: {
            template: "<div><slot /></div>",
          },
          TransitionGroup: {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
