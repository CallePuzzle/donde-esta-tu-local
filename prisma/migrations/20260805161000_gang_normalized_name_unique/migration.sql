-- AlterTable
-- Añade normalizedName (name en minúsculas) con unicidad real, para cerrar la
-- carrera del check findFirst+create de gang/add (B2). Se backfillea desde
-- name y solo entonces se exige NOT NULL + UNIQUE.
--
-- IMPORTANTE: revisar antes de aplicar en staging/producción si ya existen
-- gangs con el mismo nombre salvo mayúsculas/minúsculas
-- (SELECT lower(name), count(*) FROM gang GROUP BY lower(name) HAVING count(*) > 1);
-- si los hay, resolver el duplicado a mano antes de crear el índice único.
ALTER TABLE "public"."gang" ADD COLUMN "normalizedName" TEXT;

UPDATE "public"."gang" SET "normalizedName" = lower("name");

ALTER TABLE "public"."gang" ALTER COLUMN "normalizedName" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "gang_normalizedName_key" ON "public"."gang"("normalizedName");
