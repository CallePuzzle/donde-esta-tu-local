# Foto de peña

## Context

Cada peña (`Gang`) puede tener nombre y coordenadas, pero no imagen. Los usuarios sí tienen avatar (`User.image`, subido a Vercel Blob desde `/profile`), así que existe un patrón probado que replicar.

Objetivo: que **los miembros validados de una peña puedan subirle una foto** desde un modal en la página de detalle `/gang/[slug]`, que la **miniatura aparezca junto al nombre** en el `<h1>` de esa página, y que al **hacer click se abra en grande** en otro modal.

Decisiones ya tomadas con el usuario:

- El formulario de subida vive en un modal de `/gang/[slug]` (no en `/gang/[slug]/update`).
- La miniatura se muestra **solo** en `/gang/[slug]` (ni home, ni perfil, ni `ActivityCard`, ni admin).
- No hay botón de borrar: subir una nueva reemplaza y borra la anterior del blob.
- Se baja `MAX_FILE_SIZE` de 5MB a **4MB** (Vercel rechaza cuerpos >4,5MB con 413 antes de llegar a la action; hoy es un bug latente del avatar).
- Se extraen a módulos compartidos las constantes de validación y el código de Vercel Blob que hoy viven en `/profile`.

Decisiones de diseño no triviales:

- **No se registra en `GangHistory`**: sus columnas `name`/`latitude`/`longitude` son NOT NULL y la tabla modela solo cambios de nombre/ubicación; una fila `UPDATE` con los tres campos idénticos ensuciaría `/admin/history`. Queda traza vía `logger.info`.
- **`imageFile` es obligatorio** en el schema nuevo (en `updateUserSchema` es opcional porque comparte formulario con `name`); aquí es el único campo.
- El botón de subir se muestra a `isValidatedMember || isAdmin(user)`, exactamente la condición que ya usa el botón "Actualizar peña" de esa página y que permite `requireValidatedMember`.

---

## 1. Prisma: columna + migración

En `prisma/schema.prisma`, `model Gang`, tras `longitude`:

```prisma
  // URL pública de la foto de la peña en Vercel Blob (null si aún no tiene).
  // Solo se muestra en el detalle /gang/[slug]; la sube cualquier miembro
  // validado y al reemplazarla se borra la anterior del blob (B17).
  image          String?
```

Migración **escrita a mano** siguiendo la convención del repo (timestamps redondos, comentarios en español, cabecera `-- AlterTable`): `prisma/migrations/20260825120000_gang_image/migration.sql`

```sql
-- AlterTable
-- Foto de la peña: solo la URL pública del blob de Vercel, igual que user.image.
-- Nullable porque ninguna peña existente tiene foto y no es obligatoria.
ALTER TABLE "public"."gang" ADD COLUMN "image" TEXT;
```

Después **`bunx prisma generate`** — sin él, `Pick<Gang, 'image'>` en `type.ts` no compila y `bun run check` falla con un error poco evidente.

## 2. Módulos compartidos (refactor)

**Nuevo `src/lib/schemas/image.ts`** — constantes compartidas por avatar y foto de peña:

```ts
// Límites de subida de imágenes, compartidos por el avatar de usuario
// (updateUserSchema) y la foto de peña (gangImageSchema), y por los
// componentes que validan en cliente antes de enviar (Q7).
// 4MB y no 5: las funciones serverless de Vercel rechazan con 413 los
// cuerpos de más de 4,5MB antes de que la action llegue a ejecutarse.
export const MAX_FILE_SIZE = 4 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
```

Mantener `ACCEPTED_IMAGE_TYPES` como `string[]` (sin `as const`): `FormUser.svelte` hace `.includes(file.type)` y un tuple readonly rompe el tipado.

Consumidores a actualizar (los únicos dos): `src/lib/schemas/user.ts` (borra las constantes, importa de `./image.js`) y `src/lib/components/FormUser.svelte` (importa de `$lib/schemas/image.js`).

**Nuevo `src/lib/server/blob-image.ts`** — extrae el código de blob de `src/routes/profile/+page.server.ts` tal cual:

