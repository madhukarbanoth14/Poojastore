-- CreateEnum
CREATE TYPE "PriestBookingStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "priests" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "bio" TEXT NOT NULL,
    "city" VARCHAR(80) NOT NULL,
    "state" VARCHAR(80) NOT NULL,
    "country" VARCHAR(2) NOT NULL DEFAULT 'IN',
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "years_experience" INTEGER NOT NULL,
    "rating_avg" DOUBLE PRECISION NOT NULL DEFAULT 4.8,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "photo_url" VARCHAR(512),
    "market" "Market" NOT NULL DEFAULT 'IN',
    "currency" "CurrencyCode" NOT NULL DEFAULT 'INR',
    "base_price_minor" INTEGER NOT NULL,
    "travel_fee_minor" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "priests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "priest_slots" (
    "id" UUID NOT NULL,
    "priest_id" UUID NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "is_booked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "priest_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "priest_bookings" (
    "id" UUID NOT NULL,
    "booking_number" VARCHAR(32) NOT NULL,
    "user_id" UUID NOT NULL,
    "priest_id" UUID NOT NULL,
    "slot_id" UUID NOT NULL,
    "address_id" UUID NOT NULL,
    "service_name" VARCHAR(160) NOT NULL,
    "notes" TEXT,
    "status" "PriestBookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "market" "Market" NOT NULL,
    "currency" "CurrencyCode" NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "order_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "priest_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "priests_slug_key" ON "priests"("slug");

-- CreateIndex
CREATE INDEX "priests_city_is_active_sort_order_idx" ON "priests"("city", "is_active", "sort_order");

-- CreateIndex
CREATE INDEX "priests_market_is_active_idx" ON "priests"("market", "is_active");

-- CreateIndex
CREATE INDEX "priest_slots_priest_id_starts_at_is_booked_idx" ON "priest_slots"("priest_id", "starts_at", "is_booked");

-- CreateIndex
CREATE UNIQUE INDEX "priest_slots_priest_id_starts_at_key" ON "priest_slots"("priest_id", "starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "priest_bookings_booking_number_key" ON "priest_bookings"("booking_number");

-- CreateIndex
CREATE UNIQUE INDEX "priest_bookings_slot_id_key" ON "priest_bookings"("slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "priest_bookings_order_id_key" ON "priest_bookings"("order_id");

-- CreateIndex
CREATE INDEX "priest_bookings_user_id_created_at_idx" ON "priest_bookings"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "priest_bookings_priest_id_status_idx" ON "priest_bookings"("priest_id", "status");

-- CreateIndex
CREATE INDEX "priest_bookings_status_created_at_idx" ON "priest_bookings"("status", "created_at");

-- AddForeignKey
ALTER TABLE "priest_slots" ADD CONSTRAINT "priest_slots_priest_id_fkey" FOREIGN KEY ("priest_id") REFERENCES "priests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priest_bookings" ADD CONSTRAINT "priest_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priest_bookings" ADD CONSTRAINT "priest_bookings_priest_id_fkey" FOREIGN KEY ("priest_id") REFERENCES "priests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priest_bookings" ADD CONSTRAINT "priest_bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "priest_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priest_bookings" ADD CONSTRAINT "priest_bookings_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priest_bookings" ADD CONSTRAINT "priest_bookings_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
