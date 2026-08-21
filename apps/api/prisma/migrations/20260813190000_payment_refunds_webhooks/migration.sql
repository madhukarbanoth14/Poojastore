-- AlterTable
ALTER TABLE "payments" ADD COLUMN "provider_refund_id" VARCHAR(120),
ADD COLUMN "refund_amount_minor" INTEGER,
ADD COLUMN "refunded_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "payment_webhook_events" (
    "id" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "event_id" VARCHAR(180) NOT NULL,
    "event_type" VARCHAR(120) NOT NULL,
    "payment_id" UUID,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_webhook_events_processed_at_idx" ON "payment_webhook_events"("processed_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_webhook_events_provider_event_id_key" ON "payment_webhook_events"("provider", "event_id");
