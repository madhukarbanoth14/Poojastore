-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'REFUNDED');

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN "unit_price_override_minor" INTEGER;
ALTER TABLE "cart_items" ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "delivery_slot" VARCHAR(80);
ALTER TABLE "orders" ADD COLUMN "tracking_number" VARCHAR(40);
ALTER TABLE "orders" ADD COLUMN "courier_name" VARCHAR(80);
ALTER TABLE "orders" ADD COLUMN "packed_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "shipped_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "out_for_delivery_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "delivered_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "cancelled_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "cancel_reason" VARCHAR(255);
ALTER TABLE "orders" ADD COLUMN "return_status" "ReturnStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "orders" ADD COLUMN "return_reason" VARCHAR(255);
ALTER TABLE "orders" ADD COLUMN "return_requested_at" TIMESTAMP(3);
