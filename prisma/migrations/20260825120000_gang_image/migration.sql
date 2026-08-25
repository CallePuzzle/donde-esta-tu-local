-- AlterTable
-- Foto de la peña: solo la URL pública del blob de Vercel, igual que user.image.
-- Nullable porque ninguna peña existente tiene foto y no es obligatoria.
ALTER TABLE "public"."gang" ADD COLUMN "image" TEXT;
