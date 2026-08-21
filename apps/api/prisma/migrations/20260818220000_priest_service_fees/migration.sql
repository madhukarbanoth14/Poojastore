-- AlterTable
ALTER TABLE "priests" ADD COLUMN "service_fees" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "priest_applications" ADD COLUMN "service_fees" JSONB NOT NULL DEFAULT '[]';
