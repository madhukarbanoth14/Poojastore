-- AlterTable
ALTER TABLE "users" ADD COLUMN "google_sub" VARCHAR(128),
ADD COLUMN "apple_sub" VARCHAR(128);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_sub_key" ON "users"("google_sub");

-- CreateIndex
CREATE UNIQUE INDEX "users_apple_sub_key" ON "users"("apple_sub");
