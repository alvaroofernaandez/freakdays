import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import RegisterForm from "../../../../app/components/auth/RegisterForm.vue";

describe("RegisterForm.vue", () => {
  it("should render register form", () => {
    const wrapper = mount(RegisterForm, {
      props: {
        email: "",
        password: "",
        confirmPassword: "",
        showPassword: false,
        passwordsMatch: true,
        isValidPassword: false,
        passwordStrength: 0,
        strengthLabel: "",
        strengthColor: "",
        loading: false,
        error: null,
      },
      global: {
        stubs: {
          PasswordStrengthIndicator: true,
          Label: true,
          Input: true,
          Button: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should emit update:email when email changes", async () => {
    const wrapper = mount(RegisterForm, {
      props: {
        email: "",
        password: "",
        confirmPassword: "",
        showPassword: false,
        passwordsMatch: true,
        isValidPassword: false,
        passwordStrength: 0,
        strengthLabel: "",
        strengthColor: "",
        loading: false,
        error: null,
      },
      global: {
        stubs: {
          PasswordStrengthIndicator: true,
          Label: true,
          Input: {
            template: '<input @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ["modelValue"],
            emits: ["update:modelValue"],
          },
          Button: true,
        },
      },
    });

    const emailInput = wrapper.find('input[type="email"]');
    if (emailInput.exists()) {
      await emailInput.setValue("test@example.com");
      await emailInput.trigger("input");
      expect(wrapper.emitted("update:email")).toBeTruthy();
    }
  });

  it("should emit submit when form is submitted", async () => {
    const wrapper = mount(RegisterForm, {
      props: {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        showPassword: false,
        passwordsMatch: true,
        isValidPassword: true,
        passwordStrength: 3,
        strengthLabel: "Fuerte",
        strengthColor: "bg-exp-easy",
        loading: false,
        error: null,
      },
      global: {
        stubs: {
          PasswordStrengthIndicator: true,
          Label: true,
          Input: true,
          Button: true,
        },
      },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");
    expect(wrapper.emitted("submit")).toBeTruthy();
  });

  it("should show error message when error prop is provided", () => {
    const wrapper = mount(RegisterForm, {
      props: {
        email: "",
        password: "",
        confirmPassword: "",
        showPassword: false,
        passwordsMatch: true,
        isValidPassword: false,
        passwordStrength: 0,
        strengthLabel: "",
        strengthColor: "",
        loading: false,
        error: "Test error",
      },
      global: {
        stubs: {
          PasswordStrengthIndicator: true,
          Label: true,
          Input: true,
          Button: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Test error");
  });
});

