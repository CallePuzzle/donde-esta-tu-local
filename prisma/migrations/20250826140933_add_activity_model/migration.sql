-- CreateTable
CREATE TABLE "public"."activity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "placeGangId" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ActivityOrganisers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ActivityOrganisers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ActivityOrganisers_B_index" ON "public"."_ActivityOrganisers"("B");

-- AddForeignKey
ALTER TABLE "public"."activity" ADD CONSTRAINT "activity_placeGangId_fkey" FOREIGN KEY ("placeGangId") REFERENCES "public"."gang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ActivityOrganisers" ADD CONSTRAINT "_ActivityOrganisers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ActivityOrganisers" ADD CONSTRAINT "_ActivityOrganisers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."gang"("id") ON DELETE CASCADE ON UPDATE CASCADE;
