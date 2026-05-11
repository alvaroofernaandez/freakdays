import { describe, it, expect } from "vitest";
import {
  calculateStreakBonus,
  calculateTotalExp,
  DIFFICULTY_EXP,
  type QuestDifficulty,
} from "../../../domain/types/quests";

describe("Quest EXP Calculations", () => {
  describe("DIFFICULTY_EXP constants", () => {
    it("should have correct base EXP for easy difficulty", () => {
      expect(DIFFICULTY_EXP.easy).toBe(10);
    });

    it("should have correct base EXP for medium difficulty", () => {
      expect(DIFFICULTY_EXP.medium).toBe(25);
    });

    it("should have correct base EXP for hard difficulty", () => {
      expect(DIFFICULTY_EXP.hard).toBe(50);
    });

    it("should have correct base EXP for legendary difficulty", () => {
      expect(DIFFICULTY_EXP.legendary).toBe(100);
    });
  });

  describe("calculateStreakBonus", () => {
    it("should return 0 for streak less than 7", () => {
      expect(calculateStreakBonus(0)).toBe(0);
      expect(calculateStreakBonus(3)).toBe(0);
      expect(calculateStreakBonus(6)).toBe(0);
    });

    it("should return 5 for 7-day streak", () => {
      expect(calculateStreakBonus(7)).toBe(5);
    });

    it("should return 10 for 14-day streak", () => {
      expect(calculateStreakBonus(14)).toBe(10);
    });

    it("should return 15 for 21-day streak", () => {
      expect(calculateStreakBonus(21)).toBe(15);
    });

    it("should handle partial weeks correctly", () => {
      expect(calculateStreakBonus(10)).toBe(5);
      expect(calculateStreakBonus(20)).toBe(10);
    });
  });

  describe("calculateTotalExp", () => {
    it("should return base EXP with no streak bonus", () => {
      const difficulties: QuestDifficulty[] = [
        "easy",
        "medium",
        "hard",
        "legendary",
      ];

      difficulties.forEach((difficulty) => {
        expect(calculateTotalExp(difficulty, 0)).toBe(
          DIFFICULTY_EXP[difficulty]
        );
      });
    });

    it("should add streak bonus to base EXP", () => {
      expect(calculateTotalExp("easy", 7)).toBe(15);
      expect(calculateTotalExp("medium", 14)).toBe(35);
      expect(calculateTotalExp("hard", 21)).toBe(65);
      expect(calculateTotalExp("legendary", 28)).toBe(120);
    });
  });
});
