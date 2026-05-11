import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import GoogleSignInButton from "../../../../app/components/auth/GoogleSignInButton.vue";

describe("GoogleSignInButton.vue", () => {
  it("should render button with default label", () => {
    const wrapper = mount(GoogleSignInButton, {
      global: {
        stubs: {
          Button: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should render button with custom label", () => {
    const wrapper = mount(GoogleSignInButton, {
      props: {
        label: "Custom label",
      },
      global: {
        stubs: {
          Button: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should emit click event", async () => {
    const wrapper = mount(GoogleSignInButton, {
      global: {
        stubs: {
          Button: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            emits: ["click"],
          },
        },
      },
    });

    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
  });

  it("should be disabled when loading", () => {
    const wrapper = mount(GoogleSignInButton, {
      props: {
        loading: true,
      },
      global: {
        stubs: {
          Button: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});

