# Code review — `staging` contra `main` (PR #150, #152, #153)

Fecha: 2026-08-29
Rama revisada: `staging` (18e7860 `fix build`), que ya contiene las tres PR mergeadas.
Diff: `origin/main...staging` — 68 ficheros, 4509 inserciones, 445 borrados.

PR incluidas:

- [#150 — 106 notificaciones de las actividades](https://github.com/CallePuzzle/donde-esta-tu-local/pull/150)
- [#152 — Add onboarding tour with TourGuideJS](https://github.com/CallePuzzle/donde-esta-tu-local/pull/152)
- [#153 — 143 prisma 7](https://github.com/CallePuzzle/donde-esta-tu-local/pull/153)

## Estado de verificación

| Comando              | Resultado    |
| -------------------- | ------------ |
| `bun run lint`       | ✅           |
| `bun run check`      | ✅ 0 errores |
| `bun run test`       | ✅ 93/93     |
| `bun run only-build` | ✅           |
| `bun run test:e2e`   | no ejecutado |

Nota: `bun run check` fallaba inicialmente con 25 errores de claves de Paraglide inexistentes
(`tour_*`, `member_image_*`). No es un fallo del código: `src/lib/paraglide/` está gitignorado y la
copia local estaba desactualizada. Tras `bun run paraglide-js`, 0 errores.

## Valoración general

Trabajo sólido. Los comentarios explican el _por qué_ y no el _qué_, la cobertura de tests de las
tres piezas nuevas es buena, y las decisiones de seguridad están bien pensadas: `timingSafeEqual` en
el endpoint del cron, `requireSameOrigin` en los endpoints JSON, borrado de suscripción filtrado por
`userId`, el índice único de `activityId` usado como cerrojo contra crons solapados, y
`onDelete: Cascade` en ambas tablas nuevas.

Lo que sigue es lo que conviene arreglar antes de mergear a `main`.

---

## Bloqueantes

### 1. `console.log` de depuración en servidor de producción

`src/lib/server/push-send.ts:30`

```ts
} catch (error) {
    console.log('PUSH SEND ERROR:', error);   // ← esto
    if (error instanceof WebPushError && (error.statusCode === 410 || error.statusCode === 404)) {
```

Se dispara en cada fallo de envío, vuelca el error crudo a stdout (y a los logs de Vercel) y es
redundante con el `logger.error(error, 'Error enviando notificación push')` que está tres líneas más
abajo. Además va contra la convención explícita de AGENTS.md (usar `logger`, nunca `console.log`).

**Fix**: borrar la línea.

### 2. Fire-and-forget que Vercel puede no llegar a ejecutar

`src/routes/gang/add/+page.server.ts:89` y `src/routes/gang/addMember/+server.ts:119`

```ts
void notifyAdminsPendingGang(newGang).catch((error) => {
	logger.error(error, 'Error notifying admins about new pending gang');
});
return message(form, m.form_gang_add_successfully());
```

En el runtime serverless de Vercel la invocación puede congelarse en cuanto se envía la respuesta,
así que el aviso a los admins **puede no salir nunca en producción**. Los E2E no lo detectan porque
el dev server es un proceso de larga vida — de hecho el `page.waitForTimeout(500)` de
`notifications.spec.ts` es justo el síntoma de que se está apostando a que el proceso siga vivo.

**Fix**, dos opciones:

- `waitUntil()` de `@vercel/functions` (habría que añadir la dependencia, no está instalada), o
- simplemente `await`: `notifyAdmins*` ya usa `Promise.allSettled` y `sendPushNotification` no
  propaga errores, así que no puede tumbar la acción. El coste es latencia proporcional al número de
  admins suscritos, que hoy es ~1.

Recomendación: `await` por simplicidad; `waitUntil` solo si la latencia molesta.

---

## Restos de depuración

### 3. E2E con `console.log` y un sanity check que ensucia el estado

`e2e/helpers/push-server.ts:55,58` y `e2e/notifications.spec.ts:68,69,85` llevan trazas de
depuración. Peor que el ruido: el bloque de `e2e/notifications.spec.ts:66-69`

```ts
// Sanity check: el servidor de prueba responde desde este proceso
const sanity = await fetch(`${server.url}/ok`, { method: 'POST' });
console.log('Sanity check status:', sanity.status);
console.log('Fake push server requests after sanity:', server.getRequests());
```

hace un `fetch` real contra el servidor falso _antes_ del `try`, de modo que ese request queda
registrado en `getRequests()`. Hoy no rompe nada porque ese test no cuenta requests, pero el test de
admins sí hace `expect(requests).toHaveLength(1)` — es una trampa esperando a que alguien copie el
patrón.

### 4. Import muerto

`e2e/global-setup.ts:1` — `import { execSync } from 'node:child_process'` se quedó al quitar el
`bunx prisma generate`. Ni ESLint ni oxlint lo cazan con la config actual.

---

## Inconsistencias de configuración

### 5. `db:test:up` hardcodea podman y deja huérfano el script de reintentos

```diff
-"db:test:up": "bash e2e/scripts/db-test-up.sh",
-"db:test:down": "docker compose stop postgres-test"
+"db:test:up": "podman compose up -d",
+"db:test:down": "podman compose stop postgres-test"
```

Tres consecuencias:

1. `e2e/scripts/db-test-up.sh` ya no lo invoca nadie, y con él se pierden los 5 reintentos por el
   `netavark: nftables error` que AGENTS.md documenta como necesario.
2. AGENTS.md sigue diciendo `docker compose` y que `db:test:up` _es_ ese script: doc y código se
   contradicen.
3. Quien use docker en lugar de podman ya no puede correr los E2E.

Si el cambio a podman es intencionado, hay que actualizar AGENTS.md y borrar el script — pero perder
el retry parece un retroceso.

### 6. `VAPID_*` / `CRON_SECRET` con `$env/static/private` rompen el build si faltan

`src/lib/server/web-push.ts:1`. Verificado empíricamente: quitándolas del `.env`,
`bun run only-build` falla con

```
[MISSING_EXPORT] "VAPID_PUBLIC_KEY" is not exported by "\0virtual:env/static/private".
```

El README lo documenta, así que se entiende consciente, pero conviene sopesarlo:

- Contradice el criterio que `db.ts` justifica en su propio comentario (dinámico _precisamente_ para
  que el build no exija la variable).
- Rompe el `bun run only-build` que AGENTS.md manda usar siempre para verificar, a cualquiera que
  clone el repo sin claves VAPID.

`$env/dynamic/private` funcionaría idéntico, porque `setVapidDetails` corre a nivel de módulo en el
servidor, no en build.

### 7. Dependencia no declarada

`src/lib/types/tourguide.ts:1` — `import type { Side, AlignedPlacement } from '@floating-ui/core'`.
`@floating-ui/core` no está en `package.json`; llega transitivamente vía bits-ui. Es solo de tipos,
pero se rompe el día que bits-ui cambie de motor de posicionamiento.

**Fix**: declararlo como devDependency, o copiar los dos tipos (son uniones de literales).

---

## Endurecimiento y menores

- ~~**`/api/notifications/subscriptions` (DELETE) no lo llama nadie.**~~ Existía porque el plan lo
  pedía (`docs/plans/ms-marvel-orphan-metamorpho.md:554`) pero no estaba cableado a ningún botón.
  **Arreglado**: ahora lo llama el modal de "límite de dispositivos" de `NotificationToggle.svelte`
  (ver el punto siguiente) a través de `deleteAllSubscriptionsFromServer()`
  (`push-notifications.ts`).
- ~~**`endpoint: z.string().url()`**~~ (`subscribe/+server.ts:11`, `unsubscribe/+server.ts:11`)
  aceptaba cualquier URL. **Arreglado**: nuevo `pushEndpointSchema` en `src/lib/server/push-endpoint.ts`,
  usa `z.url()` (ya no el `.url()` deprecado en zod 4) y restringe el host a los push services
  conocidos (`fcm.googleapis.com`, `*.push.services.mozilla.com`, `web.push.apple.com`,
  `*.notify.windows.com`), aplicado en ambos endpoints.
- ~~**Sin tope de suscripciones por usuario**~~ ni rate limit en `/subscribe`. **Arreglado**: límite de
  `MAX_PUSH_SUBSCRIPTIONS_PER_USER = 10` (`src/lib/push-subscription-limit.ts`), aplicado en
  `savePushSubscription` (`push-subscription.ts`) — solo cuenta dispositivos nuevos, resincronizar un
  endpoint ya propio no bloquea. Al superarlo, `/subscribe` devuelve `409 { error: 'LIMIT_REACHED' }`
  y `NotificationToggle.svelte` muestra un modal (`Modal.svelte`) explicando que hay que borrar los
  dispositivos anteriores, con un botón que llama al DELETE del punto anterior. Sigue sin haber rate
  limit de peticiones (no pedido).
- ~~**`src/routes/+page.svelte`: el `$effect` que arranca el tour no tenía guarda de reentrada.**~~
  **Arreglado**: cerrojo `tourInProgress` en `continueOnboardingTour` (`tour.ts`) que descarta
  cualquier llamada solapada mientras otra sigue en curso.
- ~~**URL de blob hardcodeada**~~ — `src/routes/activities/+page.svelte:61`, el cartel de 2026 apunta
  a `https://aflgjnvgc42iwomt.public.blob.vercel-storage.com/...` en el markup. **Aposta, no es un
  bug**: confirmado por el usuario, no requiere cambio.
- ~~**Ternarios anidados para los `id` del tour**~~ en `DockLink.svelte` y `NavBarList.svelte`.
  **Arreglado**: `tourDesktopElementIds` / `tourMobileElementIds` en `tour.ts` centralizan esos ids.

---

## Lo que está bien y no hace falta tocar

- `sendActivityNotifications` crea el log **antes** de enviar, usando el índice único de `activityId`
  como cerrojo contra ejecuciones solapadas del cron.
- El `Set` de `expiredEndpoints` evita reintentar una suscripción caducada en las actividades
  siguientes de la misma pasada.
- `TIME_ZONE = 'Europe/Madrid'` en `format-date.ts`, con el comentario explicando que el runtime de
  Vercel corre en UTC.
- `waitForServiceWorkerReady` con timeout, para que el toggle no se quede colgado en `bun run dev`
  (donde SvelteKit no registra el service worker).
- La detección del `AbortError` de Chromium sin Google Play Services
  (`isPushServiceUnavailableError`), con mensaje de usuario propio.
- `firstVisible()` con `offsetParent` en `tour.ts` funciona correctamente con el Dock de daisyUI: el
  `.dock` es `position: fixed` pero sus hijos directos son `position: relative`, así que su
  `offsetParent` no es `null`.
- La migración a Prisma 7 está limpia: centralizar la resolución de URLs en `database-url.ts`,
  compartido entre `prisma.config.ts`, los seeds y la app, es la decisión correcta; y el proxy
  perezoso de `db.ts` está bien justificado.
