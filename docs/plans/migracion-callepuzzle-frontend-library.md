# Plan: migrar donde-esta-tu-local a @callepuzzle/*

> **Estado**: plan aprobado, pendiente de ejecución (2026-10-14). Es la **Fase D** del plan de
> convergencia de la librería (`callepuzzle-frontend-library`, `docs/plans/12-convergencia-consumidores.md`,
> tareas T12.11/T12.12): la librería promovió el código de este proyecto (fase A), y ahora este
> repo sustituye sus copias locales por los paquetes publicados.
>
> **Decisiones del usuario** (2026-10-14):
>
> 1. **Instalación vía GitHub Packages** (no tarballs vendorizados, no `portal:` local).
> 2. **Estilos con la configuración propia + `@source`** al dist del paquete, sin importar la
>    hoja `@callepuzzle/svelte-ui/styles.css` (evita incluir todos los temas de daisyUI).
> 3. **Cambios de UX aceptados**: dropdown de usuario en la navbar (antes enlace directo al
>    perfil) y estética del formulario OTP ligeramente distinta.

## Prerrequisito (bloqueante)

PAT de GitHub con scope `read:packages` exportado como `NPM_TOKEN`:

- En local, para `bun add` (GitHub Packages exige autenticación incluso para paquetes públicos).
- En **Vercel**, como variable de entorno `NPM_TOKEN` antes de mergear, o el build de producción
  no podrá resolver `@callepuzzle/*`.

Antes de instalar, verificar que `@callepuzzle/*@0.1.0` está realmente publicada:
`NPM_TOKEN=... npm view @callepuzzle/core version --registry=https://npm.pkg.github.com`.
Si no lo está, plan B acordado: tarballs `npm pack` vendorizados (`file:`) — no cambia nada más
del plan.

## Mapa de sustituciones

| Código local                                                                 | Destino                                                                                                                                                                      |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Link`, `FormFields`, `FormString`, `FormLogin`, `ButtonSignOut`, `DockLink` | **Eliminar** → import de `@callepuzzle/svelte-ui` (`FormLogin` → `FormLoginOtp` de `@callepuzzle/svelte-ui/otp`)                                                             |
| `Header`                                                                     | **Eliminar** → `Header` de la librería (navbar-only, `showBack`, snippets `title`/`navCenter`/`navEnd`)                                                                      |
| `NavBarEnd`                                                                  | **Reescribir fino**: envuelve el de la librería (dropdown Perfil / Cerrar sesión) + snippet `login` con `Modal` + `FormLoginOtp`; mantiene `loginModalStore`                 |
| `UserNotLogged`                                                              | **Reescribir fino**: el de la librería no auto-abre el login; se conserva el auto-open con retardo vía `loginModalStore`                                                     |
| `Dock`                                                                       | **Reescribir fino**: `nav.dock` + `DockLink` de la librería con los `id` del tour + entrada PWA condicional                                                                  |
| `NavBarList`                                                                 | **Reescribir fino**: lista con `Link` de la librería + `id` del tour; entra en el snippet `navCenter` del `Header`                                                           |
| `Footer`                                                                     | **Reconstruir sobre el `Footer` de la librería** (contenedor); el contenido es de producto (GitHub, contacto, reiniciar tour)                                                |
| `Modal`                                                                      | **Wrapper fino** con `strings` en español preconfigurados: 8 puntos de uso no cambian; reexporta `showModal()`/`close()`                                                     |
| `routes.ts`                                                                  | Reescrito: `RouteMap<RouteId>` de `@callepuzzle/core`, `name`→`label`, factoría `getRoutes()`, **`showInMobile: true` en `/gang/add` y `/activities`**                       |
| `schemas/utils.ts` (+ test)                                                  | **Eliminar** → `zodToFieldsJsonSchema` de `@callepuzzle/core/schema` (unión discriminada por `kind`)                                                                         |
| `schemas/login.ts` (+ test)                                                  | **Eliminar** → `createLoginSchema({...})` con textos Paraglide, construido en render                                                                                         |
| `server/auth.ts`                                                             | `getBetterAuth` + `emailOtpPreset(send)` de `@callepuzzle/auth/server`; `admin()`, `sveltekitCookies` y las `customRules` de rate limit explícitos                           |
| `handles/better-auth-handle.ts`                                              | **Eliminar** → `betterAuthHandle(auth, building)` de `@callepuzzle/auth/hooks` envuelto en un `skipAssets` mínimo (conserva la optimización de no resolver sesión en assets) |
| `auth-client.ts`                                                             | `createCallepuzzleAuthClient({ plugins: [emailOTPClient(), adminClient()] })` — tipado real, sin `any`                                                                       |
| `app.css`                                                                    | Solo añadir `@source '../node_modules/@callepuzzle/svelte-ui/dist';`; tailwind/daisyUI/plugins/tema dark se quedan como están                                                |
| `messages/es.json`                                                           | ~6 claves nuevas + `bun run paraglide-js`                                                                                                                                    |

Lo que **no** se toca (producto): `ActivityCard`, `ButtonRequest`, `NotificationToggle`,
`FormUser` (salvo import), todo `components/gangs/` (salvo import), el tour (`tour.ts` solo
cambia tipos), Leaflet.

## Fases

### Fase 0 — Base

- [ ] **T1** `.npmrc`: añadir `@callepuzzle:registry=https://npm.pkg.github.com` y
      `//npm.pkg.github.com/:_authToken=${NPM_TOKEN}` (el token viaja por env, no se commitea).
