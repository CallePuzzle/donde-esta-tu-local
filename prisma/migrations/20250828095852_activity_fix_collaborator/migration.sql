/*
  Warnings:

  - You are about to drop the `_ActivityOrganisers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_ActivityOrganisers" DROP CONSTRAINT "_ActivityOrganisers_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ActivityOrganisers" DROP CONSTRAINT "_ActivityOrganisers_B_fkey";

-- DropTable
DROP TABLE "public"."_ActivityOrganisers";

-- CreateTable
CREATE TABLE "public"."_ActivityCollaborator" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ActivityCollaborator_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ActivityCollaborator_B_index" ON "public"."_ActivityCollaborator"("B");

-- AddForeignKey
ALTER TABLE "public"."_ActivityCollaborator" ADD CONSTRAINT "_ActivityCollaborator_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ActivityCollaborator" ADD CONSTRAINT "_ActivityCollaborator_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."gang"("id") ON DELETE CASCADE ON UPDATE CASCADE;
