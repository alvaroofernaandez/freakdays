import { EVENT_TYPES } from '../../events/event-types';
import type { AchievementCondition } from './condition.schema';

export interface AchievementSeed {
  code: string;
  name: string;
  description: string;
  triggers: string[];
  condition: AchievementCondition;
}

export const ACHIEVEMENT_CATALOG: AchievementSeed[] = [
  {
    code: 'primer-paso',
    name: 'Primer paso',
    description: 'Completa tu primera quest.',
    triggers: [EVENT_TYPES.QUEST_COMPLETED],
    condition: { kind: 'counter', metric: 'questsCompleted', comparator: 'gte', value: 1 },
  },
  {
    code: 'semana-perfecta',
    name: 'Semana perfecta',
    description: 'Mantén una racha de 7 días.',
    triggers: [
      EVENT_TYPES.QUEST_COMPLETED,
      EVENT_TYPES.WORKOUT_LOGGED,
      EVENT_TYPES.ANIME_PROGRESSED,
      EVENT_TYPES.ANIME_COMPLETED,
      EVENT_TYPES.MANGA_PROGRESSED,
      EVENT_TYPES.DAILY_LOGIN,
    ],
    condition: { kind: 'streak', metric: 'currentStreak', comparator: 'gte', value: 7 },
  },
  {
    code: 'nivel-5',
    name: 'Nivel 5',
    description: 'Alcanza el nivel 5.',
    triggers: [
      EVENT_TYPES.QUEST_COMPLETED,
      EVENT_TYPES.WORKOUT_LOGGED,
      EVENT_TYPES.ANIME_PROGRESSED,
      EVENT_TYPES.ANIME_COMPLETED,
      EVENT_TYPES.MANGA_PROGRESSED,
      EVENT_TYPES.DAILY_LOGIN,
      EVENT_TYPES.LEVEL_UP,
    ],
    condition: { kind: 'level', metric: 'level', comparator: 'gte', value: 5 },
  },
  {
    code: 'maratonista',
    name: 'Maratonista',
    description: 'Registra 10 entrenamientos.',
    triggers: [EVENT_TYPES.WORKOUT_LOGGED],
    condition: { kind: 'counter', metric: 'workoutsLogged', comparator: 'gte', value: 10 },
  },
  {
    code: 'otaku',
    name: 'Otaku',
    description: 'Completa 10 series de anime.',
    triggers: [EVENT_TYPES.ANIME_COMPLETED],
    condition: { kind: 'counter', metric: 'animesCompleted', comparator: 'gte', value: 10 },
  },
  {
    code: 'lector',
    name: 'Lector',
    description: 'Lee 50 capítulos de manga.',
    triggers: [EVENT_TYPES.MANGA_PROGRESSED],
    condition: { kind: 'counter', metric: 'chaptersRead', comparator: 'gte', value: 50 },
  },
  {
    code: 'completista',
    name: 'Completista',
    description: 'Completa 100 quests.',
    triggers: [EVENT_TYPES.QUEST_COMPLETED],
    condition: { kind: 'counter', metric: 'questsCompleted', comparator: 'gte', value: 100 },
  },
] as const;
