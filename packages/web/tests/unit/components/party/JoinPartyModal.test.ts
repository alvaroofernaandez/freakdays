import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import JoinPartyModal from "../../../../app/components/party/JoinPartyModal";

describe("JoinPartyModal.vue", () => {
  it("should render component", () => {
    const wrapper = mount(JoinPartyModal, {
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
