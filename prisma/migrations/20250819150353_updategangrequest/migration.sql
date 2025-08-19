/*
  Warnings:

  - You are about to drop the `Gang` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."user" DROP CONSTRAINT "user_gangId_fkey";

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "membershipGangStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "public"."Gang";

-- CreateTable
CREATE TABLE "public"."gang" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "gang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."request" (
    "id" SERIAL NOT NULL,
    "relatedGangId" INTEGER,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "addedByUserId" TEXT,
    "reviewedByUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_gangId_fkey" FOREIGN KEY ("gangId") REFERENCES "public"."gang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request" ADD CONSTRAINT "request_relatedGangId_fkey" FOREIGN KEY ("relatedGangId") REFERENCES "public"."gang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request" ADD CONSTRAINT "request_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request" ADD CONSTRAINT "request_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
