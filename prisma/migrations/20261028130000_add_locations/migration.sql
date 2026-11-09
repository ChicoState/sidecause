-- CreateEnum
CREATE TYPE "LocationKind" AS ENUM ('CITY', 'REGION');

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "kind" "LocationKind" NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "regionName" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Location_kind_normalizedName_idx" ON "Location"("kind", "normalizedName");

