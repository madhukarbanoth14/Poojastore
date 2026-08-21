-- CreateTable
CREATE TABLE "vrat_guides" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "summary" VARCHAR(280) NOT NULL,
    "description" TEXT NOT NULL,
    "duration_hint" VARCHAR(160) NOT NULL,
    "allowed_foods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avoid_foods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "break_fast_how" TEXT NOT NULL,
    "associated_puja" VARCHAR(160),
    "related_vidhi_slug" VARCHAR(120),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vrat_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vrat_occurrences" (
    "id" UUID NOT NULL,
    "vrat_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "note" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vrat_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vrat_reminders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "vrat_id" UUID NOT NULL,
    "remind_days_before" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vrat_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prasad_recipes" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "summary" VARCHAR(280) NOT NULL,
    "festival_name" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "servings" INTEGER NOT NULL DEFAULT 4,
    "prep_minutes" INTEGER NOT NULL,
    "ingredients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "audio_url" VARCHAR(512),
    "video_url" VARCHAR(512),
    "cover_image_url" VARCHAR(512),
    "related_product_slug" VARCHAR(120),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prasad_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prasad_recipe_steps" (
    "id" UUID NOT NULL,
    "recipe_id" UUID NOT NULL,
    "step_number" INTEGER NOT NULL,
    "title" VARCHAR(160),
    "instruction" TEXT NOT NULL,
    "image_url" VARCHAR(512),
    "audio_url" VARCHAR(512),

    CONSTRAINT "prasad_recipe_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vrat_guides_slug_key" ON "vrat_guides"("slug");

-- CreateIndex
CREATE INDEX "vrat_guides_is_published_sort_order_idx" ON "vrat_guides"("is_published", "sort_order");

-- CreateIndex
CREATE INDEX "vrat_occurrences_date_idx" ON "vrat_occurrences"("date");

-- CreateIndex
CREATE UNIQUE INDEX "vrat_occurrences_vrat_id_date_key" ON "vrat_occurrences"("vrat_id", "date");

-- CreateIndex
CREATE INDEX "vrat_reminders_user_id_idx" ON "vrat_reminders"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vrat_reminders_user_id_vrat_id_key" ON "vrat_reminders"("user_id", "vrat_id");

-- CreateIndex
CREATE UNIQUE INDEX "prasad_recipes_slug_key" ON "prasad_recipes"("slug");

-- CreateIndex
CREATE INDEX "prasad_recipes_festival_name_is_published_sort_order_idx" ON "prasad_recipes"("festival_name", "is_published", "sort_order");

-- CreateIndex
CREATE INDEX "prasad_recipe_steps_recipe_id_idx" ON "prasad_recipe_steps"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "prasad_recipe_steps_recipe_id_step_number_key" ON "prasad_recipe_steps"("recipe_id", "step_number");

-- AddForeignKey
ALTER TABLE "vrat_occurrences" ADD CONSTRAINT "vrat_occurrences_vrat_id_fkey" FOREIGN KEY ("vrat_id") REFERENCES "vrat_guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vrat_reminders" ADD CONSTRAINT "vrat_reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vrat_reminders" ADD CONSTRAINT "vrat_reminders_vrat_id_fkey" FOREIGN KEY ("vrat_id") REFERENCES "vrat_guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prasad_recipe_steps" ADD CONSTRAINT "prasad_recipe_steps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "prasad_recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
