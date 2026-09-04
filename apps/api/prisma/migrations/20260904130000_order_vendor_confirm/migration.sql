-- AlterTable
ALTER TABLE "orders" ADD COLUMN "confirmed_at" TIMESTAMP(3),
ADD COLUMN "vendor_notified_at" TIMESTAMP(3),
ADD COLUMN "vendor_id" UUID;

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "phone_e164" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "city" VARCHAR(80),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendors_phone_e164_key" ON "vendors"("phone_e164");

-- CreateIndex
CREATE INDEX "vendors_is_active_is_default_idx" ON "vendors"("is_active", "is_default");

-- CreateIndex
CREATE INDEX "orders_vendor_id_idx" ON "orders"("vendor_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
