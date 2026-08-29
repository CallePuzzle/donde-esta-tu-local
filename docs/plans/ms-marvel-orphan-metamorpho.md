# Notificaciones push para actividades

## Contexto

Actualmente la aplicación no tiene sistema de notificaciones. En versiones anteriores existía uno basado en Web Push + VAPID con la librería `web-push`, pero se descartó por considerarse engorroso. El objetivo es recuperar la funcionalidad de avisar a los usuarios de que una actividad va a comenzar, usando **Web Push propio** y dejando la ejecución periódica fuera de Vercel (cron externo).

Esta alternativa se elige sobre SaaS como OneSignal/FCM para mantener el control de los datos y evitar dependencias de terceros, y sobre Supabase Realtime porque Realtime solo notifica a clientes conectados (no envía push nativo cuando la app está cerrada).

---

## Decisiones de diseño

- **Un usuario puede tener varias suscripciones** (móvil, escritorio, reinstalaciones). Se modela con una tabla `PushSubscription` propia en vez de un campo JSON en `User`.
- **Idempotencia por actividad**: se registra qué notificaciones de actividad ya se han enviado para no repetirlas si el cron cae varias veces en la ventana válida.
- **Seguridad**: el endpoint de envío (cron) llevará un token compartido (`CRON_SECRET`) para que solo el scheduler autorizado lo invoque.
- **UX**: no se pide permiso de notificaciones al cargar la app. Se ofrece un toggle/botón en `/profile` o `/activities`, y solo si el usuario lo activa se solicita permiso y se suscribe.
- **Iconos**: se reutilizan `icon192.png` / `icon512.png` ya existentes.
- **Mensajes**: todos los textos de UI van a `messages/es.json` y se consumen vía Paraglide.

---

## 1. Prisma: modelo de datos

### 1.1. Nuevo modelo `PushSubscription`

En `prisma/schema.prisma`, tras `model Verification`:

```prisma
model PushSubscription {
  id        Int      @id @default(autoincrement())
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("push_subscription")
}
```

Y añadir la relación inversa en `model User`:

```prisma
  pushSubscriptions PushSubscription[]
```

### 1.2. Nuevo modelo `ActivityNotificationLog`

Tras `model Activity`, para evitar envíos duplicados:

```prisma
model ActivityNotificationLog {
  id         Int      @id @default(autoincrement())
  activityId Int      @unique
  activity   Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  notifiedAt DateTime @default(now())

  @@map("activity_notification_log")
}
```

Añadir la relación inversa en `model Activity`:

```prisma
  notificationLog ActivityNotificationLog?
```

### 1.3. Migración

Crear migración manual `prisma/migrations/20260826120000_push_notifications/migration.sql`:

```sql
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
```

Ejecutar `bunx prisma generate` después de la migración.

---

## 2. Variables de entorno

Añadir en `.env.example`:

```env
# Web Push (VAPID)
# Generar con: bunx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:app@montemayordepililla.cc

# Token secreto para proteger el endpoint de envío de notificaciones (cron externo)
CRON_SECRET=
```

También añadir a los entornos de producción y a `.env.test` (con valores dummy para tests, nunca los reales).

---

## 3. Módulos del servidor

### 3.1. Configuración de `web-push`

Nuevo `src/lib/server/web-push.ts`:

```ts
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } from '$env/static/private';
import webpush from 'web-push';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export { webpush };
export type { PushSubscription } from 'web-push';
```

### 3.2. Servicio de suscripciones

Nuevo `src/lib/server/push-subscription.ts`:

- `savePushSubscription(userId: string, subscription: PushSubscriptionJSON): Promise<void>` — upsert por `endpoint` (evita duplicados si el usuario reinstala).
- `deletePushSubscription(endpoint: string): Promise<void>`.
- `deletePushSubscriptionsByUser(userId: string): Promise<void>`.
- `getActivePushSubscriptions(): Promise<{ userId: string; subscription: PushSubscriptionJSON }[]>` — usado por el cron.

### 3.3. Servicio de envío

Nuevo `src/lib/server/push-send.ts`:

