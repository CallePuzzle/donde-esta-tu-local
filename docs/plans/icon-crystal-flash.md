# Plan: Onboarding tour con TourGuideJS

## Objetivo

Implementar dos recorridos introductorios lineales y multi-página, cada uno para una audiencia distinta:

1. **Tour de invitado** (sin sesión): qué se puede hacer sin loguearse, y cierra invitando a iniciar sesión.
   1. Cómo buscar una peña.
   2. Dónde consultar las actividades de las peñas.
   3. Que iniciando sesión se desbloquean más funcionalidades (crear peña, unirte, etc.).
2. **Tour de miembro** (recién logueado): todo lo que requiere sesión.
   1. Cómo crear una peña.
   2. Cómo hacerte miembro de una peña.
   3. Que puedes cambiar la foto de la peña (si eres miembro).
   4. Que puedes cambiar tu foto de perfil.
   5. Que si activas las notificaciones te llegarán avisos de actividades.

Cada tour se inicia automáticamente la primera vez que aplica (invitado: al entrar por primera vez a la home; miembro: justo tras el primer login, si en ese momento el usuario está en la home) y se retoma si el usuario cambia de página. Se usa la librería `@sjmc11/tourguidejs`.

## Por qué dos tours en vez de uno

La versión inicial (un único tour de 7 pasos que empezaba pidiendo iniciar sesión) mezclaba pasos que requieren sesión con pasos que no, y el paso "únete a una peña" apuntaba a un botón (`#tour-join-gang`) que solo existe en el DOM para un usuario logueado — pero quien hace un tour que empieza sin sesión nunca la tiene, así que ese paso navegaba a `/gang/[slug]` y no encontraba el target: `TourGuideClient.start()` fallaba silenciosamente (diálogo vacío/oculto, sin ningún mensaje de error visible al usuario).

Separar en dos tours independientes resuelve esto de raíz: el tour de miembro solo se ofrece a un usuario ya logueado, así que sus targets reales (botón de unirse, campo de imagen de perfil, toggle de notificaciones) siempre existen.

## Decisiones de diseño

- **Dos tours independientes**: cada uno con su propia lista de pasos, su propia clave de `localStorage` (`onboarding-tour-guest-v1` / `onboarding-tour-member-v1`) y su propio estado de completado. No comparten progreso ni se bloquean entre sí.
- **Arranque del tour de invitado**: igual que antes, solo se inicia la primera vez que un visitante sin sesión entra a la home.
- **Arranque del tour de miembro**: se ofrece automáticamente la primera vez que, ya logueado, el usuario está en la home. Si el login ocurre en otra página (el modal de login vive en la cabecera y es accesible desde cualquier ruta), el tour de miembro espera pasivamente a que el usuario visite la home por su cuenta — no se fuerza una redirección.
- **Trigger reactivo en la home (`$effect`, no `onMount`)**: iniciar sesión vía el modal no navega ni remonta `+page.svelte` (usa `invalidateAll()`), así que si el trigger solo viviera en `onMount` nunca se re-evaluaría con el `user` ya logueado. `$effect` sí reacciona a que `data.user` cambie de `null` a un usuario dentro del mismo montaje.
- **Navegación entre páginas**: cuando el usuario pulsa "Siguiente" en un paso cuyo siguiente paso pertenece a otra ruta, se guarda el nuevo índice, se cierra la instancia actual y se navega con `goto`. La página destino retoma el tour en el paso guardado.
- **Limpieza del DOM del tour al cambiar de cliente**: `TourGuideClient.exit()` solo oculta el diálogo/backdrop (`display:none`), nunca los elimina del DOM. Como cada página (o cada transición invitado→miembro dentro del mismo montaje) crea su propio `TourGuideClient`, un diálogo huérfano duplicaría los `id="tg-dialog-title"`/`id="tg-dialog-body"` del siguiente cliente — `getElementById()` encontraría el nodo viejo (oculto) en vez del nuevo, dejando el diálogo de la página/tour destino sin contenido. Se elimina explícitamente el diálogo/backdrop del cliente saliente antes de navegar (`navigateToStep`) y, como red de seguridad, se limpia cualquier resto de `.tg-dialog`/`.tg-backdrop` al principio de cada `continueOnboardingTour()`.
- **Tolerancia a contextos incompletos**: si no hay peñas validadas para mostrar el paso de "unirse", se muestra como diálogo centrado explicando la acción sin intentar navegar a una peña inexistente.
- **Textos e i18n**: todos los textos del tour se añaden a `messages/es.json` y se consumen con Paraglide.

## Pasos del tour de invitado

