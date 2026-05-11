import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PartyEmptyState from "../../../../app/components/party/PartyEmptyState";

describe("PartyEmptyState.vue", () => {
  it("should render component", () => {
    const wrapper = mount(PartyEmptyState, {
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
