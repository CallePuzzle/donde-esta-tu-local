/*
  Warnings:

  - You are about to drop the column `changedBy` on the `gang_history` table. All the data in the column will be lost.
  - Added the required column `changedByUserId` to the `gang_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."gang_history" DROP COLUMN "changedBy",
ADD COLUMN     "changedByUserId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."gang_history" ADD CONSTRAINT "gang_history_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
