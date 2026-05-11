import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DeletePartyConfirmModal from "../../../../app/components/party/DeletePartyConfirmModal";

describe("DeletePartyConfirmModal.vue", () => {
  it("should render component", () => {
    const wrapper = mount(DeletePartyConfirmModal, {
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
