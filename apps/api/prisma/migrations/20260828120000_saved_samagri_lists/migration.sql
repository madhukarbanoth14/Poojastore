-- CreateTable
CREATE TABLE "saved_samagri_lists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "raw_text" TEXT,
    "items" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_samagri_lists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_samagri_lists_user_id_updated_at_idx" ON "saved_samagri_lists"("user_id", "updated_at");

-- AddForeignKey
ALTER TABLE "saved_samagri_lists" ADD CONSTRAINT "saved_samagri_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
