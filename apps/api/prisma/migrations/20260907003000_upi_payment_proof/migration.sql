-- AlterTable
CREATE TABLE "upi_payment_proofs" (
    "payment_id" UUID NOT NULL,
    "mime_type" VARCHAR(64) NOT NULL,
    "image" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upi_payment_proofs_pkey" PRIMARY KEY ("payment_id")
);

-- AddForeignKey
ALTER TABLE "upi_payment_proofs" ADD CONSTRAINT "upi_payment_proofs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
