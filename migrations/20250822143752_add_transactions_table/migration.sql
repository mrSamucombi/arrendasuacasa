-- CreateEnum
CREATE TYPE "public"."PropertyStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'RENTED');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('PURCHASE', 'PUBLISH', 'REACTIVATE', 'ADMIN_CREDIT');

-- AlterTable
ALTER TABLE "public"."Property" ADD COLUMN     "status" "public"."PropertyStatus" NOT NULL DEFAULT 'AVAILABLE';

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "public"."Transaction"("userId");
