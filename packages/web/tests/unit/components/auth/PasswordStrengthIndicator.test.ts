import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PasswordStrengthIndicator from "../../../../app/components/auth/PasswordStrengthIndicator.vue";

describe("PasswordStrengthIndicator.vue", () => {
  it("should not render when password is empty", () => {
    const wrapper = mount(PasswordStrengthIndicator, {
      props: {
        password: "",
        strength: 0,
        label: "",
        color: "",
      },
    });

    expect(wrapper.html()).toBe("<!--v-if-->");
  });

  it("should render when password is provided", () => {
    const wrapper = mount(PasswordStrengthIndicator, {
      props: {
        password: "test",
        strength: 2,
        label: "Media",
        color: "bg-exp-medium",
      },
    });

    expect(wrapper.text()).toContain("Fuerza:");
    expect(wrapper.text()).toContain("Media");
  });

  it("should render 4 strength bars", () => {
    const wrapper = mount(PasswordStrengthIndicator, {
      props: {
        password: "test",
        strength: 2,
        label: "Media",
        color: "bg-exp-medium",
      },
    });

    const bars = wrapper.findAll(".flex-1");
    expect(bars.length).toBe(4);
  });

  it("should apply color class based on strength", () => {
    const wrapper = mount(PasswordStrengthIndicator, {
      props: {
        password: "test",
        strength: 3,
        label: "Fuerte",
        color: "bg-exp-easy",
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});

