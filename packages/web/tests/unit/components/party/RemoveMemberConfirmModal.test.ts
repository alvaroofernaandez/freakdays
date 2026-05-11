import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import RemoveMemberConfirmModal from "../../../../app/components/party/RemoveMemberConfirmModal";

describe("RemoveMemberConfirmModal.vue", () => {
  it("should render component", () => {
    const wrapper = mount(RemoveMemberConfirmModal, {
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
