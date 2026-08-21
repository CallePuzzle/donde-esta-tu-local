# Plan: code review completo de donde-esta-tu-local (post-upgrade 2026)

> **Estado**: cerrado (2026-08-05). Las 57 tareas (S1-S10, B1-B20, D1-D5, Q1-Q16, T1-T6) están
> implementadas, cada una en su propio commit. `bun run check` y `bun run lint` quedan a 0
> errores/warnings (T5); `bun run test` (Vitest, añadido en Q15) y `bun run only-build` en verde;
> `bun audit` 0 vulnerabilidades.
>
> **Migraciones pendientes de aplicar contra una base de datos real** (staging primero, revisar el
> SQL a mano): B2 (`Gang.normalizedName` único), B3/D1 (índices), D3 (enums de
> `membershipGangStatus`/`Gang.status`/`GangHistory.changeType`), S9 (`DROP TABLE email_sent`). Nada
> de esto se ha ejecutado contra `DATABASE_URL` en ningún momento de esta sesión.
>
> **Decisiones tomadas con el usuario** (no estaban cerradas en el plan original): S2 se borró el
> endpoint en vez de uniformar la respuesta; B3 es un límite de 3 altas de peña por usuario y día
> (no "una peña por usuario"); B7 es el arreglo mínimo (limpiar `gangId` al rechazar, sin remodelar
> la membresía a tabla propia — sigue pendiente si se quiere resolver B7/B8 de raíz); D2
> (`Activity.date @unique`) se confirmó intencionado, no se toca; T3 se reactivó la categoría
> `correctness` de oxlint. T6 (Prisma 7) se reintentó y se sigue aplazando: bloqueante nuevo y más
> básico que el original (`datasource.url` eliminado del schema en Prisma 7), documentado en su
> tarea.
>
> Este plan es el resultado de una revisión de todo `src/`, `prisma/` y la configuración,
> hecha **después** de completar
> [`black-canary-aquaman-captain-america.md`](./black-canary-aquaman-captain-america.md).
> No repite lo que ese plan ya resolvió; sí recoge:
>
> - hallazgos nuevos (la mayoría),
> - restos concretos de tareas que se marcaron como hechas pero quedaron a medias
>   (marcados con **[resto de TN]**),
> - las dos tareas que se aplazaron a conciencia (T10 enums, T14 Prisma 7).
>
> **Alcance del review**: 62 ficheros de `src/` (excluyendo `src/lib/paraglide/**`, generado),
> `prisma/schema.prisma` + migraciones, y `svelte.config.js` / `vite.config.ts` /
> `eslint.config.js` / `.oxlintrc.json` / `tsconfig.json` / `package.json`.
>
> **Baseline de verificación no re-ejecutado en esta sesión** (fallo del entorno al lanzar
> `bun run check`). El último dato conocido, del plan anterior: `check` 0 errores + 11 warnings
> `state_referenced_locally`, `lint` exit 0 con 5 warnings de `eslint-disable` sin usar,
> `only-build` verde, `bun audit` 0 vulnerabilidades. **Antes de empezar, re-ejecutar
> `bun run check` y `bun run lint` para fijar el punto de partida.**
>
> Recordatorio: usar `bun run only-build` para verificar, **nunca** `bun run build` (aplica
> migraciones contra la BD real).

---

## Fase 1 — Seguridad y privacidad

- [x] **S1. Los emails de login acaban en los logs de producción** — `src/lib/handles/logging-handle.ts:8-16`
      loguea a nivel `info` la URL completa, la IP y el user-agent de **todas** las peticiones.
      `FormLogin.svelte:46-48` llama a `/api/user/email-sent-check?email=<email>`, así que cada
      intento de login escribe el email del usuario en el log. Además se loguean también los assets
      (`_app/immutable/**`, favicon, service worker), lo que multiplica el volumen y el coste.
      Arreglo: loguear `url.pathname` (nunca el query string, o redactándolo), bajar IP/user-agent a
      `debug` o hashear la IP, y saltarse las peticiones que no sean de página/API.
