-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "gangId" INTEGER;

-- CreateTable
CREATE TABLE "public"."Gang" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Gang_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_gangId_fkey" FOREIGN KEY ("gangId") REFERENCES "public"."Gang"("id") ON DELETE SET NULL ON UPDATE CASCADE;