- `sendPushNotification(subscription: PushSubscriptionJSON, payload: object): Promise<void>` — envuelve `webpush.sendNotification`, captura errores 410/404 y borra la suscripción caducada.
- `buildActivityPayload(activity: ActivityWithPlace): object` — construye el payload con `title`, `body`, `icon`, `badge`, `tag`, `data.url`, etc.
- `sendActivityNotifications(windowMinutes = 60): Promise<{ sent: number; failed: number; activities: number }>` — lógica principal:
  1. Buscar actividades futuras cuya `date` esté entre `now` y `now + windowMinutes` y que no tengan `notificationLog`.
  2. Para cada actividad, enviar a todas las suscripciones activas.
  3. Crear el registro en `ActivityNotificationLog` una vez enviada (o tras el intento, para no spamear en reintentos).

---

## 4. Endpoints API

### 4.1. `POST /api/notifications/subscribe`

Nuevo `src/routes/api/notifications/subscribe/+server.ts`:

1. `requireUser(event.locals)`.
2. Parsear y validar el cuerpo JSON: `{ endpoint, keys: { p256dh, auth } }`.
3. Llamar a `savePushSubscription(user.id, subscription)`.
4. Responder `{ success: true }`.

Protección CSRF: los endpoints de API JSON no forman parte de form actions, así que se usa `requireSameOrigin` de `$lib/server/csrf.ts` (igual que los endpoints de miembros).

### 4.2. `POST /api/notifications/unsubscribe`

Nuevo `src/routes/api/notifications/unsubscribe/+server.ts`:

1. `requireUser(event.locals)`.
2. Recibir `{ endpoint }`.
3. Borrar la suscripción por endpoint (sin comprobar userId; si alguien conoce el endpoint propio, puede borrarlo; no es información sensible).
4. También se ofrece un endpoint `DELETE /api/notifications/subscriptions` para borrar todas las del usuario (desde `/profile`).

### 4.3. `POST /api/notifications/send` (cron)

Nuevo `src/routes/api/notifications/send/+server.ts`:

1. Leer cabecera `Authorization: Bearer <CRON_SECRET>` y comparar con `CRON_SECRET`.
2. Si no coincide, responder `401`.
3. Ejecutar `sendActivityNotifications()`.
4. Responder con estadísticas `{ sent, failed, activities }`.

Se usa `POST` en vez de `GET` para evitar crawlers/Logs accidental.

---

## 5. Cliente

### 5.1. Service worker: evento `push`

Añadir en `src/service-worker.js` al final:

```js
self.addEventListener('push', (event) => {
	if (!event.data) return;

	const data = event.data.json();
	const title = data.title ?? 'Peñas Montemayor';
	const options = {
		body: data.body,
		icon: data.icon ?? '/icon192.png',
		badge: data.badge ?? '/icon192.png',
		tag: data.tag,
		data: data.data ?? {}
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = event.notification.data?.url ?? '/';
	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			for (const client of clientList) {
				if (client.url === url && 'focus' in client) {
					return client.focus();
				}
			}
			if (self.clients.openWindow) {
				return self.clients.openWindow(url);
			}
		})
	);
});
```

### 5.2. Utilidades de suscripción en cliente

Nuevo `src/lib/utils/push-notifications.ts`:

- `isPushSupported(): boolean` — `'serviceWorker' in navigator && 'PushManager' in window`.
- `getExistingSubscription(): Promise<PushSubscription | null>`.
- `subscribeToPush(publicKey: string): Promise<PushSubscription>` — `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) })`.
- `unsubscribeFromPush(): Promise<void>`.
- `sendSubscriptionToServer(subscription: PushSubscription, fetch: typeof window.fetch): Promise<void>`.
- `urlBase64ToUint8Array(base64String: string): Uint8Array`.

### 5.3. Integración en el layout

En `src/routes/+layout.server.ts`, añadir `VAPID_PUBLIC_KEY` al return:

```ts
import { VAPID_PUBLIC_KEY } from '$env/static/private';

return { user, path, appUrl, vapidPublicKey: VAPID_PUBLIC_KEY };
```

En `src/routes/+layout.svelte`, no se fuerza la suscripción automática. Se deja para un componente de opt-in en `/profile` o `/activities`.

### 5.4. Componente de activación

Nuevo componente `src/lib/components/NotificationToggle.svelte`:

