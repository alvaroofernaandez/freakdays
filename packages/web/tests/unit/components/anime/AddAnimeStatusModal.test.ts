import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AddAnimeStatusModal from "../../../../app/components/anime/AddAnimeStatusModal";

describe("AddAnimeStatusModal.vue", () => {
  it("should render component", () => {
    const wrapper = mount(AddAnimeStatusModal, {
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