- [x] **S2. `/api/user/email-sent-check` sigue permitiendo enumerar cuentas** — `src/routes/api/user/email-sent-check/+server.ts`.
      Es público, sin sesión y sin rate limit propio, y **distingue** respuestas
      (`{canSend:true}` vs `magic_link_already_sent({remainingSeconds})`), así que revela si un email
      ha pedido OTP hace menos de 5 minutos. **[resto de T4]**: la nota decía "respuesta uniforme" y no
      lo es. Además hace una query a BD por cada llamada anónima. Decisión a tomar: borrarlo (el rate
      limit real ya está en better-auth, `auth.ts:26-37`, y el chequeo de cliente es solo cosmético)
      o dejarlo con respuesta uniforme + rate limit.
- [x] **S3. Una consulta de sesión por cada petición, incluidos los assets** — `src/lib/handles/better-auth-handle.ts:8-10`
      llama a `auth.api.getSession()` antes de `resolve()` sin filtrar la ruta, así que cada
      `_app/immutable/*.js`, `favicon.png` y `service-worker.js` provoca un round-trip a Postgres/Accelerate.
      Arreglo: cortocircuitar para rutas estáticas/inmutables, o resolver la sesión de forma perezosa
      (getter en `event.locals`) para que solo la paguen los `load`/actions que la usan.
- [x] **S4. Endurecer CSP y cabeceras** — `src/lib/handles/security-headers-handle.ts:14-30`:
      `script-src 'self' 'unsafe-inline'` anula buena parte del valor de la CSP. Mover la CSP a
      `kit.csp` en `svelte.config.js` (`mode: 'nonce'` o `'hash'`), que hace que SvelteKit firme su
      script de hidratación y permite quitar `'unsafe-inline'`. Añadir además `object-src 'none'`,
      `frame-src 'none'`, `upgrade-insecure-requests` y `Strict-Transport-Security`
      (`max-age=31536000; includeSubDomains`), que hoy no existe.
- [x] **S5. Los endpoints de miembros devuelven el usuario completo** — `gang/addMember/+server.ts:113`,
      `validateMember/+server.ts:111`, `refuseMember/+server.ts:101` responden `user: updatedUser`,
      es decir email, `role`, `banned`/`banReason`/`banExpires`, `emailVerified`, timestamps… a
      cualquier miembro validado de la peña. **[resto de T5]** (ya identificado como "recortable" y no
      hecho). Devolver solo `{ id, membershipGangStatus, gangId }` o nada.
- [x] **S6. Sobre-fetch de emails en `/admin`** — `admin/members/+page.server.ts:33-43` trae
      `gang.members[].email` cuando la UI solo muestra el recuento y los 3 primeros nombres
      (`+page.svelte:164-176`); `admin/gangs/+page.server.ts:26-33,45-52` trae el email de todos los
      miembros y solo se usa el de `validatedBy`. Quitar `email` de esos `select`.
- [x] **S7. Los endpoints de miembros quedan fuera de la protección CSRF de SvelteKit** — son `POST`
      con los parámetros en el query string y sin cuerpo (`ButtonRequest.svelte:24`), y la
      comprobación de origen de SvelteKit solo cubre los content-type de formulario. Pasarlos a
      form actions (`use:enhance`, como ya hace `admin/gangs/+page.svelte:123-135`) o, si se
      mantienen como endpoints, enviar cuerpo JSON y validar `Origin` explícitamente.
- [x] **S8. El OTP se escribe en el log sin condicionar a dev** — `src/lib/server/auth.ts:47`:
      `logger.debug('email: ' + email + ' -- otp: ' + otp)` se ejecuta siempre; hoy no se ve en
      producción solo porque el nivel es `info` (`logger.ts:5`). Envolver en `if (dev)` para que un
      cambio de nivel de log no filtre códigos de acceso.
- [x] **S9. `EmailSent` acumula emails para siempre** — `prisma/schema.prisma:148-154`: una fila por
      cada OTP enviado, con el email en claro, sin borrado nunca. Solo se consulta la ventana de 5
      minutos (`email-sent-check/+server.ts:16-24`). Guardar un hash del email y/o purgar filas de
      más de N días (cron de Vercel o borrado oportunista en el propio `sendVerificationOTP`).
- [x] **S10. Handler `push` del service worker sin uso y sin validación** — `src/service-worker.js:56-63`
      muestra una notificación con lo que venga en `event.data.json()` (que puede lanzar) y no hay
      ningún flujo de suscripción a push en toda la app. Borrarlo (o completar el flujo, si es
      intencionado).