- Muestra un toggle "Recibir avisos de actividades".
- Si el usuario lo activa: solicita permiso (`Notification.requestPermission()`), si es `granted` se suscribe y envía al servidor.
- Si lo desactiva: se desuscribe y borra la suscripción del servidor.
- Maneja estados de carga y errores.
- Solo visible si `isPushSupported()`.

Ubicación propuesta: en `/profile`, junto al formulario de usuario.

---

## 6. UI y textos

### 6.1. Página `/profile`

En `src/routes/profile/+page.svelte`, añadir `<NotificationToggle vapidPublicKey={data.vapidPublicKey} />`.

### 6.2. Mensajes de Paraglide

Añadir en `messages/es.json`:

```json
{
	"push_notifications_title": "Avisos de actividades",
	"push_notifications_description": "Recibe una notificación cuando una actividad esté a punto de comenzar.",
	"push_notifications_enable": "Activar avisos",
	"push_notifications_disable": "Desactivar avisos",
	"push_notifications_permission_denied": "Has bloqueado las notificaciones. Actívalas en la configuración del navegador.",
	"push_notifications_subscribe_error": "No se ha podido activar el aviso. Inténtalo de nuevo.",
	"push_notifications_unsubscribe_error": "No se ha podido desactivar el aviso. Inténtalo de nuevo.",
	"push_notification_activity_title": "¡Actividad próxima!",
	"push_notification_activity_body": "La actividad \"{activity}\" comenzará a las {time} en {place}."
}
```

Recompilar con `bun run paraglide-js`.

---

## 7. Cron externo

El cron no vivirá en Vercel. Configuración sugerida:

- **Frecuencia**: cada 5 minutos.
- **URL**: `POST https://<tu-dominio>/api/notifications/send`.
- **Cabecera**: `Authorization: Bearer <CRON_SECRET>`.
- **Ventana de envío**: `sendActivityNotifications(60)` busca actividades que empiecen en la próxima hora. Con un cron de 5 minutos, cada actividad se notificará una sola vez gracias a `ActivityNotificationLog`.

Opciones de cron externo: cualquier scheduler que haga HTTP (GitHub Actions, cron en VPS, UptimeRobot, etc.).

---

## 8. Tests

### 8.1. Tests unitarios

Añadir en `src/lib/server/push-subscription.test.ts` (o similar con Vitest):

- Upsert por endpoint.
- Borrado de suscripción caducada.

### 8.2. Tests E2E (Playwright)

En `e2e/`:

- Test de opt-in simulado: no se puede suscribir realmente en Chromium headless sin mock, pero se puede verificar que el toggle aparece y que el endpoint devuelve 401 sin `CRON_SECRET`.
- Test del endpoint de envío con `CRON_SECRET` válido, creando una actividad dentro de la ventana y verificando que responde con `activities: 1`.

---

## 9. Dependencias

Añadir `web-push`:

```bash
bun add web-push
bun add -D @types/web-push
```

---

## 10. Comandos de verificación

Tras implementar:

```bash
bunx prisma generate
bun run check
bun run lint
bun run test
bun run only-build
```

---

## Resumen de archivos a crear/modificar

**Crear:**

- `prisma/migrations/20260826120000_push_notifications/migration.sql`
- `src/lib/server/web-push.ts`
- `src/lib/server/push-subscription.ts`
- `src/lib/server/push-send.ts`
- `src/routes/api/notifications/subscribe/+server.ts`
- `src/routes/api/notifications/unsubscribe/+server.ts`
- `src/routes/api/notifications/send/+server.ts`
- `src/lib/utils/push-notifications.ts`
- `src/lib/components/NotificationToggle.svelte`
- Tests unitarios/E2E según convenga.

**Modificar:**

- `prisma/schema.prisma`
- `.env.example`
- `src/service-worker.js`
- `src/routes/+layout.server.ts`
- `src/routes/+layout.svelte` (solo si se añade indicador global; el toggle se coloca en `/profile`)
- `src/routes/profile/+page.svelte`
- `messages/es.json`
- `package.json` (dependencias)

---

## Notas de seguridad

