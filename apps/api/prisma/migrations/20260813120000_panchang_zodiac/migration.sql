-- CreateEnum
CREATE TYPE "Rasi" AS ENUM ('MESHA', 'VRISHABHA', 'MITHUNA', 'KARKA', 'SIMHA', 'KANYA', 'TULA', 'VRISHCHIKA', 'DHANU', 'MAKARA', 'KUMBHA', 'MEENA');

-- CreateTable
CREATE TABLE "birth_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "birth_time" VARCHAR(8),
    "birth_place" VARCHAR(160),
    "birth_latitude" DOUBLE PRECISION,
    "birth_longitude" DOUBLE PRECISION,
    "rasi" "Rasi" NOT NULL,
    "nakshatra" VARCHAR(40),
    "gotram" VARCHAR(80),
    "city_name" VARCHAR(80) NOT NULL DEFAULT 'Bengaluru',
    "city_latitude" DOUBLE PRECISION NOT NULL DEFAULT 12.9716,
    "city_longitude" DOUBLE PRECISION NOT NULL DEFAULT 77.5946,
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "birth_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panchang_days" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "timezone" VARCHAR(64) NOT NULL,
    "location_key" VARCHAR(80) NOT NULL,
    "payload" JSONB NOT NULL,
    "special_note" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "panchang_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rasi_daily_guidance" (
    "id" UUID NOT NULL,
    "rasi" "Rasi" NOT NULL,
    "date" DATE NOT NULL,
    "summary" TEXT NOT NULL,
    "recommended_puja" VARCHAR(160) NOT NULL,
    "activity" VARCHAR(160) NOT NULL,
    "lucky_color" VARCHAR(40) NOT NULL,
    "lucky_direction" VARCHAR(40) NOT NULL,
    "lucky_number" INTEGER NOT NULL,
    "career" TEXT NOT NULL,
    "finance" TEXT NOT NULL,
    "health" TEXT NOT NULL,
    "travel" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rasi_daily_guidance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "festival_notes" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "festival_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "birth_profiles_user_id_key" ON "birth_profiles"("user_id");

-- CreateIndex
CREATE INDEX "panchang_days_date_idx" ON "panchang_days"("date");

-- CreateIndex
CREATE UNIQUE INDEX "panchang_days_date_location_key_key" ON "panchang_days"("date", "location_key");

-- CreateIndex
CREATE INDEX "rasi_daily_guidance_date_idx" ON "rasi_daily_guidance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "rasi_daily_guidance_rasi_date_key" ON "rasi_daily_guidance"("rasi", "date");

-- CreateIndex
CREATE INDEX "festival_notes_date_idx" ON "festival_notes"("date");

-- CreateIndex
CREATE UNIQUE INDEX "festival_notes_date_title_key" ON "festival_notes"("date", "title");

-- AddForeignKey
ALTER TABLE "birth_profiles" ADD CONSTRAINT "birth_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