## Fase 2 — Corrección de datos y reglas de negocio

- [x] **B1. `addGangSchema` casi no valida** — `src/lib/schemas/gang.ts:5-16`: `z.string(mensaje)` sin
      `.min(1)` acepta nombre **vacío**, sin `.max()` acepta un nombre de 10 000 caracteres, y
      `lat`/`lng` son `z.number()` sin límites, así que se puede crear una peña en cualquier punto
      del planeta. Añadir `.trim().min(1).max(60)` y acotar coordenadas a un bounding box alrededor
      de `coordsMonte` (`src/lib/utils/coords-monte.ts:3`).
- [x] **B2. La comprobación de nombre duplicado es una carrera** — `gang/add/+page.server.ts:28-39`
      hace `findFirst` y luego `create`, y no hay índice único: las migraciones solo crean
      `user_email_key`, `session_token_key` y `activity_date_key`
      (`prisma/migrations/20250903094100_release_2025/migration.sql:125-131`). Dos envíos simultáneos
      crean dos peñas con el mismo nombre. Añadir unicidad real (columna normalizada en minúsculas +
      `@@unique`, o `citext`) y capturar `P2002` para devolver `form_gang_name_duplicated`.
- [x] **B3. Cualquier usuario con sesión puede crear peñas sin límite** — `gang/add/+page.server.ts:15-24`
      solo comprueba que haya sesión: no hay tope por usuario, ni comprobación de que no pertenezca ya
      a una peña, ni moderación previa (la peña nace `PENDING`, pero ya aparece en el mapa: el `load`
      de la home solo excluye `REFUSED`, `+page.server.ts:5-11`). Con B1 y B2 es un vector de spam
      directo. Decidir la regla (¿una peña por usuario? ¿N por día?) y aplicarla.
- [x] **B4. `fail(401, { form: 'Unauthorized' })` rompe superforms** — `gang/add/+page.server.ts:18`
      pasa un `string` donde el cliente espera un `SuperValidated`; ese camino deja el formulario en
      un estado inconsistente. Usar `requireUser(locals)` de `$lib/server/membership.ts` (que lanza
      401 coherente con el resto).
- [x] **B5. Peña e historial se escriben sin transacción** — `gang/add/+page.server.ts:42-62` y
      `gang/[slug]/update/+page.server.ts:83-113` hacen dos writes independientes: si el segundo
      falla, queda una peña sin su entrada de `GangHistory`. Envolver ambos pares en
      `prisma.$transaction`.
- [x] **B6. El update escribe aunque no haya cambios** — `gang/[slug]/update/+page.server.ts:77-92`
      calcula `hasChanges` pero solo lo usa para decidir el registro de historial; el
      `prisma.gang.update` se ejecuta siempre. Cortocircuitar cuando no hay cambios.
- [x] **B7. Un rechazo en una peña bloquea al usuario en todas, para siempre** —
      `membershipGangStatus` es un único campo del usuario (`prisma/schema.prisma:29`), no una
      relación por peña. `refuseMember/+server.ts:84-91` pone `REFUSED` pero **deja `gangId`
      apuntando a la peña** (el usuario sigue "colgado" de ella), y `addMember/+server.ts:88-96`
      rechaza a cualquier usuario cuyo estado sea `REFUSED` → una vez rechazado, no puede unirse a
      **ninguna** peña y no hay forma de revertirlo desde la UI. Arreglo mínimo: al rechazar, limpiar
      `gangId`. Arreglo correcto: modelar la membresía como tabla propia `(userId, gangId, status)`.
- [x] **B8. Unirse a una peña nueva abandona la anterior en silencio** — `addMember/+server.ts:98-106`
      sobreescribe `gangId` y pone `PENDING` incluso si el usuario ya estaba `VALIDATED` en otra
      peña: nadie se entera, no queda rastro en `GangHistory`. Rechazar la solicitud si ya hay
      membresía validada (o exigir un paso explícito de "salir de mi peña").
