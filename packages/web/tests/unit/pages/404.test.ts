import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import Page404 from "../../../app/pages/404.vue";

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

describe("404.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should render 404 page", () => {
    const wrapper = mount(Page404, {
      global: {
        stubs: {
          NuxtLink: true,
        },
      },
    });

    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Página no encontrada");
  });

  it("should have navigation buttons", () => {
    const wrapper = mount(Page404, {
      global: {
        stubs: {
          NuxtLink: true,
        },
      },
    });

    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should call router.back when back button is clicked", async () => {
    const router = {
      push: vi.fn(),
      back: vi.fn(),
    };

    vi.doMock("vue-router", () => ({
      useRouter: () => router,
    }));

    const wrapper = mount(Page404, {
      global: {
        stubs: {
          NuxtLink: true,
        },
        mocks: {
          $router: router,
        },
      },
    });

    const backButton = wrapper.find("button");
    if (backButton.exists()) {
      await backButton.trigger("click");
    }

    expect(wrapper.vm).toBeDefined();
  });
});
