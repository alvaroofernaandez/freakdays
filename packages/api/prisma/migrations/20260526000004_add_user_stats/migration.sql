-- CreateTable UserStats
CREATE TABLE "UserStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "questsPending" INTEGER NOT NULL DEFAULT 0,
    "questsDoneToday" INTEGER NOT NULL DEFAULT 0,
    "animesInProgress" INTEGER NOT NULL DEFAULT 0,
    "workoutsThisWeek" INTEGER NOT NULL DEFAULT 0,
    "totalExp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "achievementsCount" INTEGER NOT NULL DEFAULT 0,
    "windowDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_userId_organizationId_key" ON "UserStats"("userId", "organizationId");
CREATE INDEX "UserStats_userId_organizationId_idx" ON "UserStats"("userId", "organizationId");
