-- CreateIndex
-- B3 añade un límite de altas de peña por usuario y día, consultando
-- gang_history por changedByUserId; sin índice sería un full scan.
CREATE INDEX "gang_history_changedByUserId_idx" ON "public"."gang_history"("changedByUserId");
