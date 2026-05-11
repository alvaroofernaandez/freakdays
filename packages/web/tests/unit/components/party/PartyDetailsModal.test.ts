import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PartyDetailsModal from "../../../../app/components/party/PartyDetailsModal";

describe("PartyDetailsModal.vue", () => {
  it("should render component", () => {
    const wrapper = mount(PartyDetailsModal, {
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
