-- CreateEnum
CREATE TYPE "PackageAddonType" AS ENUM ('CATERING', 'BAND', 'TRAVEL', 'PRASAD', 'OTHER');

-- CreateEnum
CREATE TYPE "PackageBookingStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "puja_packages" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "summary" VARCHAR(280) NOT NULL,
    "description" TEXT NOT NULL,
    "market" "Market" NOT NULL DEFAULT 'IN',
    "currency" "CurrencyCode" NOT NULL DEFAULT 'INR',
    "allows_kit" BOOLEAN NOT NULL DEFAULT true,
    "kit_product_slug" VARCHAR(120),
    "allows_priest" BOOLEAN NOT NULL DEFAULT true,
    "allows_prasad" BOOLEAN NOT NULL DEFAULT false,
    "prasad_product_slug" VARCHAR(120),
    "package_discount_minor" INTEGER NOT NULL DEFAULT 0,
    "cover_image_url" VARCHAR(512),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puja_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_addons" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT NOT NULL,
    "type" "PackageAddonType" NOT NULL,
    "market" "Market" NOT NULL DEFAULT 'IN',
    "currency" "CurrencyCode" NOT NULL DEFAULT 'INR',
    "price_minor" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_bookings" (
    "id" UUID NOT NULL,
    "booking_number" VARCHAR(32) NOT NULL,
    "user_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "address_id" UUID NOT NULL,
    "include_kit" BOOLEAN NOT NULL DEFAULT true,
    "include_priest" BOOLEAN NOT NULL DEFAULT false,
    "include_prasad" BOOLEAN NOT NULL DEFAULT false,
    "addon_slugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "service_name" VARCHAR(160),
    "notes" TEXT,
    "priest_booking_id" UUID,
    "status" "PackageBookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "market" "Market" NOT NULL,
    "currency" "CurrencyCode" NOT NULL,
    "subtotal_minor" INTEGER NOT NULL,
    "discount_minor" INTEGER NOT NULL DEFAULT 0,
    "total_minor" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL DEFAULT '{}',
    "order_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "puja_packages_slug_key" ON "puja_packages"("slug");

-- CreateIndex
CREATE INDEX "puja_packages_market_is_active_sort_order_idx" ON "puja_packages"("market", "is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "package_addons_slug_key" ON "package_addons"("slug");

-- CreateIndex
CREATE INDEX "package_addons_market_is_active_sort_order_idx" ON "package_addons"("market", "is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "package_bookings_booking_number_key" ON "package_bookings"("booking_number");

-- CreateIndex
CREATE UNIQUE INDEX "package_bookings_priest_booking_id_key" ON "package_bookings"("priest_booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "package_bookings_order_id_key" ON "package_bookings"("order_id");

-- CreateIndex
CREATE INDEX "package_bookings_user_id_created_at_idx" ON "package_bookings"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "package_bookings_status_created_at_idx" ON "package_bookings"("status", "created_at");

-- AddForeignKey
ALTER TABLE "package_bookings" ADD CONSTRAINT "package_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_bookings" ADD CONSTRAINT "package_bookings_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "puja_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_bookings" ADD CONSTRAINT "package_bookings_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_bookings" ADD CONSTRAINT "package_bookings_priest_booking_id_fkey" FOREIGN KEY ("priest_booking_id") REFERENCES "priest_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_bookings" ADD CONSTRAINT "package_bookings_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
