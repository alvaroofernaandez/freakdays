import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ConfirmDisableDialog from "../../../../app/components/settings/ConfirmDisableDialog";

describe("ConfirmDisableDialog.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ConfirmDisableDialog, {
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
