/*
  Warnings:

  - You are about to drop the column `latitude` on the `activity` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `activity` table. All the data in the column will be lost.
  - You are about to drop the `update_gang_request` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."update_gang_request" DROP CONSTRAINT "update_gang_request_addedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."update_gang_request" DROP CONSTRAINT "update_gang_request_relatedGangId_fkey";

-- DropForeignKey
ALTER TABLE "public"."update_gang_request" DROP CONSTRAINT "update_gang_request_reviewedByUserId_fkey";

-- AlterTable
ALTER TABLE "public"."activity" DROP COLUMN "latitude",
DROP COLUMN "longitude";

-- DropTable
DROP TABLE "public"."update_gang_request";
