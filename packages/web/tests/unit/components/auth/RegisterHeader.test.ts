import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import RegisterHeader from "../../../../app/components/auth/RegisterHeader.vue";

describe("RegisterHeader.vue", () => {
  it("should render register header", () => {
    const wrapper = mount(RegisterHeader);

    expect(wrapper.text()).toContain("FreakDays");
    expect(wrapper.text()).toContain("Únete a la aventura");
  });
});

