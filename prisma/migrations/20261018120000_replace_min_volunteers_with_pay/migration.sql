-- Replace the minimum volunteer requirement with per-volunteer compensation.
ALTER TABLE "Bounty"
    DROP CONSTRAINT "Bounty_min_volunteers_positive",
    DROP CONSTRAINT "Bounty_capacity_range",
    ADD COLUMN "payPerVolunteer" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    DROP COLUMN "minVolunteers";

ALTER TABLE "Bounty"
    ADD CONSTRAINT "Bounty_pay_per_volunteer_non_negative"
        CHECK ("payPerVolunteer" >= 0);

ALTER TABLE "Bounty"
    ALTER COLUMN "payPerVolunteer" DROP DEFAULT;
