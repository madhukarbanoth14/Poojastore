-- AlterTable
ALTER TABLE "orders" ADD COLUMN "contact_phone_e164" VARCHAR(20);

-- CreateIndex
CREATE INDEX "orders_contact_phone_e164_idx" ON "orders"("contact_phone_e164");
