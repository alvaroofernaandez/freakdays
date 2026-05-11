import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { getAllNavItems } from "../../../app/utils/nav-items";
import { useModulesStore } from "../../../stores/modules";

describe("nav-items", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("getAllNavItems", () => {
    it("should always include home item", () => {
      const store = useModulesStore();
      const items = getAllNavItems(store);

      expect(items.length).toBeGreaterThan(0);
      expect(items[0].to).toBe("/");
      expect(items[0].label).toBe("Inicio");
    });

    it("should not include module items when all modules are disabled", () => {
      const store = useModulesStore();
      const items = getAllNavItems(store);

      expect(items.length).toBe(1);
      expect(items[0].to).toBe("/");
    });

    it("should include enabled modules", () => {
      const store = useModulesStore();
      store.setModule("quests", true);
      store.setModule("anime", true);

      const items = getAllNavItems(store);

      expect(items.length).toBe(3);
      expect(items[0].to).toBe("/");
      expect(items.some((item) => item.to === "/quests")).toBe(true);
      expect(items.some((item) => item.to === "/anime")).toBe(true);
    });

    it("should include correct labels for enabled modules", () => {
      const store = useModulesStore();
      store.setModule("quests", true);
      store.setModule("anime", true);
      store.setModule("manga", true);

      const items = getAllNavItems(store);

      const questsItem = items.find((item) => item.to === "/quests");
      const animeItem = items.find((item) => item.to === "/anime");
      const mangaItem = items.find((item) => item.to === "/manga");

      expect(questsItem?.label).toBe("Quests");
      expect(animeItem?.label).toBe("Anime");
      expect(mangaItem?.label).toBe("Manga");
    });

    it("should include icons for enabled modules", () => {
      const store = useModulesStore();
      store.setModule("quests", true);

      const items = getAllNavItems(store);

      const questsItem = items.find((item) => item.to === "/quests");
      expect(questsItem?.icon).toBeDefined();
      expect(typeof questsItem?.icon).toBe("function");
    });

    it("should handle errors gracefully", () => {
      const store = useModulesStore();
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const mockStore = {
        ...store,
        getModuleById: () => {
          throw new Error("Test error");
        },
      };

      const items = getAllNavItems(mockStore as typeof store);

      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0].to).toBe("/");
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it("should include all module types when enabled", () => {
      const store = useModulesStore();
      store.setModule("workouts", true);
      store.setModule("manga", true);
      store.setModule("anime", true);
      store.setModule("quests", true);
      store.setModule("party", true);
      store.setModule("calendar", true);

      const items = getAllNavItems(store);

      expect(items.length).toBe(7);
      expect(items.some((item) => item.to === "/workouts")).toBe(true);
      expect(items.some((item) => item.to === "/manga")).toBe(true);
      expect(items.some((item) => item.to === "/anime")).toBe(true);
      expect(items.some((item) => item.to === "/quests")).toBe(true);
      expect(items.some((item) => item.to === "/party")).toBe(true);
      expect(items.some((item) => item.to === "/calendar")).toBe(true);
    });
  });
});
