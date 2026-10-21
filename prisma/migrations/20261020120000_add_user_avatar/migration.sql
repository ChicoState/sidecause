-- Add the selected profile image to each user so it is visible across devices.
ALTER TABLE "User" ADD COLUMN "avatarId" TEXT NOT NULL DEFAULT 'sprout';
