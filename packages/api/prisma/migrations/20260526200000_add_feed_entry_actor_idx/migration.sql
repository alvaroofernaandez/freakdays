-- prisma-no-transaction
-- Migration: add_feed_entry_actor_idx
--
-- IMPORTANT: CREATE INDEX CONCURRENTLY cannot run inside a transaction.
-- This migration file uses the `prisma-no-transaction` directive so Prisma
-- does NOT wrap the statement in BEGIN/COMMIT.
--
-- MANUAL PRODUCTION APPLY NOTE:
-- Run this migration manually on production with:
--   psql $DATABASE_URL -f this_file.sql
-- OR apply via Prisma with: prisma migrate deploy
-- (prisma-no-transaction is honored by `migrate deploy` >= Prisma 4.x).
-- Verify the table size before applying on a large dataset; CONCURRENTLY
-- builds the index without locking reads/writes but takes longer.

CREATE INDEX CONCURRENTLY IF NOT EXISTS "FeedEntry_actorUserId_createdAt_idx"
  ON "FeedEntry" ("actorUserId", "createdAt" DESC);
