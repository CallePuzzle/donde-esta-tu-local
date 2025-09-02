-- AlterTable
ALTER TABLE "public"."activity" ADD COLUMN     "hasBeenNotified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationDate" TIMESTAMP(3);
