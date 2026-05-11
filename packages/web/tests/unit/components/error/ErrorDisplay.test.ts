import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ErrorDisplay from "../../../../app/components/error/ErrorDisplay";

describe("ErrorDisplay.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ErrorDisplay, {
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