- `EXTENSION_BY_MIME` + `extensionForMime(mime)` — extensión derivada del MIME ya validado por zod, nunca del `file.name`.
- `uploadImage(file: File, keyPrefix: string): Promise<string>` — `put(\`${keyPrefix}-${Date.now()}.${ext}\`, buffer, { access: 'public', contentType })`, devuelve la URL. Lanza si falla; el llamante decide el mensaje.
- `deleteImage(url: string | null | undefined): Promise<void>` — no hace nada si es falsy o si `isVercelBlobUrl(url)` (de `src/lib/config/vercel-hosts.js`) es false; envuelve `del()` en try/catch con `logger.error` para no romper el flujo (B17).

`src/routes/profile/+page.server.ts` pasa a usarlos: `imageUrl = await uploadImage(imageFile, \`avatars/${user.id}\`)`dentro del try/catch existente, y`if (imageUrl) await deleteImage(previousImageUrl)`. Comportamiento observable idéntico.

## 3. Schema zod

Al final de `src/lib/schemas/gang.ts`:

```ts
// Formulario del modal de foto de /gang/[slug]: un único campo, por eso el
// fichero es obligatorio (en el perfil es opcional porque comparte
// formulario con el nombre).
export const gangImageSchema = z.object({
	imageFile: z
		.file(m.schema_gang_image_required_error())
		.max(MAX_FILE_SIZE, m.schema_image_file_size_error())
		.mime(ACCEPTED_IMAGE_TYPES, m.schema_image_file_type_error())
		.meta({ placeholder: '', description: m.schema_gang_image_describe() })
});

export type GangImageSchema = z.infer<typeof gangImageSchema>;
```

## 4. `load` y tipos de `/gang/[slug]`

`src/routes/gang/[slug]/type.ts` — añade un tipo derivado en vez de tocar `GangData` (así `update/+page.server.ts` no cambia):

```ts
// La foto solo la necesita el detalle; la página de edición no la muestra.
type GangDetailData = GangData & Pick<Gang, 'image'>;
```

`src/routes/gang/[slug]/+page.server.ts`, en el `load`:

- Junto a `canSeePendingMembers`: `const canUploadImage = isValidatedMember || isAdmin(currentUser);` (mismo criterio que el botón "Actualizar peña").
- En el `return`: `gang: { …, image: gang.image } satisfies GangDetailData`, más `canUploadImage` y `imageForm: canUploadImage ? await superValidate(zod4(gangImageSchema)) : null` (nombre `imageForm`, no `form`, para dejar sitio a futuros formularios en la misma página).

## 5. Action `uploadImage`

El fichero no tiene `actions` hoy. Añadir `export const actions: Actions = { uploadImage: async (event) => { … } }` con este orden:

1. `parseInt(event.params.slug)`; `error(404, m.error_gang_not_found())` si `NaN`.
2. `const user = await requireValidatedMember(event.locals, gangId)` — el `load` de esta página es público, así que **la barrera real es esta**, igual que en las actions de `/admin` (ver AGENTS.md). Los form actions de SvelteKit ya llevan CSRF nativo: no hace falta `requireSameOrigin`.
3. `superValidate(await event.request.formData(), zod4(gangImageSchema))` → `fail(400, { form })` si no valida; y `message(form, m.schema_gang_image_required_error(), { status: 400 })` si el fichero llega vacío.
4. `prisma.gang.findUnique({ where: { id: gangId, status: { not: 'REFUSED' } }, select: { image: true } })` → 404 si no existe.
5. `uploadImage(imageFile, \`gangs/${gangId}\`)`en try/catch →`message(form, m.schema_image_upload_error(), { status: 500 })`.
6. `prisma.gang.update({ where: { id: gangId }, data: { image: imageUrl } })` en try/catch; si falla, `await deleteImage(imageUrl)` para no dejar el blob huérfano y `message(form, m.form_gang_image_error(), { status: 500 })`. Comentario encima explicando que **no** se toca `normalizedName` ni se escribe `GangHistory` porque el nombre no cambia.
7. `await deleteImage(gang.image)` — la anterior solo se borra cuando la nueva ya está en BD (B17).
8. `logger.info({ gangId, userId: user.id }, 'Gang image updated')` + `message(form, m.form_gang_image_successfully())`.

La lectura del `image` anterior y el update no van en transacción: dos subidas simultáneas podrían dejar un blob huérfano, mismo trade-off aceptado en el avatar.

## 6. Componentes

**`src/lib/components/Modal.svelte`** — cambio aditivo: prop opcional `boxClass?: string` (por defecto `'modal-box'`) usada en el `<div>` del cuerpo, para poder ensanchar el modal de la foto grande. Retrocompatible con todos los usos actuales. Ojo: `title` es solo el texto del botón disparador; con `showButton={false}` no se renderiza, así que los encabezados van dentro del `children`.

