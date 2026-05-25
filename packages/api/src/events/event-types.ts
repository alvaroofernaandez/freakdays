export const EVENT_TYPES = {
  QUEST_COMPLETED: 'quest.completed',
  WORKOUT_LOGGED: 'workout.logged',
  ANIME_PROGRESSED: 'anime.progressed',
  ANIME_COMPLETED: 'anime.completed',
  MANGA_PROGRESSED: 'manga.progressed',
  DAILY_LOGIN: 'daily.login',
  LEVEL_UP: 'level.up',
  ACHIEVEMENT_UNLOCKED: 'achievement.unlocked',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