- `VAPID_PRIVATE_KEY` y `CRON_SECRET` nunca se exponen al cliente.
- El endpoint `/api/notifications/send` sin autenticación podría usarse para spam o filtrar suscriptores; el token bearer lo mitiga.
- Las suscripciones se borran automáticamente cuando un usuario es eliminado (`onDelete: Cascade`).
- Se valida origen en endpoints de suscripción con `requireSameOrigin`.

---

## Notas sobre la rama `origin/106-notificaciones-de-las-actividades`

La rama ya experimentó con Web Push. De ella se puede aprovechar lo siguiente, aunque hay que adaptarlo al diseño de este plan:

### Reutilizable directamente

- **Dependencias**: `web-push` y `@types/web-push` ya están en `package.json` / `bun.lock`.
- **Configuración de VAPID**: `src/lib/server/web-push.ts` ya inicializa `webpush.setVapidDetails(...)`. Hay que cambiar el `subject` hardcodeado por `VAPID_SUBJECT` (o reutilizar `SMPT_SENDER` si se prefiere, aunque el plan propone un subject dedicado).
- **Helper de cliente `urlBase64ToUint8Array`**: en `src/lib/notification/notification-subscribe-user.ts`. Se necesita para convertir la clave VAPID pública antes de `pushManager.subscribe`.

### Reutilizable con adaptaciones importantes

- **Suscripción de usuario**: la rama guarda la suscripción como JSON en un campo `subscription` de `User` y la envía desde `src/lib/notification/notification-subscribe-user.ts`. Este plan propone una tabla `PushSubscription` separada; hay que migrar la lógica de guardado/borrado al servicio descrito en `src/lib/server/push-subscription.ts`, pero la secuencia (`getSubscription` → `subscribe` → POST al servidor) y la conversión de la clave pública sirven.
- **Envío de notificaciones**: `src/routes/activities/send-notification/+server.ts` contiene la lógica de iterar actividades, construir el payload, enviar con `webpush.sendNotification` y eliminar suscripciones caducadas en caso de error `410`. Esa lógica se puede trasladar a `src/lib/server/push-send.ts`, pero hay que:
  - Cambiar el endpoint de `GET` a `POST`.
  - Añadir autenticación con `CRON_SECRET`.
  - Reemplazar el campo `User.subscription` por la tabla `PushSubscription`.
  - Reemplazar `hasBeenNotified` + `notificationDate` por `ActivityNotificationLog` (idempotencia por actividad sin modificar el modelo `Activity`).

### Descartar o evitar

- **Suscripción automática en el layout**: la rama pide permiso y suscribe al cargar `src/routes/+layout.svelte`. Este plan opta por opt-in explícito en `/profile`; hay que eliminar ese `onMount` del layout.
- **Campo JSON `User.subscription`**: no permite varias suscripciones por usuario ni borra de forma limpia las caducadas; se sustituye por el modelo `PushSubscription`.
- **Endpoint `GET /activities/send-notification` abierto**: no tiene protección de cron. Se sustituye por `POST /api/notifications/send` con `Authorization: Bearer <CRON_SECRET>`.
- **Endpoint de test `/notification/test`**: útil solo para pruebas manuales; no debe llegar a producción.
- **Uso de `cf-webpush`**: la rama lo incluyó en un primer commit y luego migró a `web-push`. No es necesario mantenerlo.
- **Textos hardcodeados**: la rama tiene textos en español directamente en el payload (`"¡Actividad próxima!"`). Deben pasar a `messages/es.json` y consumirse vía Paraglide.

### Decisión sobre `notificationDate` / `hasBeenNotified`

La rama añadió estos campos a `Activity` para decidir cuándo y si se había notificado. Este plan prefiere un modelo aparte (`ActivityNotificationLog`) porque:

1. No ensucia el modelo de dominio con metadatos de envío.
2. Facilita auditoría futura (timestamp real de envío, posibilidad de reintentos).
3. Mantiene la idempotencia sin depender de un booleano que puede quedar en un estado inconsistente.

Si se quiere una implementación más ligera, los campos de la rama funcionan, pero se desvía del diseño descrito aquí.

---

# Code review de la rama `106-notificaciones-de-las-actividades` vs `origin/main`

_Revisión realizada el 2026-08-27 sobre `be963e0` (5 commits, 23 ficheros, +1297)._

## Estado de las verificaciones