- [x] **B9. Estado derivado de `data` congelado en `$state` → listas obsoletas** —
      `gang/[slug]/+page.svelte:28-32` inicializa `gang`, `members`, `pendingMembers` e
      `isValidatedMember` desde `data` con `$state(...)`/`let`, así que **no se actualizan** tras
      `invalidateAll()`: validar o rechazar un miembro no refresca la lista hasta recargar la página.
      Mismo patrón en `gang/[slug]/update/+page.svelte:23` (`gang`),
      `activities/+page.svelte:12-14` (`now`, `upcomingActivities`, `pastActivities` calculados una
      sola vez) y `ActivityCard.svelte:64-65` (`location`, `organisers`). Pasar todo a `$derived`.
      Esto es también el origen de los 11 warnings `state_referenced_locally` del baseline (ver T5).
- [x] **B10. El login se queda colgado si falla la red** — `FormLogin.svelte:76-81`: el `catch` de
      `onSubmit` fija `message` pero **no** `sending = false`, así que el spinner se queda para
      siempre. Y la rama de rate limit (`:51-61`) espera 3 s y **avanza a `step = 2`** pidiendo un
      código que no se ha enviado. Resetear `sending` en `catch`/`finally` y no avanzar de paso
      cuando no se ha enviado nada.
- [x] **B11. `ButtonRequest` se queda mudo al fallar y no permite reintentar** —
      `ButtonRequest.svelte:38-40`: el `catch` asigna `messageClass` pero no `message`, así que
      desaparece el botón y no se muestra nada. Y una vez hay `message`, el `{#if}` (`:50-57`) oculta
      el botón permanentemente: no hay reintento. Asignar mensaje de error y restaurar el botón
      (o dar un "reintentar").
- [x] **B12. `watchPosition` sin `clearWatch` → un watcher por visita** —
      `src/lib/utils/show-my-position.ts:11-16`: cada navegación a la home, a `gang/[slug]`, a
      `gang/add` o a `update` registra un nuevo `watchPosition` que nunca se cancela; se acumulan
      durante toda la sesión SPA (batería + markers duplicados). Devolver una función de limpieza y
      llamarla desde el `onMount`/`$effect` de cada página. De paso, `maximumAge: 10` son 10 ms
      (comentario dice "Cache 10ms"), lo que anula la caché de posición: probablemente se quería 10 000.
- [x] **B13. El fallback offline del service worker apunta a un fichero que no existe** —
      `src/service-worker.js:47-53` responde con `cache.match('offline.html')`, pero no hay
      `static/offline.html` (el `static/` solo tiene favicons, iconos, manifest, robots y
      screenshots) → `respondWith(undefined)` lanza y la navegación falla igual. Crear la página y
      precachearla, o eliminar el handler `fetch`.
- [x] **B14. Las estadísticas del historial se contradicen** — `admin/history/+page.server.ts:51-57`:
      `total: history.length` está topado por el `take: 100` (`:35`) mientras `CREATE`/`UPDATE` son
      counts globales, así que la UI puede mostrar "Total 100 / Creaciones 340". Usar
      `prisma.gangHistory.count()` para el total. Además se cuenta `changeType: 'DELETE'` (`:43-45`)
      que no existe en ningún flujo y no se pinta en la página → borrar.
- [x] **B15. Las actions de `/admin/gangs` sustituyen la página por la página de error** —
      `admin/gangs/+page.server.ts:86,107,118,139` hacen `throw error(400/500)` dentro de una action:
      en vez de un aviso inline, el usuario pierde la tabla. Y el `{ success, message }` que
      devuelven (`:101-104`, `:133-136`) no se renderiza en ningún sitio. Usar `fail()` y mostrar el
      mensaje.
- [x] **B16. El enlace al panel admin no le sale a los `system`** —
      `profile/+page.svelte:131` compara `user.role === 'admin'` a mano, mientras el resto del código
      usa `isAdmin` (`admin`+`system`), tal y como pide AGENTS.md. `isAdmin` vive hoy en
      `$lib/server/membership.ts` (server-only): extraer el predicado de rol a un módulo compartido y
      usarlo aquí.
- [x] **B17. Los avatares antiguos nunca se borran** — `profile/+page.server.ts:98-100` lo deja
      escrito como pendiente: cada cambio de foto deja el blob anterior en Vercel Blob para siempre.
      **[resto de T9]**. Borrar el blob previo al sustituirlo (guardando la key o parseándola de la
      URL) o documentar explícitamente la retención.
