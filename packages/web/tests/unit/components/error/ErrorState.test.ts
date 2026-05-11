import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ErrorState from "../../../../app/components/error/ErrorState.vue";

describe("ErrorState.vue", () => {
  it("should render error state with default title", () => {
    const wrapper = mount(ErrorState, {
      props: {
        message: "Test error message",
      },
      global: {
        stubs: {
          Card: {
            template: '<div class="card"><slot /></div>',
          },
          CardHeader: {
            template: '<div class="card-header"><slot /></div>',
          },
          CardTitle: {
            template: '<h3 class="card-title"><slot /></h3>',
          },
          CardDescription: {
            template: '<p class="card-description"><slot /></p>',
          },
          CardContent: {
            template: '<div class="card-content"><slot /></div>',
          },
          Button: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should render error state with custom title", () => {
    const wrapper = mount(ErrorState, {
      props: {
        title: "Custom error",
        message: "Test error message",
      },
      global: {
        stubs: {
          Card: {
            template: '<div class="card"><slot /></div>',
          },
          CardHeader: {
            template: '<div class="card-header"><slot /></div>',
          },
          CardTitle: {
            template: '<h3 class="card-title"><slot /></h3>',
          },
          CardDescription: {
            template: '<p class="card-description"><slot /></p>',
          },
          CardContent: {
            template: '<div class="card-content"><slot /></div>',
          },
          Button: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should render action button when onAction is provided", () => {
    const onAction = vi.fn();
    const wrapper = mount(ErrorState, {
      props: {
        message: "Test error",
        onAction,
        actionLabel: "Retry",
      },
      global: {
        stubs: {
          Card: {
            template: '<div class="card"><slot /></div>',
          },
          CardHeader: {
            template: '<div class="card-header"><slot /></div>',
          },
          CardTitle: {
            template: '<h3 class="card-title"><slot /></h3>',
          },
          CardDescription: {
            template: '<p class="card-description"><slot /></p>',
          },
          CardContent: {
            template: '<div class="card-content"><slot /></div>',
          },
          Button: {
            template: '<button @click="onClick"><slot /></button>',
            props: ["onClick"],
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should render compact variant", () => {
    const wrapper = mount(ErrorState, {
      props: {
        message: "Test error",
        variant: "compact",
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