- [ ] **T2** `bun add @callepuzzle/core @callepuzzle/auth @callepuzzle/svelte-ui zod`
      (zod pasa a dependencia directa: hoy es fantasma vía better-auth y la librería lo exige
      como peer).
- [ ] **T3** `app.css`: añadir el `@source` del paquete (ver mapa). Verificar tras `only-build`
      que el CSS de producción contiene las clases de la librería
      (`grep -c '\.navbar[,{ :]' .svelte-kit/output/client/_app/immutable/assets/*.css` → ≥1).

### Fase 1 — Auth

- [ ] **T4** `src/lib/server/auth.ts`: reescribir con `getBetterAuth()` de
      `@callepuzzle/auth/server`; conservar base de datos (`prismaAdapter`), `rateLimit.customRules`
      de las rutas OTP, y plugins explícitos: `sveltekitCookies(getRequestEvent)`,
      `emailOtpPreset(sendVerificationOtp)` (misma función de envío: log del OTP en dev,
      nodemailer en prod) y `admin()`.
- [ ] **T5** `src/hooks.server.ts`: `betterAuthHandle(auth, building)` de `@callepuzzle/auth/hooks`
      envuelto en un nuevo `skipAssets` (en `$lib/handles/`, reutilizando `is-asset-pathname`)
      para no resolver sesión en peticiones de assets. Borrar
      `src/lib/handles/better-auth-handle.ts`.
- [ ] **T6** `src/lib/auth-client.ts`: factoría `createCallepuzzleAuthClient` con
      `emailOTPClient()` y `adminClient()`.
- [ ] **T7** `src/app.d.ts`: sin cambios (ya tiene la forma recomendada:
      `auth.$Infer.Session`).

### Fase 2 — Rutas

- [ ] **T8** `src/lib/routes.ts`: reescribir con `RouteMap<RouteId>` + `label` (en vez de
      `name`), factoría `getRoutes()` (i18n resuelto en render, no en scope de módulo) y
      `showInMobile: true` en `/gang/add` y `/activities` — el `getMenuRoutes` de la librería
      filtra **estricto** por `showInMobile` en móvil (el local hacía unión); sin esto esas dos
      rutas desaparecen del dock.
- [ ] **T9** `src/lib/utils/tour.ts`: tipar los mapas de ids con `RouteId` de `$app/types`
      (desaparece el tipo `Route` local).

### Fase 3 — Schemas y formularios

- [ ] **T10** Borrar `schemas/utils.ts` + `schemas/utils.test.ts`; `FormUser.svelte` y
      `FormAddGang.svelte` importan `zodToFieldsJsonSchema` de `@callepuzzle/core/schema`. Sus
      `filteredFields` funcionan igual con la unión discriminada (`field.name` existe en todas
      las variantes).
- [ ] **T11** Borrar `schemas/login.ts` + `schemas/login.test.ts` (cubiertos por los tests de
      `@callepuzzle/core`); el schema de login se construye en el wrapper de `NavBarEnd` con
      `createLoginSchema({ emailPlaceholder, emailDescription, emailError })` y textos Paraglide.

### Fase 4 — Componentes

- [ ] **T12** Borrar `Link`, `FormFields`, `FormString`, `FormLogin`, `ButtonSignOut`,
      `DockLink`, `Header` (los ofrece la librería).
- [ ] **T13** `Modal.svelte` → wrapper fino: preconfigura `strings` en español (el de la
      librería tiene defaults en inglés) y reexporta `showModal()`/`close()` (hay `bind:this`
      en varias páginas). Los 8 puntos de uso no cambian.
- [ ] **T14** `NavBarEnd.svelte` → wrapper fino: `NavBarEnd` de la librería con
      `id="tour-login"` (target del tour; lo acepta vía rest props), dropdown Perfil/Cerrar
      sesión, y snippet `login` con `Modal` + `FormLoginOtp` (`startOverHref="/"`). En
      `onSuccess`: `invalidateAll()` + cierre del modal (elimina el `setTimeout(2000)` interno y
      de paso corrige el bug de `onSubmit` corriendo antes de la validación de cliente). Sigue
      alimentando `loginModalStore` → `gang/[slug]/+page.svelte` no cambia.
