CREATE TYPE "BountyDifficulty" AS ENUM (
    'EASY',
    'MEDIUM',
    'NORMAL',
    'HARD',
    'EXTRA_HARD'
);

ALTER TABLE "Bounty"
    ADD COLUMN "difficulty" "BountyDifficulty" NOT NULL DEFAULT 'NORMAL';

ALTER TABLE "Bounty"
    ALTER COLUMN "difficulty" DROP DEFAULT;
