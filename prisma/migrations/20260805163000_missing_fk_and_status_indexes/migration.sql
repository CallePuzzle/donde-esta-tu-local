-- CreateIndex
-- Postgres no indexa las FK automáticamente; user.gangId, user.membershipGangStatus
-- y gang.status se filtran en cada listado de miembros y en los contadores de /admin (D1).
CREATE INDEX "user_gangId_idx" ON "public"."user"("gangId");

CREATE INDEX "user_membershipGangStatus_idx" ON "public"."user"("membershipGangStatus");

CREATE INDEX "gang_status_idx" ON "public"."gang"("status");
