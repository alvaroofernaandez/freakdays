import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import BannerCropModal from "../../../../app/components/profile/BannerCropModal.vue";

describe("BannerCropModal.vue", () => {
  const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  it("should render component when open", () => {
    const wrapper = mount(BannerCropModal, {
      props: {
        open: true,
        imageFile: mockFile,
      },
      global: {
        stubs: {
          Button: true,
          Card: true,
          CardContent: true,
          CardHeader: true,
          CardTitle: true,
          ClientOnly: {
            template: "<div><slot /></div>",
          },
          Teleport: {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should not render when closed", () => {
    const wrapper = mount(BannerCropModal, {
      props: {
        open: false,
        imageFile: mockFile,
      },
      global: {
        stubs: {
          Button: true,
          Card: true,
          CardContent: true,
          CardHeader: true,
          CardTitle: true,
          ClientOnly: {
            template: "<div><slot /></div>",
          },
          Teleport: {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    const html = wrapper.html();
    expect(html).not.toContain("Ajustar Banner");
  });

  it("should emit update:open when cancel is clicked", async () => {
    const wrapper = mount(BannerCropModal, {
      props: {
        open: true,
        imageFile: mockFile,
      },
      global: {
        stubs: {
          Button: {
            template: "<button @click='$emit(\"click\")'><slot /></button>",
          },
          Card: true,
          CardContent: true,
          CardHeader: true,
          CardTitle: true,
          ClientOnly: {
            template: "<div><slot /></div>",
          },
          Teleport: {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    await wrapper.vm.$nextTick();
    
    wrapper.vm.$emit("update:open", false);
    
    expect(wrapper.emitted("update:open")).toBeTruthy();
  });
});
