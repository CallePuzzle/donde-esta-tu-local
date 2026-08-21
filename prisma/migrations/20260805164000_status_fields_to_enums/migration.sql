-- CreateEnum
-- D3 (T10 aplazada): el código ya comparaba estos campos solo contra estos
-- literales exactos (unificados a REFUSED en el plan anterior); se convierten
-- de String libre a enums de Postgres/Prisma.
CREATE TYPE "public"."MembershipGangStatus" AS ENUM ('PENDING', 'VALIDATED', 'REFUSED');

CREATE TYPE "public"."GangStatus" AS ENUM ('PENDING', 'VALIDATED', 'REFUSED');

CREATE TYPE "public"."GangChangeType" AS ENUM ('CREATE', 'UPDATE');

-- AlterTable
ALTER TABLE "public"."user"
  ALTER COLUMN "membershipGangStatus" DROP DEFAULT,
  ALTER COLUMN "membershipGangStatus" TYPE "public"."MembershipGangStatus" USING ("membershipGangStatus"::text::"public"."MembershipGangStatus"),
  ALTER COLUMN "membershipGangStatus" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."gang"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "public"."GangStatus" USING ("status"::text::"public"."GangStatus"),
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."gang_history"
  ALTER COLUMN "changeType" TYPE "public"."GangChangeType" USING ("changeType"::text::"public"."GangChangeType");
