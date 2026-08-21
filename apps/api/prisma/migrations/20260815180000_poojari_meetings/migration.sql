-- CreateEnum
CREATE TYPE "PriestServiceMode" AS ENUM ('HOME_VISIT', 'ONLINE');

-- AlterTable
ALTER TABLE "priests" ADD COLUMN "user_id" UUID;

-- AlterTable
ALTER TABLE "priest_bookings" ADD COLUMN "service_mode" "PriestServiceMode" NOT NULL DEFAULT 'HOME_VISIT';
ALTER TABLE "priest_bookings" ADD COLUMN "meeting_provider" VARCHAR(24);
ALTER TABLE "priest_bookings" ADD COLUMN "meeting_id" VARCHAR(160);
ALTER TABLE "priest_bookings" ADD COLUMN "meeting_join_url" VARCHAR(512);
ALTER TABLE "priest_bookings" ADD COLUMN "meeting_host_url" VARCHAR(512);

-- CreateIndex
CREATE UNIQUE INDEX "priests_user_id_key" ON "priests"("user_id");

-- AddForeignKey
ALTER TABLE "priests" ADD CONSTRAINT "priests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
