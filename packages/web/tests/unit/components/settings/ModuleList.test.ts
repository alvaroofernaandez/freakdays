import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ModuleList from "../../../../app/components/settings/ModuleList";

describe("ModuleList.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ModuleList, {
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
