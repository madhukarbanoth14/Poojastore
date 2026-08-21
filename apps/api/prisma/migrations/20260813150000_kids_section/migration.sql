-- CreateEnum
CREATE TYPE "KidsAgeBand" AS ENUM ('LITTLE', 'JUNIOR', 'TEEN');

-- CreateTable
CREATE TABLE "kids_stories" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "summary" VARCHAR(280) NOT NULL,
    "festival_name" VARCHAR(120) NOT NULL,
    "why_celebrated" TEXT NOT NULL,
    "importance" TEXT NOT NULL,
    "age_band" "KidsAgeBand" NOT NULL DEFAULT 'JUNIOR',
    "language" VARCHAR(16) NOT NULL DEFAULT 'en',
    "cover_image_url" VARCHAR(512),
    "audio_url" VARCHAR(512),
    "video_url" VARCHAR(512),
    "related_vidhi_slug" VARCHAR(120),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kids_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kids_story_pages" (
    "id" UUID NOT NULL,
    "story_id" UUID NOT NULL,
    "page_number" INTEGER NOT NULL,
    "title" VARCHAR(160),
    "body" TEXT NOT NULL,
    "image_url" VARCHAR(512),
    "audio_url" VARCHAR(512),

    CONSTRAINT "kids_story_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kids_quizzes" (
    "id" UUID NOT NULL,
    "story_id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "pass_score" INTEGER NOT NULL DEFAULT 2,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kids_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kids_quiz_questions" (
    "id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" TEXT[],
    "correct_index" INTEGER NOT NULL,
    "explanation" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "kids_quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kids_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "story_id" UUID NOT NULL,
    "story_completed_at" TIMESTAMP(3),
    "quiz_score" INTEGER,
    "quiz_total" INTEGER,
    "quiz_passed" BOOLEAN,
    "quiz_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kids_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kids_stories_slug_key" ON "kids_stories"("slug");

-- CreateIndex
CREATE INDEX "kids_stories_age_band_is_published_sort_order_idx" ON "kids_stories"("age_band", "is_published", "sort_order");

-- CreateIndex
CREATE INDEX "kids_story_pages_story_id_idx" ON "kids_story_pages"("story_id");

-- CreateIndex
CREATE UNIQUE INDEX "kids_story_pages_story_id_page_number_key" ON "kids_story_pages"("story_id", "page_number");

-- CreateIndex
CREATE UNIQUE INDEX "kids_quizzes_story_id_key" ON "kids_quizzes"("story_id");

-- CreateIndex
CREATE INDEX "kids_quiz_questions_quiz_id_sort_order_idx" ON "kids_quiz_questions"("quiz_id", "sort_order");

-- CreateIndex
CREATE INDEX "kids_progress_user_id_idx" ON "kids_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "kids_progress_user_id_story_id_key" ON "kids_progress"("user_id", "story_id");

-- AddForeignKey
ALTER TABLE "kids_story_pages" ADD CONSTRAINT "kids_story_pages_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "kids_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kids_quizzes" ADD CONSTRAINT "kids_quizzes_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "kids_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kids_quiz_questions" ADD CONSTRAINT "kids_quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "kids_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kids_progress" ADD CONSTRAINT "kids_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kids_progress" ADD CONSTRAINT "kids_progress_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "kids_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
