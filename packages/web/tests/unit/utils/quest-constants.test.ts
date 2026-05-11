import { describe, it, expect } from "vitest";
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
} from "../../../app/utils/quest-constants";
import type { QuestDifficulty } from "../../../domain/types";

describe("quest-constants", () => {
  describe("DIFFICULTY_COLORS", () => {
    it("should have colors for all difficulties", () => {
      const difficulties: QuestDifficulty[] = [
        "easy",
        "medium",
        "hard",
        "legendary",
      ];

      difficulties.forEach((difficulty) => {
        expect(DIFFICULTY_COLORS[difficulty]).toBeDefined();
        expect(typeof DIFFICULTY_COLORS[difficulty]).toBe("string");
      });
    });

    it("should have correct color classes", () => {
      expect(DIFFICULTY_COLORS.easy).toContain("exp-easy");
      expect(DIFFICULTY_COLORS.medium).toContain("exp-medium");
      expect(DIFFICULTY_COLORS.hard).toContain("exp-hard");
      expect(DIFFICULTY_COLORS.legendary).toContain("exp-legendary");
    });

    it("should include bg, text, and border classes", () => {
      Object.values(DIFFICULTY_COLORS).forEach((color) => {
        expect(color).toContain("bg-");
        expect(color).toContain("text-");
        expect(color).toContain("border-");
      });
    });
  });

  describe("DIFFICULTY_LABELS", () => {
    it("should have labels for all difficulties", () => {
      const difficulties: QuestDifficulty[] = [
        "easy",
        "medium",
        "hard",
        "legendary",
      ];

      difficulties.forEach((difficulty) => {
        expect(DIFFICULTY_LABELS[difficulty]).toBeDefined();
        expect(typeof DIFFICULTY_LABELS[difficulty]).toBe("string");
      });
    });

    it("should have correct Spanish labels", () => {
      expect(DIFFICULTY_LABELS.easy).toBe("Fácil");
      expect(DIFFICULTY_LABELS.medium).toBe("Normal");
      expect(DIFFICULTY_LABELS.hard).toBe("Difícil");
      expect(DIFFICULTY_LABELS.legendary).toBe("Legendaria");
    });
  });
});
