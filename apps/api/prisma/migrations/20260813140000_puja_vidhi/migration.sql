-- CreateEnum
CREATE TYPE "VidhiCategory" AS ENUM ('FESTIVAL', 'OCCASION', 'DAILY', 'VRAT');

-- CreateEnum
CREATE TYPE "VidhiDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "puja_vidhis" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "summary" VARCHAR(280) NOT NULL,
    "description" TEXT NOT NULL,
    "category" "VidhiCategory" NOT NULL,
    "language" VARCHAR(16) NOT NULL DEFAULT 'en',
    "best_time_hint" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "difficulty" "VidhiDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "cover_image_url" VARCHAR(512),
    "audio_narration_url" VARCHAR(512),
    "video_demo_url" VARCHAR(512),
    "katha_text" TEXT,
    "katha_audio_url" VARCHAR(512),
    "related_product_slug" VARCHAR(120),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puja_vidhis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vidhi_steps" (
    "id" UUID NOT NULL,
    "vidhi_id" UUID NOT NULL,
    "step_number" INTEGER NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "instruction" TEXT NOT NULL,
    "transliteration" TEXT,
    "meaning" TEXT,
    "image_url" VARCHAR(512),
    "audio_url" VARCHAR(512),
    "duration_seconds" INTEGER,

    CONSTRAINT "vidhi_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vidhi_mantras" (
    "id" UUID NOT NULL,
    "vidhi_id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "sanskrit_text" TEXT NOT NULL,
    "transliteration" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "audio_url" VARCHAR(512),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vidhi_mantras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "puja_vidhis_slug_key" ON "puja_vidhis"("slug");

-- CreateIndex
CREATE INDEX "puja_vidhis_category_is_published_sort_order_idx" ON "puja_vidhis"("category", "is_published", "sort_order");

-- CreateIndex
CREATE INDEX "vidhi_steps_vidhi_id_idx" ON "vidhi_steps"("vidhi_id");

-- CreateIndex
CREATE UNIQUE INDEX "vidhi_steps_vidhi_id_step_number_key" ON "vidhi_steps"("vidhi_id", "step_number");

-- CreateIndex
CREATE INDEX "vidhi_mantras_vidhi_id_sort_order_idx" ON "vidhi_mantras"("vidhi_id", "sort_order");

-- AddForeignKey
ALTER TABLE "vidhi_steps" ADD CONSTRAINT "vidhi_steps_vidhi_id_fkey" FOREIGN KEY ("vidhi_id") REFERENCES "puja_vidhis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vidhi_mantras" ADD CONSTRAINT "vidhi_mantras_vidhi_id_fkey" FOREIGN KEY ("vidhi_id") REFERENCES "puja_vidhis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
