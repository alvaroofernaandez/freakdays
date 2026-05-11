import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getGreeting } from "../../../app/utils/greeting";

describe("greeting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getGreeting", () => {
    it('should return "¡Buenos días" for morning hours', () => {
      const morningHours = [0, 6, 11];

      morningHours.forEach((hour) => {
        const date = new Date(2024, 0, 15, hour, 0, 0);
        vi.setSystemTime(date);

        expect(getGreeting()).toBe("¡Buenos días");
      });
    });

    it('should return "¡Buenas tardes" for afternoon hours', () => {
      const afternoonHours = [12, 15, 17];

      afternoonHours.forEach((hour) => {
        const date = new Date(2024, 0, 15, hour, 0, 0);
        vi.setSystemTime(date);

        expect(getGreeting()).toBe("¡Buenas tardes");
      });
    });

    it('should return "¡Buenas noches" for evening hours', () => {
      const eveningHours = [18, 20, 23];

      eveningHours.forEach((hour) => {
        const date = new Date(2024, 0, 15, hour, 0, 0);
        vi.setSystemTime(date);

        expect(getGreeting()).toBe("¡Buenas noches");
      });
    });

    it('should return "¡Buenos días" at 11:59', () => {
      const date = new Date(2024, 0, 15, 11, 59, 59);
      vi.setSystemTime(date);

      expect(getGreeting()).toBe("¡Buenos días");
    });

    it('should return "¡Buenas tardes" at 12:00', () => {
      const date = new Date(2024, 0, 15, 12, 0, 0);
      vi.setSystemTime(date);

      expect(getGreeting()).toBe("¡Buenas tardes");
    });

    it('should return "¡Buenas tardes" at 17:59', () => {
      const date = new Date(2024, 0, 15, 17, 59, 59);
      vi.setSystemTime(date);

      expect(getGreeting()).toBe("¡Buenas tardes");
    });

    it('should return "¡Buenas noches" at 18:00', () => {
      const date = new Date(2024, 0, 15, 18, 0, 0);
      vi.setSystemTime(date);

      expect(getGreeting()).toBe("¡Buenas noches");
    });
  });
});
