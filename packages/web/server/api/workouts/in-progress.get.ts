/**
 * GET /api/workouts/in-progress — proxies to NestJS GET /v1/workouts/in-progress.
 *
 * S5.f of the supabase→clerk+nestjs migration.
 */
import { defineEventHandler } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler((event) => createApiClient(event)('/v1/workouts/in-progress'));
