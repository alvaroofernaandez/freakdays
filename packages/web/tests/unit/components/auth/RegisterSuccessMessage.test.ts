import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import RegisterSuccessMessage from "../../../../app/components/auth/RegisterSuccessMessage.vue";

describe("RegisterSuccessMessage.vue", () => {
  it("should render success message", () => {
    const wrapper = mount(RegisterSuccessMessage, {
      global: {
        stubs: {
          Button: true,
          NuxtLink: true,
        },
      },
    });

    expect(wrapper.text()).toContain("¡Cuenta creada!");
  });
});