| Comando                                  | Resultado                     |
| ---------------------------------------- | ----------------------------- |
| `bun run check`                          | ✅ 4129 ficheros, 0 errores   |
| `bun run lint`                           | ✅ Prettier + ESLint limpios  |
| `bun run test`                           | ✅ 76 tests, 12 ficheros      |
| `bunx playwright test notifications`     | ✅ 3/3                        |
| `bun run only-build`                     | ✅                            |
| `prisma migrate deploy` sobre BD de test | ✅ la migración aplica limpia |

## Lo que está bien

- La limpieza de la implementación antigua es completa: no quedan `cf-webpush`, `User.subscription`, `src/lib/notification/`, `/notification/test` ni `GET /activities/send-notification`.
- Dependencias en la sección correcta (`web-push` en `dependencies`, `@types/web-push` en `devDependencies`).
- `subscribe` y `unsubscribe` llevan `requireSameOrigin` + `requireUser`, y validan el cuerpo con Zod.
- `resetDb` de E2E actualizado con las tablas nuevas.
- El endpoint de cron comprueba también `!CRON_SECRET`, así que un `.env` sin la variable no abre el endpoint.

---

## Bugs de corrección

### 1. El texto de la notificación es agramatical — `src/lib/server/push-send.ts:34`

`formatWeekdayDayTime` devuelve `"jueves 27, 20:30"`, y el mensaje es `"comenzará a las {time}"`:

> La actividad "Cena" comenzará a las **jueves 27, 20:30** en Peña X.

Hace falta un formateador de solo hora (`{ hour: '2-digit', minute: '2-digit' }`) para `{time}`, o reescribir el mensaje para que acepte fecha completa (`"comenzará el {time}"`).

### 2. Zona horaria: la hora será incorrecta en producción — `src/lib/server/push-send.ts:34`

Es el **primer uso en servidor** de `format-date.ts`. Los helpers no fijan `timeZone`, así que usan la del proceso; `src/lib/utils/format-date.test.ts:12` hace `process.env.TZ = 'Europe/Madrid'` precisamente por eso. En Vercel el runtime va en UTC, con lo que la notificación anunciará una actividad de las 20:30 como las 18:30. Hay que pasar `timeZone: 'Europe/Madrid'` en el formateo del payload (y probablemente extraerlo a una constante compartida en `format-date.ts`).

### 3. Actividad sin lugar → `"... en ."` — `src/lib/server/push-send.ts:33`

`const place = activity.placeGang?.name ?? activity.placeDesc ?? ''`. Si la actividad no tiene ni `placeGang` ni `placeDesc`, el cuerpo queda `La actividad "X" comenzará a las ... en .`. Hace falta una variante del mensaje sin lugar.

### 4. `notificationclick` nunca reutiliza la pestaña abierta — `src/service-worker.js:77`

`client.url === url` compara la URL absoluta del cliente (`https://dominio/activities`) con la relativa del payload (`/activities`): no coincide jamás, así que siempre se abre una ventana nueva aunque la app ya esté abierta. Resolver contra el origen (`new URL(url, self.location.origin).href`) y, si hay cliente en otra ruta, hacer `focus()` + `navigate()`.

### 5. El contador `sent` miente — `src/lib/server/push-send.ts:71-72`

`sendPushNotification` captura los 410/404, borra la suscripción y **retorna sin error**, así que el bucle hace `sent++` para suscripciones caducadas que no han recibido nada. `failed` se queda a 0 en el caso más habitual de fallo. Devolver un resultado (`'sent' | 'expired' | 'failed'`) en vez de `void`.

### 6. Carrera entre ejecuciones del cron y 500 en cascada — `src/lib/server/push-send.ts:78-80`

El log se crea **después** de enviar. Con un cron cada 5 minutos y una ejecución lenta, dos invocaciones solapadas ven ambas `notificationLog: null` → doble notificación; y el segundo `create` viola el índice único de `activityId` → excepción no capturada → el endpoint responde 500 **y las actividades restantes del bucle se quedan sin log**, con lo que se reenviarán en la siguiente pasada.

Arreglo: usar el log como cerrojo, creándolo _antes_ de enviar y capturando el P2002 para saltar la actividad; o `createMany({ data: [...], skipDuplicates: true })`. En cualquier caso, envolver el `create` en try/catch para que un fallo no aborte el resto del bucle.