**Nuevo `src/lib/components/gangs/FormGangImage.svelte`** — copia reducida de `FormUser.svelte` (sin `FormFields` ni `zodToFieldsJsonSchema`). Props `{ dataForm: SuperValidated<GangImageSchema>; pageStatus: number; onUploaded?: () => void }`.

- `superForm(dataForm, { id: $props.id(), validators: zod4Client(gangImageSchema), dataType: 'json', resetForm: false, onUpdated })` — replicar el comentario `T5` sobre no envolver `superForm` en `$derived`.
- `<form use:enhance method="POST" action="?/uploadImage" enctype="multipart/form-data">` — **el `action="?/uploadImage"` es imprescindible**: la página solo tiene actions nombradas y un POST sin `?/` falla con "no default action".
- `fileProxy(form, 'imageFile')` + `bind:files`, `handleFileSelect` con la misma validación cliente de tamaño/MIME escribiendo en `$message` + `clientError`, preview con `FileReader.readAsDataURL`, `clearFileSelection()` con `new DataTransfer().files`, `$delayed` para el spinner y `messageClass` derivado de `clientError`/`pageStatus` — todo idéntico a `FormUser.svelte`, salvo `rounded-lg` en la preview (no es un avatar).
- En `onUpdated`, solo en éxito (`result.valid && result.message && pageStatus === 200`): `clearFileSelection()` + `onUploaded?.()`. En error el modal se queda abierto mostrando el `alert`.

**Nuevo `src/lib/components/gangs/GangImage.svelte`** — encapsula miniatura + los dos modales. Props `{ name; image: string | null; canUpload: boolean; dataForm: SuperValidated<GangImageSchema> | null; pageStatus: number }`.

- Si hay foto: `<button type="button" class="avatar cursor-zoom-in" aria-label={m.gang_image_view({ name })} onclick={() => photoModal?.showModal()}>` con `<div class="w-16 rounded-lg md:w-20"><img src={image} alt="" /></div>` (alt vacío: el botón ya aporta el nombre accesible).
- Si `canUpload`: botón circular con icono `Camera` de lucide y `aria-label` `m.gang_image_change()` / `m.gang_image_add()` según haya foto o no, que abre `uploadModal`.
- **Fallback sin foto**: no se pinta nada salvo ese botón, para que el `<h1>` quede limpio al visitante anónimo.
- Modal de foto grande: `<Modal showButton={false} type="X" boxClass="modal-box max-w-3xl" bind:this={photoModal}>` con `<h3>` + `<img class="mt-4 w-full rounded-lg" alt={m.gang_image_alt({ name })}>`.
- Modal de subida: `<Modal showButton={false} type="X" bind:this={uploadModal}>` con `<h3>` y, dentro de `{#if dataForm}`, `<FormGangImage {dataForm} {pageStatus} onUploaded={() => uploadModal?.close()} />`.

**`src/routes/gang/[slug]/+page.svelte`** — `gang` pasa a `GangDetailData`; la miniatura va como **hermana** del `<h1>` dentro del flex del hero (meter un `<button>` dentro del `<h1>` contamina el nombre accesible del encabezado):

```svelte
<div class="flex max-w-md items-center gap-3">
	<GangImage
		name={gang.name}
		image={gang.image}
		canUpload={data.canUploadImage}
		dataForm={data.imageForm}
		pageStatus={page.status}
	/>
	<h1 class="text-3xl font-bold md:text-5xl">{m.gang_detail_title({ name: gang.name })}</h1>
</div>
```

(`page` de `$app/state`.) No hay que tocar `MemberDetail.svelte`, home, perfil, `ActivityCard` ni admin.

## 7. i18n (`messages/es.json`, único locale; `src/lib/paraglide` es generado)

**Renombrar** las claves genéricas de imagen, ahora compartidas por ambos formularios (solo las referencian `FormUser.svelte` y `profile/+page.server.ts`):

`schema_user_image_file_formats` → `schema_image_file_formats`, y lo mismo con `_file_max_size`, `_file_preview`, `_file_remove`, `_file_size_error`, `_file_type_error`, `schema_user_image_upload_error` → `schema_image_upload_error`. Se quedan como están `schema_user_image_describe` y `schema_user_image_file_label` (específicas del avatar).