- [ ] **T15** `UserNotLogged.svelte` → wrapper fino sobre el de la librería, conservando el
      auto-open del modal de login (con su retardo actual) vía `loginModalStore`.
- [ ] **T16** `Dock.svelte` → fino: `nav.dock` + `DockLink` de la librería con los `id` del tour
      (`tourMobileElementIds`) + entrada «instalar PWA» condicional (snippet `children` del Dock
      de la librería no vale: sus enlaces internos no aceptan `id`).
- [ ] **T17** `NavBarList.svelte` → fino: `<ul class="menu menu-horizontal">` + `Link` de la
      librería con los `id` del tour (`tourDesktopElementIds`); se pasa al `Header` como
      snippet `navCenter`. (Mismo motivo que T16: `NavBarList` de la librería no acepta `id`
      por enlace. Seguimiento: contribuir upstream una prop `ids` y adelgazar aquí.)
- [ ] **T18** `Footer.svelte` → contenedor `Footer` de la librería + contenido de producto.
- [ ] **T19** `+layout.svelte`: `Header` de la librería con `showBack` (el local siempre
      mostraba el botón atrás en móvil), `navCenter`, `navEnd`, y el título renderizado dentro
      del snippet `title` **sin** `homeHref` — así se conserva el `data-sveltekit-reload` del
      enlace a `/`, que la librería no pone. `routes` vía `$derived(getRoutes())`.
- [ ] **T20** `profile/+page.svelte`: `ButtonSignOut` de la librería (`class` en vez de
      `classNames`).
- [ ] **T21** `messages/es.json`: claves nuevas (~6): etiqueta a11y del PIN, «código no
      válido», menú de usuario, Perfil, labels a11y de nav de escritorio y dock. Después
      `bun run paraglide-js` y `bun run format` (los generados pueden quedar sin formatear).

### Fase 5 — Verificación

- [ ] **T22** `bun run format && bun run lint && bun run check && bun run test`.
- [ ] **T23** `bun run only-build` (nunca `build`: aplica migraciones) + grep del CSS (T3).
- [ ] **T24** `podman compose up -d && bun run test:e2e`. `loginViaUi` y `auth.spec.ts`
      deberían pasar sin cambios (mismos roles/nombres de botón vía `strings`; el dropdown
      mantiene `a[href="/profile"]` en el DOM). Si algún selector se resiente, ajustar vía
      `strings`, no tocando la librería.
- [ ] **T25** Repaso manual en `bun run dev`: login modal completo (dos pasos, OTP, start
      over), dropdown de usuario, sign-out desde `/profile`, dock móvil, tour (pasos de
      escritorio y móvil: los `id` deben seguir resolviéndose), formularios de peña/perfil,
      `activities` (modales), páginas `/admin`.
- [ ] **T26** Recordatorio de despliegue: `NPM_TOKEN` configurado en Vercel antes de mergear.

## Riesgos y notas

- **CSS**: con la configuración propia es obligatorio el `@source` al dist del paquete —
  Tailwind 4 no escanea `node_modules` por su cuenta. Síntoma de fallo: componentes sin una
  sola clase de estilo y sin ningún error (el fallo de integración más frecuente según la doc
  de la librería).
- **E2E y el cambio de navbar**: al loguearse, la navbar pasa de enlace directo a dropdown; el
  helper `loginViaUi` espera `a[href="/profile"]`, que sigue presente en el DOM (contenido del
  dropdown), oculto hasta el foco. Si Playwright exigiera visibilidad en algún test nuevo,
  abrir el dropdown antes de asertar.
- **Estética OTP**: se pierde el separador de puntos 5+1 del PinInput local y los anchos
  `w-42` de los botones (la librería usa daisyUI estándar). Aceptado.
- **`getMenuRoutes`**: firma nueva `getMenuRoutes(routes, { mobile: true })` (el local era
  `getMenuRoutes(routes, true)`).
- **i18n en render**: `getRoutes()` y `createLoginSchema(...)` se llaman en render, nunca en
  scope de módulo (regla dura de la librería; con un solo locale no hay bug visible, pero se
  respeta para no sembrar trampas).
- La librería es ESM-only y llega precompilada (`dist`); no requiere cambios en `vite.config`
  ni en la CSP (no añade orígenes externos).

## Referencias

- `../frontend-library/docs/instalacion.md` — instalación paso a paso y fallos típicos.
- `../frontend-library/docs/migracion.md` — mapeo símbolo a símbolo (sección específica para
  este repo, incluida la nota sobre el filtro del dock).
- `../frontend-library/docs/plans/12-convergencia-consumidores.md` — plan de convergencia del
  que sale este (T12.11/T12.12).
- `../frontend-library/docs/adr/0003` (i18n por inyección) y `0004` (daisyUI como contrato).