### 7. Las suscripciones caducadas se reintentan dentro de la misma pasada — `src/lib/server/push-send.ts:63,69`

`subscriptions` es una foto tomada una sola vez. Si en la actividad A una suscripción da 410 y se borra, en la actividad B se vuelve a intentar (otro 410, otro `deleteMany`). Mantener un `Set` de endpoints caídos y filtrarlo en las iteraciones siguientes.

### 8. En `bun run dev` el toggle se queda colgado — `src/lib/utils/push-notifications.ts:9,19`

`navigator.serviceWorker.ready` **no resuelve nunca** si no hay service worker registrado, y SvelteKit solo registra `src/service-worker.js` automáticamente en builds de producción (no hay registro manual en `+layout.svelte` ni `kit.serviceWorker.register` en `svelte.config.js`). En desarrollo, al pulsar el toggle `loading` se queda a `true` indefinidamente, sin error ni forma de recuperarse. Comprobar antes con `navigator.serviceWorker.getRegistration()` o poner un `Promise.race` con timeout y mostrar error.

### 9. El estado del toggle no se sincroniza con el servidor — `src/lib/components/NotificationToggle.svelte:29-30`

`enabled` sale solo de `getExistingSubscription()`, es decir del navegador. Si la fila de `push_subscription` desapareció (borrado por 410, reseteo de BD, usuario recreado), el toggle aparece activado pero no llega nada, y el usuario no tiene forma de resincronizar salvo apagar y encender. Como `savePushSubscription` es un upsert idempotente, lo barato es reenviar la suscripción existente al servidor en el `onMount`.

### 10. `isPushSupported` no comprueba `Notification` — `src/lib/utils/push-notifications.ts:4`

Comprueba `serviceWorker` y `PushManager` pero luego se llama a `Notification.requestPermission()`. En navegadores donde `Notification` no existe (Safari iOS en pestaña, sin instalar como PWA) esto lanza y se muestra el error genérico de suscripción en vez de un mensaje útil. Añadir `'Notification' in window` al check y, para iOS, considerar un texto que explique que hay que instalar la app en la pantalla de inicio.

---

## Seguridad

### 11. `unsubscribe` no comprueba la propiedad — `src/routes/api/notifications/unsubscribe/+server.ts:16,31`

`requireUser(event.locals)` se llama pero se descarta el retorno, y el borrado es por `endpoint` a secas: cualquier usuario autenticado que conozca un endpoint ajeno puede desuscribirlo. El plan lo aceptaba conscientemente, pero el arreglo es una línea y elimina la discusión:

```ts
const user = requireUser(event.locals);
await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
```

### 12. Comparación no constante del `CRON_SECRET` — `src/routes/api/notifications/send/+server.ts:12`

`token !== CRON_SECRET` es vulnerable en teoría a timing. Riesgo real bajo (red de por medio, sin rate limit tampoco), pero `crypto.timingSafeEqual` sobre buffers de igual longitud es trivial.

### 13. Se registra el endpoint de push completo en producción — `src/lib/server/push-send.ts:24`

`logger.info({ endpoint }, ...)`. Un endpoint de push es una URL-capacidad: quien la tenga (más las claves) puede enviar notificaciones a ese dispositivo. `logger.debug` queda silenciado en prod, pero este es `info`. Registrar solo el id de la fila o un hash.

### 14. `vapidPublicKey` viaja en el payload de todas las páginas — `src/routes/+layout.server.ts:12`

No es una fuga (es la clave _pública_), pero se envía a todos los visitantes, incluidos los anónimos, en cada navegación, cuando solo lo usa `/profile`. Moverlo a `src/routes/profile/+page.server.ts`.

---

## Diseño y desviaciones del plan

### 15. Falta el endpoint `DELETE /api/notifications/subscriptions` (plan §4.2.4)

No está implementado. `deletePushSubscriptionsByUser` (`push-subscription.ts:32`) es código muerto: su único consumidor es su propio test.

### 16. `isVapidKeyValid` es código muerto — `src/lib/utils/push-notifications.ts:13`

Solo se usa dentro de un `logger.debug` en la línea 18. O se usa para validar de verdad antes de suscribir (con error claro si la clave está mal configurada) o se borra.

