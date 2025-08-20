/*
  Warnings:

  - You are about to drop the `request` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."request" DROP CONSTRAINT "request_addedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."request" DROP CONSTRAINT "request_relatedGangId_fkey";

-- DropForeignKey
ALTER TABLE "public"."request" DROP CONSTRAINT "request_reviewedByUserId_fkey";

-- DropTable
DROP TABLE "public"."request";

-- CreateTable
CREATE TABLE "public"."update_gang_request" (
    "id" SERIAL NOT NULL,
    "relatedGangId" INTEGER,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "addedByUserId" TEXT,
    "reviewedByUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "update_gang_request_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."update_gang_request" ADD CONSTRAINT "update_gang_request_relatedGangId_fkey" FOREIGN KEY ("relatedGangId") REFERENCES "public"."gang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."update_gang_request" ADD CONSTRAINT "update_gang_request_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."update_gang_request" ADD CONSTRAINT "update_gang_request_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
