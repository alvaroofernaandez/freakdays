-- CreateTable
CREATE TABLE "LeaderboardSnapshotEntry" (
    "userId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "totalExp" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "currentStreak" INTEGER NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "computedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardSnapshotEntry_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "DirtyLeaderboardUser" (
    "userId" TEXT NOT NULL,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirtyLeaderboardUser_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "LeaderboardSnapshotEntry_rank_idx" ON "LeaderboardSnapshotEntry"("rank");

-- AddForeignKey
ALTER TABLE "LeaderboardSnapshotEntry" ADD CONSTRAINT "LeaderboardSnapshotEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirtyLeaderboardUser" ADD CONSTRAINT "DirtyLeaderboardUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
