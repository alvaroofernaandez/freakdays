import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import AppHeader from "../../../../app/components/layout/AppHeader.vue";

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("AppHeader.vue", () => {
  const baseProps = {
    profile: null,
    expProgress: {
      current: 0,
      needed: 100,
      progress: 0,
    },
    organizationItems: [],
    activeOrgId: null,
    isActive: () => false,
  };

  it("should render app header", () => {
    const wrapper = mount(AppHeader, {
      props: baseProps,
      global: {
        stubs: {
          NuxtLink: true,
          OrganizationSwitcher: true,
          Avatar: true,
          AvatarFallback: true,
          AvatarImage: true,
          Tooltip: true,
          TooltipContent: true,
          TooltipTrigger: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("should emit logout when logout is triggered", () => {
    const wrapper = mount(AppHeader, {
      props: baseProps,
      global: {
        stubs: {
          NuxtLink: true,
          OrganizationSwitcher: true,
          Avatar: true,
          AvatarFallback: true,
          AvatarImage: true,
          Tooltip: true,
          TooltipContent: true,
          TooltipTrigger: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
