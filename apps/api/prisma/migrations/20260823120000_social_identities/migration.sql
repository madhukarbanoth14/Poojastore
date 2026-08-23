-- CreateEnum
CREATE TYPE "SocialProvider" AS ENUM ('GOOGLE', 'APPLE');

-- CreateTable
CREATE TABLE "social_identities" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "SocialProvider" NOT NULL,
    "provider_user_id" VARCHAR(191) NOT NULL,
    "email" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_identities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "social_identities_provider_provider_user_id_key" ON "social_identities"("provider", "provider_user_id");

-- CreateIndex
CREATE INDEX "social_identities_user_id_idx" ON "social_identities"("user_id");

-- AddForeignKey
ALTER TABLE "social_identities" ADD CONSTRAINT "social_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
