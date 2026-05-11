import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ErrorBoundary from "../../../../app/components/error/ErrorBoundary";

describe("ErrorBoundary.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ErrorBoundary, {
      global: {
        stubs: {
          NuxtLink: true,
          Button: true,
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardContent: true,
          CardDescription: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
