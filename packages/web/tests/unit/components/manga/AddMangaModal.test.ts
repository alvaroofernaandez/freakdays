import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AddMangaModal from "../../../../app/components/manga/AddMangaModal";

describe("AddMangaModal.vue", () => {
  it("should render component", () => {
    const wrapper = mount(AddMangaModal, {
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
