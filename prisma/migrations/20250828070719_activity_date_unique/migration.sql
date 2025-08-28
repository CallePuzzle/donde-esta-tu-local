/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `activity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "activity_date_key" ON "public"."activity"("date");
