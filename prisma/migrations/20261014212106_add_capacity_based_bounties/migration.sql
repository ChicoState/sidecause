-- CreateEnum
CREATE TYPE "BountyStatus" AS ENUM ('OPEN', 'FULL', 'FINISHED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RequirementLevel" AS ENUM ('REQUIRED', 'RECOMMENDED');

-- CreateEnum
CREATE TYPE "VolunteerAttendanceStatus" AS ENUM ('JOINED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "Bounty" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "locationLabel" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "minVolunteers" INTEGER NOT NULL,
    "maxVolunteers" INTEGER NOT NULL,
    "status" "BountyStatus" NOT NULL DEFAULT 'OPEN',
    "posterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "cancellationReason" TEXT,

    CONSTRAINT "Bounty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BountyVolunteer" (
    "bountyId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "status" "VolunteerAttendanceStatus" NOT NULL DEFAULT 'JOINED',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),

    CONSTRAINT "BountyVolunteer_pkey" PRIMARY KEY ("bountyId","volunteerId")
);

-- CreateTable
CREATE TABLE "BountySkillRequirement" (
    "id" TEXT NOT NULL,
    "bountyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "RequirementLevel" NOT NULL,

    CONSTRAINT "BountySkillRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BountyEquipmentRequirement" (
    "id" TEXT NOT NULL,
    "bountyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "RequirementLevel" NOT NULL,

    CONSTRAINT "BountyEquipmentRequirement_pkey" PRIMARY KEY ("id")
);

-- Prisma Schema Language does not represent PostgreSQL CHECK constraints.
-- Keep these invariants in the database so all writers enforce them.
ALTER TABLE "Bounty"
    ADD CONSTRAINT "Bounty_min_volunteers_positive"
        CHECK ("minVolunteers" > 0),
    ADD CONSTRAINT "Bounty_capacity_range"
        CHECK ("maxVolunteers" >= "minVolunteers"),
    ADD CONSTRAINT "Bounty_coordinates_paired"
        CHECK (("latitude" IS NULL) = ("longitude" IS NULL));

ALTER TABLE "BountyVolunteer"
    ADD CONSTRAINT "BountyVolunteer_withdrawal_status"
        CHECK (
            ("status" = 'JOINED' AND "withdrawnAt" IS NULL)
            OR ("status" = 'WITHDRAWN' AND "withdrawnAt" IS NOT NULL)
        );

-- CreateIndex
CREATE INDEX "Bounty_posterId_idx" ON "Bounty"("posterId");

-- CreateIndex
CREATE INDEX "Bounty_status_deadline_idx" ON "Bounty"("status", "deadline");

-- CreateIndex
CREATE INDEX "Bounty_scheduledAt_idx" ON "Bounty"("scheduledAt");

-- CreateIndex
CREATE INDEX "BountyVolunteer_volunteerId_status_idx" ON "BountyVolunteer"("volunteerId", "status");

-- CreateIndex
CREATE INDEX "BountyVolunteer_bountyId_status_idx" ON "BountyVolunteer"("bountyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BountySkillRequirement_bountyId_name_key" ON "BountySkillRequirement"("bountyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "BountyEquipmentRequirement_bountyId_name_key" ON "BountyEquipmentRequirement"("bountyId", "name");

-- AddForeignKey
ALTER TABLE "Bounty" ADD CONSTRAINT "Bounty_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BountyVolunteer" ADD CONSTRAINT "BountyVolunteer_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "Bounty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BountyVolunteer" ADD CONSTRAINT "BountyVolunteer_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BountySkillRequirement" ADD CONSTRAINT "BountySkillRequirement_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "Bounty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BountyEquipmentRequirement" ADD CONSTRAINT "BountyEquipmentRequirement_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "Bounty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
