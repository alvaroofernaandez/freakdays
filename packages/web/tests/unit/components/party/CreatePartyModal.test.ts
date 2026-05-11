import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CreatePartyModal from "../../../../app/components/party/CreatePartyModal";

describe("CreatePartyModal.vue", () => {
  it("should render component", () => {
    const wrapper = mount(CreatePartyModal, {
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