- [x] **B18. Miembros sin nombre se pintan como una fila vacía** —
      `gang/[slug]/+page.svelte:116,129` pasa `member.name` crudo a `MemberDetail.svelte`, que no
      aplica el fallback de `memberDisplayName`; y el `select` de miembros
      (`gang/[slug]/+page.server.ts:25-32`) excluye `email`, así que el fallback no es ni posible.
      Resolver el nombre visible **en el servidor** (evita exponer emails, ver S6) y pasar ya el
      string resuelto.
- [x] **B19. Fechas formateadas en cliente con `es-ES`, sin util común** —
      `admin/history/+page.svelte:20-44`, `admin/members/+page.svelte:290-296`,
      `profile/+page.svelte:29-35` y `ActivityCard.svelte:29-48` repiten cuatro veces
      `toLocaleDateString`/`Intl.DateTimeFormat` con `'es-ES'` literal, y
      `activities/+page.svelte:12-14` decide pasado/futuro con el reloj del cliente sobre datos ya
      renderizados en servidor (riesgo de desajuste SSR/cliente por zona horaria). Centralizar en un
      util de `$lib/utils` y decidir de qué lado se calcula el "ahora".
- [x] **B20. Las guardas de acceso son `{#if}` en cliente, no en el `load`** —
      `gang/[slug]/update/+layout.svelte:10`, `gang/add/+layout.svelte:11` y
      `profile/+layout.svelte:10` renderizan `UserNotLogged` en vez de cortar en servidor: el `load`
      ya se ha ejecutado y sus datos ya han viajado al cliente. Hoy no se filtra nada sensible (los
      datos de peña son públicos), pero el patrón filtrará el día que un `load` devuelva algo privado,
      y hace trabajo inútil. Mover la comprobación a los `+layout.server.ts` con
      `requireUser`/`requireValidatedMember` y quedarse con el `{#if}` solo como UX.

## Fase 3 — Base de datos y rendimiento

- [x] **D1. Faltan índices en las columnas por las que se filtra siempre** — `user.gangId` (Postgres
      **no** indexa las FK automáticamente), `gang.status`, `user.membershipGangStatus`. Los usa cada
      listado de miembros y todos los contadores de `/admin`
      (`admin/members/+page.server.ts:20-86`, `admin/gangs/+page.server.ts:12-62`). Tablas pequeñas
      hoy; el arreglo es una migración de tres líneas.
- [x] **D2. Revisar las restricciones de unicidad del esquema** — falta única en `gang.name` (ver B2)
      y sobra la de `Activity.date` (`prisma/schema.prisma:109`, `activity_date_key`), que impide dos
      actividades a la misma hora: poco realista en un programa de fiestas. Confirmar la intención
      antes de tocar.
- [x] **D3. Estados como `String` libre → enums de Prisma** — `membershipGangStatus`, `Gang.status` y
      `GangHistory.changeType` son `String` comparados con literales en ~12 sitios. Es la **T10
      aplazada** del plan anterior: el código ya está unificado a `REFUSED`, quedan la migración SQL
      de normalización y la conversión a enums. Cerrarla aquí (encaja con B7 y B14).
- [x] **D4. Cargas sin paginación** — `admin/gangs` y `admin/members` traen **todo** sin `take`
      (`+page.server.ts:14-57` y `20-86`), `admin/history` tiene un `take: 100` fijo sin paginar, y
      `activities/+page.server.ts:6-24` trae todas las actividades con sus relaciones. Añadir
      paginación o al menos límites explícitos y visibles en la UI.
- [x] **D5. `PrismaClient` sin singleton para dev/HMR** — `src/lib/server/db.ts:4` instancia el
      cliente a nivel de módulo sin guardarlo en `globalThis`, así que cada recarga en caliente de
      `bun run dev` crea otro cliente y otro pool.

## Fase 4 — Calidad de código y refactor

