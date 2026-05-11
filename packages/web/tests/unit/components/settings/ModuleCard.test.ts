import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ModuleCard from "../../../../app/components/settings/ModuleCard.vue";
import type { AppModule } from "../../../../domain/types";

const mockModule: AppModule = {
  id: "quests",
  name: "Quests",
  description: "Test description",
  icon: "sword",
  enabled: true,
  disabled: false,
};

describe("ModuleCard.vue", () => {
  it("should render component", () => {
    const wrapper = mount(ModuleCard, {
      props: {
        module: mockModule,
      },
      global: {
        stubs: {
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardDescription: true,
          Switch: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
