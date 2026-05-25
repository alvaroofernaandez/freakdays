export const EVENT_TYPES = {
  QUEST_COMPLETED: 'quest.completed',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
