-- AlterTable Profile: add streak fields and lastLoginDate
ALTER TABLE "Profile"
  ADD COLUMN "currentStreak" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "longestStreak" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastActivityDate" TIMESTAMP(3),
  ADD COLUMN "lastLoginDate" TEXT;
