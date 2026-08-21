-- AlterTable
-- Columna muerta: era del push del service worker, eliminado al migrar a
-- Vercel. Contenía PII (endpoint de push por usuario) sin ningún uso.
ALTER TABLE "public"."user" DROP COLUMN "subscription";
