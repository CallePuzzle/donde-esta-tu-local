/*
  Warnings:

  - You are about to drop the column `desc` on the `activity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."activity" DROP COLUMN "desc",
ADD COLUMN     "dateDesc" TEXT,
ADD COLUMN     "placeDesc" TEXT;
