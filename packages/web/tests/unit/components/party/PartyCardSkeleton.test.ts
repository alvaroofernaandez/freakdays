import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PartyCardSkeleton from "../../../../app/components/party/PartyCardSkeleton";

describe("PartyCardSkeleton.vue", () => {
  it("should render component", () => {
    const wrapper = mount(PartyCardSkeleton, {
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
