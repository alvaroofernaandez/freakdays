import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useQuests } from "../../../app/composables/useQuests";
import { useAuthStore } from "../../../stores/auth";

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  normalizeApiError: vi.fn((error: unknown) =>
    typeof error === "object" && error !== null
      ? (error as { message: string })
      : { message: "error" }
  ),
};

const mockAuthRefresh = vi.fn().mockResolvedValue(undefined);

vi.mock("../../../app/composables/useApiClient", () => ({
  useApiClient: () => mockApi,
}));

vi.mock("../../../app/composables/useAuthContext", () => ({
  useAuthContext: () => ({
    refresh: mockAuthRefresh,
  }),
}));

describe("useQuests", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("fetchQuests", () => {
    it("retorna [] cuando no hay sesión", async () => {
      const authStore = useAuthStore();
      authStore.setSession(null);

      const questsApi = useQuests();
      const quests = await questsApi.fetchQuests();

      expect(quests).toEqual([]);
      expect(mockApi.get).not.toHaveBeenCalled();
    });

    it("consume GET /v1/quests y mapea quests", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.get.mockResolvedValue([
        {
          id: "1",
          title: "Test Quest",
          description: "desc",
          difficulty: "easy",
          expReward: 10,
          dueDate: null,
          dueTime: null,
          reminderMinutesBefore: null,
          createdAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
          updatedAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
        },
      ]);

      const questsApi = useQuests();
      const quests = await questsApi.fetchQuests();

      expect(mockApi.get).toHaveBeenCalledWith("/v1/quests", {
        requireOrg: true,
      });
      expect(quests).toHaveLength(1);
      expect(quests[0]?.title).toBe("Test Quest");
    });
  });

  describe("createQuest", () => {
    it("retorna null cuando no hay sesión", async () => {
      const authStore = useAuthStore();
      authStore.setSession(null);

      const questsApi = useQuests();
      const result = await questsApi.createQuest({
        title: "Test",
        difficulty: "easy",
        exp_reward: 10,
      });

      expect(result).toBeNull();
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it("crea quest con POST /v1/quests", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.post.mockResolvedValue({
        id: "1",
        title: "Test Quest",
        description: null,
        difficulty: "easy",
        expReward: 10,
        dueDate: null,
        dueTime: null,
        reminderMinutesBefore: null,
        createdAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
        updatedAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
      });

      const questsApi = useQuests();
      const result = await questsApi.createQuest({
        title: "Test Quest",
        difficulty: "easy",
        exp_reward: 10,
      });

      expect(result?.title).toBe("Test Quest");
      expect(mockApi.post).toHaveBeenCalledWith(
        "/v1/quests",
        {
          title: "Test Quest",
          difficulty: "easy",
          exp_reward: 10,
        },
        { requireOrg: true }
      );
    });
  });

  describe("completeQuest", () => {
    it("retorna 0 cuando no hay sesión", async () => {
      const authStore = useAuthStore();
      authStore.setSession(null);

      const questsApi = useQuests();
      const exp = await questsApi.completeQuest("1");

      expect(exp).toBe(0);
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it("completa quest con POST /v1/quests/:id/complete", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.post.mockResolvedValue({ expEarned: 10 });

      const questsApi = useQuests();
      const exp = await questsApi.completeQuest("1", 3);

      expect(exp).toBe(10);
      expect(mockApi.post).toHaveBeenCalledWith(
        "/v1/quests/1/complete",
        { streakCount: 3 },
        { requireOrg: true }
      );
    });
  });

  describe("notifications", () => {
    it("lista notificaciones desde GET /v1/quests/notifications", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.get.mockResolvedValue([
        {
          id: "notif-1",
          quest_id: "quest-1",
          notification_type: "reminder",
          message: "Recordatorio",
          sent_at: new Date("2026-03-05T10:00:00.000Z").toISOString(),
          read_at: null,
        },
      ]);

      const questsApi = useQuests();
      const notifications = await questsApi.fetchNotifications();

      expect(mockApi.get).toHaveBeenCalledWith("/v1/quests/notifications", {
        requireOrg: true,
      });
      expect(notifications).toHaveLength(1);
      expect(notifications[0]?.quest_id).toBe("quest-1");
    });

    it("marca lectura con PATCH /v1/quests/notifications/:id", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.patch.mockResolvedValue({ success: true });

      const questsApi = useQuests();
      const result = await questsApi.markNotificationRead("notif-1");

      expect(result).toBe(true);
      expect(mockApi.patch).toHaveBeenCalledWith(
        "/v1/quests/notifications/notif-1",
        undefined,
        { requireOrg: true }
      );
    });
  });

  describe("notifications check migration", () => {
    it("usa endpoint API-first para overdue check", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.post.mockResolvedValue({ updatedCount: 3 });

      const questsApi = useQuests();
      await questsApi.checkOverdueQuests();

      expect(mockApi.post).toHaveBeenCalledWith(
        "/v1/quests/notifications/overdue/check",
        undefined,
        { requireOrg: true }
      );
    });

    it("si endpoint due-soon falla propaga error normalizado", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.post.mockRejectedValue({ statusCode: 404, message: "Not found" });

      const questsApi = useQuests();
      await expect(questsApi.checkQuestsDueSoon()).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
