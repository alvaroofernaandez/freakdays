import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  formatDate,
  formatDuration,
  getElapsedTime,
  getTodayDate,
} from "../../../app/utils/workout-formatters";

describe("workout-formatters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatDate", () => {
    it('should return "Hoy" for today', () => {
      const today = new Date("2024-01-15T12:00:00");
      vi.setSystemTime(today);

      expect(formatDate(today)).toBe("Hoy");
    });

    it('should return "Ayer" for yesterday', () => {
      const today = new Date("2024-01-15T12:00:00");
      const yesterday = new Date("2024-01-14T12:00:00");
      vi.setSystemTime(today);

      expect(formatDate(yesterday)).toBe("Ayer");
    });

    it("should format date for other days", () => {
      const today = new Date("2024-01-15T12:00:00");
      const otherDate = new Date("2024-01-10T12:00:00");
      vi.setSystemTime(today);

      const result = formatDate(otherDate);

      expect(result).toContain("mié");
      expect(result).toContain("10");
      expect(result).toContain("ene");
    });
  });

  describe("formatDuration", () => {
    it('should return "0 min" for null', () => {
      expect(formatDuration(null)).toBe("0 min");
    });

    it("should return minutes format for less than 60 minutes", () => {
      expect(formatDuration(30)).toBe("30 min");
      expect(formatDuration(45)).toBe("45 min");
      expect(formatDuration(59)).toBe("59 min");
    });

    it("should return hours format for 60 minutes", () => {
      expect(formatDuration(60)).toBe("1h");
    });

    it("should return hours and minutes format", () => {
      expect(formatDuration(90)).toBe("1h 30min");
      expect(formatDuration(125)).toBe("2h 5min");
    });

    it("should return only hours when minutes are 0", () => {
      expect(formatDuration(120)).toBe("2h");
      expect(formatDuration(180)).toBe("3h");
    });
  });

  describe("getElapsedTime", () => {
    it('should return "0 min" for null startTime', () => {
      expect(getElapsedTime(null)).toBe("0 min");
    });

    it("should calculate elapsed time correctly", () => {
      const startTime = new Date("2024-01-15T10:00:00");
      const currentTime = new Date("2024-01-15T10:30:00");
      vi.setSystemTime(currentTime);

      expect(getElapsedTime(startTime)).toBe("30 min");
    });

    it("should round elapsed time to minutes", () => {
      const startTime = new Date("2024-01-15T10:00:00");
      const currentTime = new Date("2024-01-15T10:30:45");
      vi.setSystemTime(currentTime);

      expect(getElapsedTime(startTime)).toBe("31 min");
    });

    it("should handle hours elapsed", () => {
      const startTime = new Date("2024-01-15T10:00:00");
      const currentTime = new Date("2024-01-15T12:30:00");
      vi.setSystemTime(currentTime);

      expect(getElapsedTime(startTime)).toBe("2h 30min");
    });
  });

  describe("getTodayDate", () => {
    it("should return today date in ISO format", () => {
      const today = new Date("2024-01-15T12:00:00");
      vi.setSystemTime(today);

      expect(getTodayDate()).toBe("2024-01-15");
    });

    it("should return date without time", () => {
      const today = new Date("2024-01-15T23:59:59");
      vi.setSystemTime(today);

      expect(getTodayDate()).toBe("2024-01-15");
    });
  });
});
