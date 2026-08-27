-- CreateTable
-- Suscripciones push de los usuarios. Un usuario puede tener varias
-- (dispositivos distintos, reinstalaciones, etc.).
CREATE TABLE "public"."push_subscription" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "push_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscription_endpoint_key" ON "public"."push_subscription"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscription_userId_idx" ON "public"."push_subscription"("userId");

-- AddForeignKey
ALTER TABLE "public"."push_subscription" ADD CONSTRAINT "push_subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
-- Registro de envíos para no repetir la notificación de una actividad.
CREATE TABLE "public"."activity_notification_log" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "notifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_notification_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activity_notification_log_activityId_key" ON "public"."activity_notification_log"("activityId");

-- AddForeignKey
ALTER TABLE "public"."activity_notification_log" ADD CONSTRAINT "activity_notification_log_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