Actualizar los textos al nuevo límite: `schema_image_file_max_size` → "Máx: 4MB" y `schema_image_file_size_error` → "…menor a 4MB".

**Nuevas** (respetando el agrupado por prefijo del fichero):

```json
"form_gang_image_submit": "Guardar foto",
"form_gang_image_successfully": "Foto de la peña actualizada",
"form_gang_image_error": "Error al guardar la foto de la peña, por favor inténtalo más tarde.",
"schema_gang_image_describe": "Sube una foto de la peña",
"schema_gang_image_file_label": "Foto de la peña",
"schema_gang_image_required_error": "Elige una imagen para subirla",
"gang_image_alt": "Foto de la peña {name}",
"gang_image_view": "Ver la foto de la peña {name}",
"gang_image_add": "Añadir la foto de la peña",
"gang_image_change": "Cambiar la foto de la peña",
"gang_image_upload_title": "Foto de la peña"
```

Después: `bun run paraglide-js` y `bun run format`.

## 8. Tests

**Unitarios (vitest)**

- `src/lib/schemas/gang.test.ts` — nuevo `describe('gangImageSchema')`: rechaza `{}`, rechaza un fichero de 4MB+1, rechaza `image/svg+xml`, acepta PNG/JPEG/WEBP pequeños.
- **Nuevo `src/lib/server/blob-image.test.ts`** — patrón de `membership.test.ts` (`vi.mock('@vercel/blob', …)` + `await import`): `extensionForMime` mapea los 4 MIME y cae a `jpg`; `uploadImage` llama a `put` con clave `gangs/7-<timestamp>.png`, `access:'public'` y el `contentType` correcto; `deleteImage` **no** llama a `del` con `null`, `''` ni una URL ajena, y sí con una `*.public.blob.vercel-storage.com`; `deleteImage` no propaga si `del` rechaza.
- `src/lib/schemas/user.test.ts` — actualizar el caso de tamaño al nuevo límite de 4MB.

**E2E (Playwright)** — la subida real no es testeable sin `BLOB_READ_WRITE_TOKEN`; se cubre el resto.

- `e2e/helpers/seed.ts`: `createGang` acepta `image?: string`.
- **Nuevo `e2e/gang-image.spec.ts`** (esqueleto de `gang-update.spec.ts`), sembrando un `data:image/png;base64,…` de 1×1 que renderiza sin red: anónimo ve la miniatura y no el botón de cámara; click en la miniatura abre `dialog[open]` con la foto grande y `Escape` la cierra; miembro `VALIDATED` ve el botón de cámara y este abre un `dialog[open]` con `input[type=file][name="imageFile"]`; miembro `PENDING` o de otra peña no ve el botón; y un `page.request.post('/gang/<id>?/uploadImage', …)` como no miembro devuelve 403.

## 9. Verificación

```
bunx prisma generate
bun run check
bun run lint
bun run test
bun run only-build      # nunca `build`: aplica migraciones contra la BD
bun run test:e2e
```

Y a mano con `bun run dev`: entrar en `/gang/<id>` como miembro validado, subir una foto desde el modal (comprobar preview, validación cliente de tipo/tamaño, cierre del modal en éxito y miniatura actualizada sin recargar), volver a subir otra y verificar en el panel de Vercel Blob que la anterior desapareció; abrir la foto en grande y cerrarla con `Escape`; comprobar como anónimo que no aparece el botón de cámara.

## Gotchas

- **`action="?/uploadImage"`** en el `<form>`: la página solo tiene actions nombradas.
- **Varios `superForm` en la misma página** conviven bien con `id` propio (`$props.id()`, estable en SSR) y una prop distinta por formulario en el `load` — de ahí `imageForm`.
- **No llamar a `invalidateAll()` a mano**: `superForm` ya trae `invalidateAll: true`; el `load` se reejecuta solo. La clave del blob lleva `Date.now()`, así que la URL cambia y no hay caché stale.
- **Limpiar el input al cerrar el modal**, o al reabrirlo reaparece el preview anterior y el fichero sigue en `$formData`.
- **CSP**: `img-src` ya incluye `data:`, `blob:` y `https://*.public.blob.vercel-storage.com`. Nada que tocar en `svelte.config.js`.
- **Sin redimensionado en servidor**: la miniatura descarga la foto a tamaño completo. Trade-off consciente, idéntico al del avatar; posible follow-up.
