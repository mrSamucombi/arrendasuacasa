/*
  Warnings:

  - You are about to alter the column `ascBalance` on the `Owner` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "public"."Owner" ALTER COLUMN "ascBalance" SET DEFAULT 0,
ALTER COLUMN "ascBalance" SET DATA TYPE INTEGER;
