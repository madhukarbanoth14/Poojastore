-- AlterTable
ALTER TABLE "priest_bookings" ADD COLUMN "cancelled_at" TIMESTAMP(3),
ADD COLUMN "cancel_reason" VARCHAR(280),
ADD COLUMN "cancelled_by_user_id" UUID,
ADD COLUMN "rescheduled_from_slot_id" UUID;

-- AlterTable
ALTER TABLE "package_bookings" ADD COLUMN "cancelled_at" TIMESTAMP(3),
ADD COLUMN "cancel_reason" VARCHAR(280),
ADD COLUMN "cancelled_by_user_id" UUID;
