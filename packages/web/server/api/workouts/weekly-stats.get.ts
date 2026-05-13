/**
 * GET /api/workouts/weekly-stats — proxies to NestJS GET /v1/workouts/weekly-stats.
 *
 * S5.f of the supabase→clerk+nestjs migration.
 */
import { defineEventHandler } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler((event) => createApiClient(event)('/v1/workouts/weekly-stats'));
