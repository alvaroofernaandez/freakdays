import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ModuleGrid from "../../../../app/components/index/ModuleGrid";

describe("ModuleGrid.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ModuleGrid, {
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
