import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MangaList from "../../../../app/components/manga/MangaList.vue";

describe("MangaList.vue", () => {
  it("should render component", () => {
    const wrapper = mount(MangaList, {
      props: {
        mangas: [],
        loading: false,
      },
      global: {
        stubs: {
          Empty: true,
          MangaCard: true,
          MangaCardSkeleton: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
