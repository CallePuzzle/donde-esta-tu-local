-- AlterTable
ALTER TABLE "public"."gang" ADD COLUMN     "validatedByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."gang" ADD CONSTRAINT "gang_validatedByUserId_fkey" FOREIGN KEY ("validatedByUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
