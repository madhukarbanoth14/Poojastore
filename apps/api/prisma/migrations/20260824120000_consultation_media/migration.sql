-- CreateEnum
CREATE TYPE "ConsultationMedia" AS ENUM ('VIDEO', 'AUDIO');

-- AlterTable
ALTER TABLE "priest_bookings" ADD COLUMN "consultation_media" "ConsultationMedia";