### 17. Logging de depuración del commit 3585d81 sin limpiar

`subscribe/+server.ts:19-22`, `push-notifications.ts:18,20,26`, `NotificationToggle.svelte:44,46,53,55,59`. Están a nivel `debug`, así que no salen en producción, pero son ruido y hay duplicados: `"Suscripción push obtenida"` se emite dos veces (`push-notifications.ts:26` y `NotificationToggle.svelte:53`) para el mismo evento. Dejar como mucho un `debug` por paso.

### 18. Cast innecesario — `src/lib/server/push-send.ts:68`

`activity as ActivityWithPlace`: el `findMany` con `include: { placeGang: true }` ya devuelve ese tipo. El cast no hace falta y, si el `include` cambia, oculta el error en vez de mostrarlo.

### 19. Se notifica a todos los suscriptores de todas las actividades

Es lo que decía el plan, pero conviene dejarlo escrito como decisión de producto: no hay segmentación por peña ni por interés. Si crecen las actividades, esto se convierte en spam y habrá que filtrar por `placeGangId` / membresía.

### 20. Idempotencia demasiado rígida ante ediciones

Si se edita la fecha de una actividad ya notificada, el log sigue ahí y no se vuelve a avisar. Además no hay política de retención para `activity_notification_log`, que crece sin límite. Ambas cosas son aceptables ahora; merecen una nota en el código.

### 21. Envío secuencial dentro de una función serverless — `src/lib/server/push-send.ts:67-77`

`await` anidado sobre actividades × suscripciones. Con el `nodejs22.x` de Vercel el techo es el timeout de la función. Ahora mismo no es problema; conviene pasar a `Promise.allSettled` por lotes antes de que crezca el número de suscriptores.

### 22. `prisma/schema.prisma:52` sin formatear

```prisma
  validatedGangs Gang[]        @relation("ValidatedBy")
  modifiedGangs  GangHistory[] @relation("ModifiedBy")
  pushSubscriptions PushSubscription[]
```

La línea nueva no está alineada con el resto del bloque; `bunx prisma format` la reescribiría. (Prettier no cubre `.prisma`, por eso el lint pasa.)

---

## Tests

### 23. `push-subscription.test.ts` es casi tautológico

Los cuatro tests comprueban que Prisma se llama con los argumentos que la función está escrita para pasar. No detectan ningún fallo realista. La lógica que sí merece test unitario está en `push-send.ts`: la rama 410 → borrado, los contadores `sent`/`failed`, y los límites de la ventana (`gte: now` / `lte: windowEnd`). Se puede hacer mockeando `web-push`.

### 24. Los E2E no llegan a enviar nada

`e2e/notifications.spec.ts` cubre bien el 401, la ventana y la idempotencia, pero como la BD de test no tiene filas en `push_subscription`, `webpush.sendNotification` no se ejecuta jamás. Sembrar una suscripción falsa haría que el test cubriera el camino de envío y el borrado por 410.

### 25. No hay test de que el toggle aparezca en `/profile`

El plan §8.2 lo contemplaba y no está.

---

## Documentación

### 26. Falta documentar variables y cron

- La tabla de variables de `README.md:35-40` no incluye `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` ni `CRON_SECRET`.
- No hay nada que explique el cron externo del plan §7 (URL, método `POST`, cabecera `Authorization: Bearer`, cada 5 minutos).
- **Importante para el despliegue**: se usa `$env/static/private`, que se resuelve en tiempo de build. Si las cuatro variables no están dadas de alta en Vercel **antes** del deploy, el build falla. Conviene decirlo explícitamente en el README.

### 27. `db:seed-test-notifications` sin documentar

El script nuevo (`package.json:31`) no aparece en la lista de comandos del README (`README.md:44-48`), a diferencia de los otros seeds.

---

## Prioridad sugerida

1. **Bloqueantes antes de producción**: 2 (zona horaria), 1 y 3 (textos), 6 (carrera del log del cron), 4 (`notificationclick`).
2. **Importantes**: 11 (propiedad en unsubscribe), 8 (cuelgue en dev), 9 (desincronización del toggle), 5 (contadores), 26 (variables en Vercel).
3. **Limpieza**: 15-18, 22, y los tests 23-25.
