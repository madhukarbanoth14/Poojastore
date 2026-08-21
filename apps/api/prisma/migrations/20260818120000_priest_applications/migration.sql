-- CreateEnum
CREATE TYPE "PriestApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "priest_applications" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "full_name" VARCHAR(120) NOT NULL,
    "phone_e164" VARCHAR(20) NOT NULL,
    "country_code" VARCHAR(5) NOT NULL,
    "phone_national" VARCHAR(20) NOT NULL,
    "city" VARCHAR(80) NOT NULL,
    "state" VARCHAR(80) NOT NULL,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "years_experience" INTEGER NOT NULL,
    "bio" TEXT NOT NULL,
    "base_price_minor" INTEGER NOT NULL,
    "travel_fee_minor" INTEGER NOT NULL DEFAULT 0,
    "offers_home" BOOLEAN NOT NULL DEFAULT true,
    "offers_online" BOOLEAN NOT NULL DEFAULT false,
    "status" "PriestApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "review_note" VARCHAR(280),
    "priest_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "priest_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "priest_applications_priest_id_key" ON "priest_applications"("priest_id");

-- CreateIndex
CREATE INDEX "priest_applications_status_created_at_idx" ON "priest_applications"("status", "created_at");

-- CreateIndex
CREATE INDEX "priest_applications_phone_e164_status_idx" ON "priest_applications"("phone_e164", "status");

-- AddForeignKey
ALTER TABLE "priest_applications" ADD CONSTRAINT "priest_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
