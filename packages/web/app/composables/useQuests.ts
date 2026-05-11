import type { Quest, QuestDifficulty } from "~~/domain/types";
import { useAuthStore } from "~~/stores/auth";

export interface CreateQuestDTO {
  title: string;
  description?: string;
  difficulty: QuestDifficulty;
  exp_reward: number;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  due_date?: string;
  due_time?: string;
  reminder_minutes_before?: number;
}

interface ApiQuest {
  id: string;
  title: string;
  description: string | null;
  difficulty: QuestDifficulty;
  expReward: number;
  dueDate: string | null;
  dueTime: string | null;
  reminderMinutesBefore: number | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiQuestCompletionResult {
  expEarned: number;
}

interface ApiQuestNotification {
  id: string;
  quest_id: string;
  notification_type: "overdue" | "reminder" | "due_soon";
  message: string;
  sent_at: string;
  read_at: string | null;
}

export function useQuests() {
  const authStore = useAuthStore();
  const apiClient = useApiClient();
  const authContext = useAuthContext();

  async function refreshAuthContext() {
    try {
      await authContext.refresh();
    } catch {
      // no-op
    }
  }

  async function fetchQuests(): Promise<Quest[]> {
    if (!authStore.userId) return [];

    await refreshAuthContext();

    try {
      const data = await apiClient.get<ApiQuest[]>("/v1/quests", {
        requireOrg: true,
      });
      return data.map(mapApiToQuest);
    } catch (error) {
      console.error("Error fetching quests:", error);
      return [];
    }
  }

  async function fetchTodayCompletions(): Promise<string[]> {
    if (!authStore.userId) return [];

    await refreshAuthContext();

    try {
      return await apiClient.get<string[]>("/v1/quests/completions", {
        requireOrg: true,
      });
    } catch (error) {
      console.error("Error fetching today completions:", error);
      return [];
    }
  }

  async function createQuest(dto: CreateQuestDTO): Promise<Quest | null> {
    if (!authStore.userId) {
      console.error("No user ID available");
      return null;
    }

    if (!dto.title || !dto.title.trim()) {
      console.error("Title is required");
      return null;
    }

    await refreshAuthContext();

    try {
      const data = await apiClient.post<ApiQuest>("/v1/quests", dto, {
        requireOrg: true,
      });
      return mapApiToQuest(data);
    } catch (error) {
      console.error("Error in createQuest:", error);
      throw apiClient.normalizeApiError(error);
    }
  }

  async function completeQuest(
    questId: string,
    streakCount: number = 1
  ): Promise<number> {
    if (!authStore.userId) return 0;

    await refreshAuthContext();

    try {
      const result = await apiClient.post<ApiQuestCompletionResult>(
        `/v1/quests/${questId}/complete`,
        {
          streakCount,
        },
        {
          requireOrg: true,
        }
      );

      return result.expEarned || 0;
    } catch (error) {
      console.error("Error completing quest:", error);
      return 0;
    }
  }

  async function getQuestById(id: string): Promise<Quest | null> {
    try {
      const quests = await fetchQuests();
      return quests.find((q) => q.id === id) || null;
    } catch (error) {
      console.error("Error fetching quest:", error);
      return null;
    }
  }

  async function deleteQuest(id: string): Promise<boolean> {
    await refreshAuthContext();

    try {
      await apiClient.patch<{ success: true }>(
        `/v1/quests/${id}`,
        {
          active: false,
        },
        {
          requireOrg: true,
        }
      );
      return true;
    } catch (error) {
      console.error("Error deleting quest:", error);
      return false;
    }
  }

  function mapApiToQuest(row: ApiQuest): Quest {
    const dueDate = row.dueDate ? new Date(row.dueDate) : null;
    const now = new Date();
    const isOverdue = dueDate
      ? dueDate < now ||
        (dueDate.toDateString() === now.toDateString() &&
          row.dueTime &&
          new Date(`${dueDate.toISOString().split("T")[0]}T${row.dueTime}`) < now)
      : false;

    return {
      id: row.id,
      title: row.title,
      description: row.description || "",
      difficulty: row.difficulty,
      exp: row.expReward,
      status: "pending",
      streak: 0,
      dueDate,
      dueTime: row.dueTime,
      reminderMinutesBefore: row.reminderMinutesBefore,
      createdAt: new Date(row.createdAt),
      completedAt: null,
      isOverdue: Boolean(isOverdue),
      isDueSoon: false,
    };
  }

  async function fetchNotifications(): Promise<
    Array<{
      id: string;
      quest_id: string;
      notification_type: "overdue" | "reminder" | "due_soon";
      message: string;
      sent_at: Date;
      read_at: Date | null;
    }>
  > {
    if (!authStore.userId) return [];

    await refreshAuthContext();

    try {
      const data = await apiClient.get<ApiQuestNotification[]>(
        "/v1/quests/notifications",
        {
          requireOrg: true,
        }
      );

      return data.map((n) => ({
        id: n.id,
        quest_id: n.quest_id,
        notification_type: n.notification_type,
        message: n.message,
        sent_at: new Date(n.sent_at),
        read_at: n.read_at ? new Date(n.read_at) : null,
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  async function markNotificationRead(
    notificationId: string
  ): Promise<boolean> {
    await refreshAuthContext();

    try {
      await apiClient.patch<{ success: true }>(
        `/v1/quests/notifications/${notificationId}`,
        undefined,
        {
          requireOrg: true,
        }
      );
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  async function checkOverdueQuests(): Promise<void> {
    await refreshAuthContext();

    try {
      await apiClient.post<{ updatedCount: number }>(
        "/v1/quests/notifications/overdue/check",
        undefined,
        {
          requireOrg: true,
        }
      );
    } catch (error) {
      throw apiClient.normalizeApiError(error);
    }
  }

  async function checkQuestsDueSoon(): Promise<void> {
    await refreshAuthContext();

    try {
      await apiClient.post<{ updatedCount: number }>(
        "/v1/quests/notifications/due-soon/check",
        undefined,
        {
          requireOrg: true,
        }
      );
    } catch (error) {
      throw apiClient.normalizeApiError(error);
    }
  }

  return {
    fetchQuests,
    fetchTodayCompletions,
    createQuest,
    completeQuest,
    deleteQuest,
    getQuestById,
    fetchNotifications,
    markNotificationRead,
    checkOverdueQuests,
    checkQuestsDueSoon,
  };
}
