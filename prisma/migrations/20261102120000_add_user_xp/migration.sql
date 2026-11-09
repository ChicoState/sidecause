-- Store lifetime experience points. Level is derived from XP in application code.
ALTER TABLE "User" ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0;