- [x] **Q1. `Modal.svelte` busca su `<dialog>` con `getElementById`** — `Modal.svelte:32-34` usa
      `document.getElementById('modal-' + uid)` en `onMount` en vez de `bind:this` sobre el elemento:
      idioma de Svelte 4, frágil y dependiente del DOM. Además todos los consumidores importan el
      mismo fichero dos veces para usarlo como tipo
      (`import Modal` + `import ModalType from './Modal.svelte'`):
      `gang/add/+page.svelte:7-8`, `update/+page.svelte:7-8`,
      `NavBarEnd.svelte:3,12`), y en `gang/add`/`update` se le pasa como `title` una **clave de i18n
      cruda** (`title="add_gang_info"`), que se renderizaría literal si `showButton` fuese `true`.
- [x] **Q2. `logger.ts` mete un store de Svelte para nada** — `src/lib/logger.ts:37-39` envuelve pino
      en `readable(...)` y lo saca con `get(...)` acto seguido. Exportar `pino(options)` directamente
      y quitar la dependencia de `svelte/store`.
- [x] **Q3. `auth-client.ts` abre una sesión de cliente que nadie usa** — `src/lib/auth-client.ts:10`
      ejecuta `useSession()` en el ámbito del módulo, así que cualquier componente que importe
      `authClient` (p. ej. `ButtonSignOut`) arrastra una petición de sesión extra; ningún consumidor
      usa `session`. También se exporta `signUp` sin que exista flujo de registro. Borrar ambos.
- [x] **Q4. Tipo muerto de Cloudflare** — `src/app.d.ts:12-14` declara
      `App.Platform.caches: CacheStorage & { default: Cache }`, resto de la época Workers/D1; el
      proyecto corre en Vercel (**[resto de T27]**).
- [x] **Q5. Dos tipos de usuario distintos conviviendo en la UI** — `NavBarEnd.svelte:11,15` tipa
      `user` como `User` de `@prisma/client`, mientras `locals.user` (y por tanto `data.user`) viene
      del tipo inferido de better-auth — justo lo que AGENTS.md dice que no se haga. Tipar desde
      `auth.$Infer.Session['user']`. De paso: `NavBarEnd.Props` extiende `FormLoginProps` pero ignora
      `debug` y **sombrea** `afterCancelCallback` con una función local (`:23-26`); limpiar la firma.
- [x] **Q6. `routes.ts` tiene campos muertos y filtros con ruido** — `src/lib/routes.ts:23`
      `isProtected` se declara en 5 rutas y **no se lee en ningún sitio** (la protección real está en
      los layouts/loads); `getMenuRoutes` (`:86-98`) lleva dos `eslint-disable no-unused-vars` para un
      destructuring que se resuelve con `.map(([, route]) => route)` (son 2 de los 5 warnings de
      `eslint-disable` sin usar del baseline); y cada entrada repite su propia clave en `id`.
- [x] **Q7. `FormUser.svelte` duplica la validación del esquema y rompe el "quitar"** —
      `FormUser.svelte:52-87` reimplementa el límite de 5 MB y la lista de MIME que ya están en
      `updateUserSchema` (`schemas/user.ts:4-5,12`): dos fuentes de verdad. `clearFileSelection`
      (`:89-96`) va a por el input con `document.getElementById` y **no** limpia `$fileInput`, así que
      el fichero sigue en los datos del formulario tras pulsar "quitar". Y `alt="Vista previa"`
      (`:143`) es texto hardcodeado en español (**[resto de T22]**).
- [x] **Q8. Texto hardcodeado en `show-my-position.ts`** — `:30` `bindPopup('Estás aquí')`.
      **[resto de T22]**, que dio por migrado este fichero.
- [x] **Q9. `'Peña no encontrada'` hardcodeado en cinco sitios del servidor** —
      `gang/[slug]/+page.server.ts:13,39` y `gang/[slug]/update/+page.server.ts:17,52,73`.
      **[resto de T22]**. Añadir clave a `messages/es.json` y recompilar con `bun run paraglide-js`.
- [x] **Q10. `console.log` sigue vivo en el service worker** — `src/service-worker.js:10,13,17,26,33`
      (5 ocurrencias). **[resto de T23/T26]**, que decían haberlos quitado. Es el único
      `console.*` que queda en `src/`.
