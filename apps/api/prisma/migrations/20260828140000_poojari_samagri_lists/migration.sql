-- CreateEnum
CREATE TYPE "PoojariSamagriListStatus" AS ENUM ('SENT', 'VIEWED');

-- CreateTable
CREATE TABLE "poojari_samagri_lists" (
    "id" UUID NOT NULL,
    "priest_id" UUID NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "recipient_user_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "raw_text" TEXT,
    "items" JSONB NOT NULL,
    "status" "PoojariSamagriListStatus" NOT NULL DEFAULT 'SENT',
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poojari_samagri_lists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "poojari_samagri_lists_recipient_user_id_sent_at_idx" ON "poojari_samagri_lists"("recipient_user_id", "sent_at");

-- CreateIndex
CREATE INDEX "poojari_samagri_lists_priest_id_booking_id_idx" ON "poojari_samagri_lists"("priest_id", "booking_id");

-- AddForeignKey
ALTER TABLE "poojari_samagri_lists" ADD CONSTRAINT "poojari_samagri_lists_priest_id_fkey" FOREIGN KEY ("priest_id") REFERENCES "priests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poojari_samagri_lists" ADD CONSTRAINT "poojari_samagri_lists_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poojari_samagri_lists" ADD CONSTRAINT "poojari_samagri_lists_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poojari_samagri_lists" ADD CONSTRAINT "poojari_samagri_lists_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "priest_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
