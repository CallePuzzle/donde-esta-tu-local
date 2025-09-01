/*
  Warnings:

  - You are about to drop the column `lastMagicLinkSentAt` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "lastMagicLinkSentAt";

-- CreateTable
CREATE TABLE "public"."gang_history" (
    "id" SERIAL NOT NULL,
    "gangId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "changedBy" TEXT,
    "changeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gang_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gang_history_gangId_idx" ON "public"."gang_history"("gangId");

-- CreateIndex
CREATE INDEX "gang_history_createdAt_idx" ON "public"."gang_history"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."gang_history" ADD CONSTRAINT "gang_history_gangId_fkey" FOREIGN KEY ("gangId") REFERENCES "public"."gang"("id") ON DELETE CASCADE ON UPDATE CASCADE;