- [x] **Q11. `FormAddGang.svelte`: sincronización y navegación frágiles** —
      `$effect` (`:50-55`) para copiar `latlng` en `$formData` (podría ser `$derived`/props),
      `setTimeout(() => goto(callbackUrl), 1000)` (`:36-39`) con un
      `// eslint-disable-next-line` sin regla ni motivo (otro de los 5 warnings del baseline),
      `messageClass` (`:57-61`) devuelve `undefined` para cualquier status que no sea 200/400/500, y
      con `dataType: 'json'` los dos `<input type="hidden">` de `lat`/`lng` (`:66-67`) son
      redundantes.
- [x] **Q12. Duplicación pendiente de extraer** — (a) los tres endpoints de miembros
      (`addMember`/`validateMember`/`refuseMember`) son ~90 % el mismo código (parseo zod → 401 →
      permisos → buscar usuario → comprobaciones → update → `json`): un handler común parametrizado
      por acción. (b) La secuencia `initMap` + `panTo` + marker + `showMyPosition` + `<div id="map">` + `<style>#map{height:…}</style>` se repite en 4 páginas (`+page.svelte`, `gang/[slug]`,
      `gang/add`, `update`): componente `<GangMap>` (T18 extrajo `initMap`, no el resto).
- [x] **Q13. Detalles del mapa de la home** — `+page.svelte:28` usa `data.gangs.map()` solo por sus
      efectos secundarios (debería ser `for…of`), acumula en `gangsInMap` (array no reactivo
      declarado con `let`, `:23`) y `filterGangs` (`:57-77`) recorre y re-añade/quita todos los
      markers en cada pulsación de tecla, sin debounce.
- [x] **Q14. Documentar los scripts de seed** — `prisma/seed-activity.ts` no lo referencia
      `package.json` (solo `seed-activities.ts` vía `db:seed-activities`); confirmar que sigue siendo
      su dependencia y anotarlo, o borrarlo si no.
- [x] **Q15. Cero tests** — AGENTS.md lo asume y la barrera es `check` + `lint` + `only-build`. Hay
      fruta madura y baratísima: `$lib/server/membership.ts` (`isAdmin`, `canManageGangMembers`),
      los esquemas zod (cubriría B1 directamente), `$lib/utils/member-display.ts` y
      `$lib/schemas/utils.ts`. Propuesta: Vitest para esos cuatro + un smoke de Playwright del login
      OTP y del alta de peña. Sin esto, todos los arreglos de las fases 1-2 solo se verifican a mano.
- [x] **Q16. Medir el coste de pino en el bundle de cliente** — `ButtonRequest.svelte`,
      `show-my-position.ts` y `gang/[slug]/+page.svelte` importan `$lib/logger`, que arrastra el build
      de navegador de pino a la web pública. Comprobar el peso real y, si no se justifica, usar un
      wrapper mínimo en cliente.

## Fase 5 — Documentación y tooling

- [x] **T1. `README.md` son dos líneas** — hoy solo tiene el título y un `kimi -r session_...`
      pegado. Escribir uno real (requisitos, `.env`, comandos de `bun`, despliegue) o dejarlo como
      índice que apunte a `AGENTS.md`.
- [x] **T2. Verificar que no hay secretos en el historial** — `.env` existe en el raíz y está
      ignorado por git y por oxlint, correcto; queda confirmar con un escaneo del historial que nunca
      se commiteó (`git log --all -- .env`, o `gitleaks`) y, si apareciera, rotar credenciales SMTP y
      `BETTER_AUTH_SECRET`.
      **Resultado**: `git log --oneline -- .env` en `main`/rama actual → vacío, nunca se commiteó ahí.
      `git log --all --oneline -- .env` sí encuentra 3 commits, pero todos en `origin/develop`, una
      rama obsoleta de una iteración anterior del proyecto (Auth0 + Mongoose, antes de la migración a
      better-auth/Prisma que T27 limpió), y los valores commiteados eran placeholders literales
      (`AUTH0_CLIENT_SECRET=xxxx`), no credenciales reales. No hace falta rotar nada.
- [x] **T3. `.oxlintrc.json` desactiva la categoría `correctness` entera** —
      `"categories": { "correctness": "off" }` y luego se re-habilitan reglas una a una: el lint de
      pre-commit (lint-staged) es más débil de lo que parece y las reglas nuevas de oxlint no
      entrarán solas. Revisar si es intencionado.
