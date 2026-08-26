-- CreateEnum
CREATE TYPE "PriestBookingKind" AS ENUM ('GENERAL', 'ARCHANA');

-- AlterTable
ALTER TABLE "priests" ADD COLUMN "offers_online_archana" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "priests" ADD COLUMN "temple_name" VARCHAR(160);
ALTER TABLE "priests" ADD COLUMN "archana_deities" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "priest_bookings" ADD COLUMN "booking_kind" "PriestBookingKind" NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "priest_bookings" ADD COLUMN "deity_slug" VARCHAR(64);
