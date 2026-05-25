import { z } from 'zod';

export const AchievementConditionSchema = z.object({
  kind: z.enum(['counter', 'streak', 'level', 'threshold']),
  metric: z.string().min(1),
  comparator: z.enum(['gte', 'eq']),
  value: z.number().int().positive(),
});

export type AchievementCondition = z.infer<typeof AchievementConditionSchema>;

export function parseCondition(raw: unknown): AchievementCondition {
  return AchievementConditionSchema.parse(raw);
}