- [x] **T4. Configuración duplicada de hosts** — `svelte.config.js:20-24` sigue listando el host de
      preview `donde-esta-tu-local-git-staging-jilgues-projects.vercel.app` en `images.domains`, y el
      host de Vercel Blob está escrito a mano en la CSP
      (`security-headers-handle.ts:22`): dos sitios que hay que mantener sincronizados a mano.
      Unificar en constantes o documentarlo junto a S4.
- [x] **T5. Dejar `check` y `lint` a cero warnings** — baseline del plan anterior: 11 warnings
      `state_referenced_locally` (son exactamente los casos de B9) y 5 `eslint-disable` sin usar
      (dos en `routes.ts`, ver Q6; uno en `FormAddGang.svelte`, ver Q11; localizar los otros dos).
      Al arreglar B9/Q6/Q11 deberían desaparecer casi todos; el objetivo es 0 y así los warnings
      nuevos vuelven a ser señal.
- [x] **T6. Reintentar Prisma 7** — **T14 aplazada**: `@prisma/extension-accelerate` 3.x pierde los
      tipos del cliente con Prisma 7 ([prisma/prisma#28580](https://github.com/prisma/prisma/issues/28580)).
      Comprobar si ya hay versión compatible; si no, seguir en Prisma 6.19.3 + Accelerate 2.0.2 y
      revisar de nuevo más adelante (igual con TypeScript 7 y `svelte-check`).
      **Reintentado 2026-08-05**: instalados prisma@7.9.1, @prisma/client@7.9.1 y
      @prisma/extension-accelerate@3.0.1 en una prueba aislada (revertida). Bloqueante distinto y más
      básico que el original: Prisma 7 ya no soporta `datasource.url` en `schema.prisma` en absoluto
      (P1012) — exige mover la URL de conexión a `prisma.config.ts` y pasar `adapter`/`accelerateUrl`
      explícitos al constructor de `PrismaClient`, y el flag `--no-engine` de `prisma generate`
      desaparece. No es un simple bump de versión: requiere migrar `db.ts`, el script `build` de
      `package.json` y probablemente el generator de `schema.prisma`. Se sigue aplazando; revisar de
      nuevo cuando haya presupuesto para esa migración (no solo comprobar compatibilidad de tipos).

---

## Orden sugerido y dependencias

1. **Fase 1 primero** (S1, S2, S5, S8 son cambios de pocas líneas y cierran fugas de PII vigentes hoy).
   S3 y S4 son algo más de trabajo; S4 conviene hacerlo con T4 a la vez.
2. **Fase 2 en dos tandas**: primero las de servidor (B1-B8, B14-B17, B20), que son las que afectan a
   datos; después las de cliente (B9-B13, B18, B19). B7 y B8 conviene discutirlas antes de tocar
   nada: implican una decisión de modelo de dominio (campo único vs tabla de membresías) que arrastra
   a D3.
3. **Fase 3 después de la 2**, porque D3 (enums) y D2 (unicidad) dependen de cómo se resuelva B7, y
   D1 es una migración independiente que puede ir en cualquier momento.
4. **Fase 4 al final**: es refactor sin cambio de comportamiento. Excepción: **Q15 (tests) conviene
   adelantarlo** a antes de la fase 2, aunque solo sea la parte de Vitest sobre `membership.ts` y los
   esquemas, para tener red al tocar autorización y validación.
5. **Fase 5** en paralelo, salvo T5 que se cierra al terminar la 4.

## Verificación

- Tras cada tarea: `bun run check` y `bun run lint`.
- Al cerrar cada fase: `bun run format` + `bun run only-build` (**nunca** `bun run build`).
- Migraciones (D1, D2, D3): revisar el SQL generado a mano antes de aplicarlo, y aplicarlo primero
  contra una BD de staging.
- Repaso manual en `bun run dev` de los flujos tocados: login OTP (código en el log), mapa y filtro,
  alta y edición de peña, solicitar/validar/rechazar miembro, perfil con avatar, las cuatro páginas
  de `/admin`.
- `bun audit` debe seguir en 0 (hay `overrides` en `package.json` que no se deben borrar sin
  re-auditar).