| Orden | Ruta | Target                                                | Contenido                                                                                                           |
| ----- | ---- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 0     | `/`  | Input de filtro del mapa                              | Explica que puedes buscar peñas escribiendo su nombre.                                                              |
| 1     | `/`  | Enlace "Actividades de las peñas" (nav de escritorio) | Explica dónde consultar las actividades de las peñas.                                                               |
| 2     | `/`  | Botón/avatar de sesión de la cabecera (`#tour-login`) | Invita a iniciar sesión para desbloquear más funcionalidades (cierra el tour y sirve de puente al tour de miembro). |

## Pasos del tour de miembro

| Orden | Ruta           | Target                              | Contenido                                                                 |
| ----- | -------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| 0     | `/`            | Botón "Añadir peña" del Dock/Header | Explica que puedes crear una peña desde ahí.                              |
| 1     | `/gang/[slug]` | Botón "Solicitar unirme a la peña"  | Explica cómo hacerte miembro de la peña que estás viendo.                 |
| 2     | `/gang/[slug]` | Foto de la peña / botón de cámara   | Explica que los miembros pueden cambiar la foto de la peña.               |
| 3     | `/profile`     | Avatar / formulario de imagen       | Explica que puedes cambiar tu foto de perfil.                             |
| 4     | `/profile`     | Toggle de notificaciones            | Explica que activando las notificaciones recibirás avisos de actividades. |

## Archivos modificados

### Módulo de tour

- `src/lib/utils/tour.ts`: dos listas de pasos (`guestTourSteps` / `memberTourSteps`), dos claves de `localStorage`, `continueOnboardingTour(currentPath, user, gangs)` decide qué tour ejecutar según si `user` existe, `startOnboardingTour(isLoggedIn)` reinicia el tour correspondiente.

### Páginas

- `src/routes/+page.svelte`: trigger del tour vía `$effect` (no `onMount`) para reaccionar al login sin recarga. IDs `#tour-filter` (ya existía).
- `src/routes/gang/[slug]/+page.svelte`: IDs `#tour-join-gang`, `#tour-gang-image` (ya existían).
- `src/routes/profile/+page.svelte`: IDs `#tour-profile-image`, `#tour-notifications` (ya existían); esta página solo se renderiza logueado, no necesita `$effect`.

### Componentes compartidos

- `src/lib/components/NavBarList.svelte` / `DockLink.svelte`: añadido `id="tour-activities-desktop"` / `"tour-activities-mobile"` al enlace de Actividades (mismo patrón que "Añadir peña").
- `src/lib/components/NavBarEnd.svelte`: `id="tour-login"` en el contenedor del avatar/botón de login — target del paso de cierre del tour de invitado.
- `src/lib/components/Footer.svelte`: recibe `user` para que "Ver introducción" reinicie el tour correcto según si hay sesión.
- `src/routes/+layout.svelte`: pasa `user` a `Footer`.

### i18n

- `messages/es.json`: claves `tour_activities_*` y `tour_login_cta_*` nuevas; `tour_add_gang_description` y `tour_join_gang_description` reescritas en presente (ya no condicionan a "si inicias sesión", porque en el tour de miembro el usuario ya lo está).

## Verificación

1. `bun run check` — 0 errores.
2. `bun run lint` — sin problemas.
3. Manual en navegador (Chrome DevTools MCP):
   - Tour de invitado: 2 pasos en `/`, ambos apuntando a sus targets reales.
   - Login con cuenta de prueba (OTP): el tour de miembro arranca automáticamente **sin recargar la página**, confirmando que el `$effect` reacciona al cambio de `data.user`.
   - Tour de miembro: 5 pasos, navega correctamente entre `/`, `/gang/[slug]` y `/profile`; el paso "únete a una peña" apunta al botón real (existe porque el usuario ya está logueado).
   - Ambos tours guardan su estado de forma independiente en `localStorage` y no se pisan entre sí.

## Riesgos y mitigaciones

- **Riesgo**: TourGuideJS no soporta SPA navigation de forma nativa; al navegar con `goto` el DOM se desmonta y el tour desaparece.
  - **Mitigación**: guardar el paso en `localStorage` antes de navegar y retomar en la página destino.
- **Riesgo**: un diálogo de TourGuideJS huérfano (de un cliente anterior) deja duplicados los `id` internos de la librería y el diálogo nuevo se queda sin contenido.
  - **Mitigación**: eliminar explícitamente el diálogo/backdrop del cliente saliente antes de navegar, y limpiar cualquier resto al principio de cada `continueOnboardingTour()`.
- **Riesgo**: el login ocurre en una página distinta de la home y el tour de miembro nunca llega a ofrecerse.
  - **Mitigación aceptada**: se espera pasivamente a que el usuario visite la home; no se fuerza una redirección (decisión de producto).
- **Riesgo**: el usuario cierra el tour accidentalmente.
  - **Mitigación**: el cierre lo marca como completado para no volver a molestar; el botón "Ver introducción" del footer permite recuperarlo (el correspondiente a su estado de sesión actual).
