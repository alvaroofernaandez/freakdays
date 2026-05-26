-- AlterTable: add leaderboardOptIn to Profile
ALTER TABLE "Profile" ADD COLUMN "leaderboardOptIn" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex: composite ranking index on Profile for global leaderboard
CREATE INDEX "Profile_leaderboardOptIn_totalExp_level_currentStreak_idx" ON "Profile"("leaderboardOptIn", "totalExp" DESC, "level" DESC, "currentStreak" DESC);

-- CreateTable: FeedEntry
CREATE TABLE "FeedEntry" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "sourceEventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeedEntry_partyId_sourceEventId_key" ON "FeedEntry"("partyId", "sourceEventId");
CREATE INDEX "FeedEntry_partyId_createdAt_idx" ON "FeedEntry"("partyId", "createdAt");
CREATE INDEX "FeedEntry_sourceEventId_idx" ON "FeedEntry"("sourceEventId");

-- AddForeignKey
ALTER TABLE "FeedEntry" ADD CONSTRAINT "FeedEntry_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedEntry" ADD CONSTRAINT "FeedEntry_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
