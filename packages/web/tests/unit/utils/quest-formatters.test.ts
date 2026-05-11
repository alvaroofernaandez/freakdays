import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  formatDueDate,
  formatDueTime,
  getTimeRemaining,
} from "../../../app/utils/quest-formatters";
import type { Quest } from "../../../domain/types";

describe("quest-formatters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatDueDate", () => {
    it("should return empty string when no dueDate", () => {
      const quest: Quest = {
        id: "1",
        title: "Test",
        description: "Test",
        difficulty: "easy",
        exp: 10,
        status: "pending",
        streak: 0,
        dueDate: null,
        dueTime: null,
        reminderMinutesBefore: null,
        createdAt: new Date(),
        completedAt: null,
      };

      expect(formatDueDate(quest)).toBe("");
    });

    it('should return "Hoy" for today', () => {
      const today = new Date();
      const quest: Quest = {
        id: "1",
        title: "Test",
        description: "Test",
        difficulty: "easy",
        exp: 10,
        status: "pending",
        streak: 0,
        dueDate: today,
        dueTime: null,
        reminderMinutesBefore: null,
        createdAt: new Date(),
        completedAt: null,
      };

      vi.setSystemTime(today);
      expect(formatDueDate(quest)).toBe("Hoy");
    });

    it('should return "Mañana" for tomorrow', () => {
      const today = new Date("2024-01-15");
      const tomorrow = new Date("2024-01-16");
      const quest: Quest = {
        id: "1",
        title: "Test",
        description: "Test",
        difficulty: "easy",
        exp: 10,
        status: "pending",
        streak: 0,
        dueDate: tomorrow,
        dueTime: null,
        reminderMinutesBefore: null,
        createdAt: new Date(),
        completedAt: null,
      };

      vi.setSystemTime(today);
      expect(formatDueDate(quest)).toBe("Mañana");
    });

    it("should format date for other days", () => {
      const quest: Quest = {
        id: "1",
        title: "Test",
        description: "Test",
        difficulty: "easy",
        exp: 10,
        status: "pending",
        streak: 0,
        dueDate: new Date("2024-01-20"),
        dueTime: null,
        reminderMinutesBefore: null,
        createdAt: new Date(),
        completedAt: null,
      };

      vi.setSystemTime(new Date("2024-01-15"));
      const result = formatDueDate(quest);

      expect(result).toContain("sáb");
      expect(result).toContain("20");
      expect(result).toContain("ene");
    });
  });

  describe("formatDueTime", () => {
    it("should return empty string when no dueTime", () => {
      const quest: Quest = {
        id: "1",
        title: "Test",
        description: "Test",
        difficulty: "easy",
        exp: 10,
        status: "pending",
        streak: 0,
        dueDate: null,
        dueTime: null,
        reminderMinutesBefore: null,
        createdAt: new Date(),
        completedAt: null,
      };

      expect(formatDueTime(quest)).toBe("");
    });

    it("should return time in HH:mm format", () => {
      const quest: Quest = {
        id: "1",
        title: "Test",
        description: "Test",
        difficulty: "easy",
        exp: 10,
        status: "pending",
        streak: 0,
        dueDate: null,
        dueTime: "14:30:00",
        reminderMinutesBefore: null,
        createdAt: new Date(),
        completedAt: null,
      };

      expect(formatDueTime(quest)).toBe("14:30");
    });

    it("should handle time without seconds", () => {
      const quest: Quest = {
        id: "1",
        title: "Test",
        description: "Test",
        difficulty: "easy",
        exp: 10,
        status: "pending",
        streak: 0,
        dueDate: null,
        dueTime: "09:15",
        reminderMinutesBefore: null,
        createdAt: new Date(),
        completedAt: null,
      };

      expect(formatDueTime(quest)).toBe("09:15");
    });
  });

  describe("getTimeRemaining", () => {
    it("should return empty string when no dueDate", () => {
      const quest: Quest = {
        id: "1",
        title: "Test",
        description: "Test",
        difficulty: "easy",
        exp: 10,
        status: "pending",
        streak: 0,
        dueDate: null,
        dueTime: null,
        reminderMinutesBefore: null,
        createdAt: new Date(),
        completedAt: null,
      };

      expect(getTimeRemaining(quest)).toBe("");
    });

    it('should return "Atrasada" for past dates', () => {
      const pastDate = new Date("2024-01-10");
      const quest: Quest = {
        id: "1",
        title: "Test",
        description: "Test",
        difficulty: "easy",
        exp: 10,
        status: "pending",
        streak: 0,
        dueDate: pastDate,
        dueTime: null,
        reminderMinutesBefore: null,
        createdAt: new Date(),
        completedAt: null,
      };

      vi.setSystemTime(new Date("2024-01-15"));
      expect(getTimeRemaining(quest)).toBe("Atrasada");
    });

    it("should return hours and minutes format", () => {
      const futureDate = new Date("2024-01-15T15:30:00");
      const quest: Quest = {
        id: "1",
        title: "Test",
        description: "Test",
        difficulty: "easy",
        exp: 10,
        status: "pending",
        streak: 0,
        dueDate: futureDate,
        dueTime: "15:30",
        reminderMinutesBefore: null,
        createdAt: new Date(),
        completedAt: null,
      };

      vi.setSystemTime(new Date("2024-01-15T14:00:00"));
      const result = getTimeRemaining(quest);

      expect(result).toContain("h");
      expect(result).toContain("m");
    });

    it("should return only minutes when less than an hour", () => {
      const futureDate = new Date("2024-01-15T14:30:00");
      const quest: Quest = {
        id: "1",
        title: "Test",
        description: "Test",
        difficulty: "easy",
        exp: 10,
        status: "pending",
        streak: 0,
        dueDate: futureDate,
        dueTime: "14:30",
        reminderMinutesBefore: null,
        createdAt: new Date(),
        completedAt: null,
      };

      vi.setSystemTime(new Date("2024-01-15T14:15:00"));
      const result = getTimeRemaining(quest);

      expect(result).toBe("15m");
    });
  });
});
