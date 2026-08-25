import { test, expect } from '@playwright/test';
import { seedSession } from './helpers/auth';
import { createGang, createUser, resetDb } from './helpers/seed';

// PNG 1x1 en base64: renderiza sin red y no depende de BLOB_READ_WRITE_TOKEN
const TEST_IMAGE =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

test.beforeEach(async () => {
	await resetDb();
});

test('un anónimo ve la miniatura de la peña pero no el botón de cámara', async ({ page }) => {
	const gang = await createGang({ name: 'Peña Con Foto', image: TEST_IMAGE });

	await page.goto(`/gang/${gang.id}`);
	await page.locator('#map.leaflet-container').waitFor();

	await expect(
		page.getByRole('button', { name: `Ver la foto de la peña ${gang.name}` })
	).toBeVisible();
	await expect(page.getByRole('button', { name: 'Añadir la foto de la peña' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Cambiar la foto de la peña' })).toHaveCount(0);
});

test('al hacer click en la miniatura se abre la foto en grande y Escape la cierra', async ({
	page
}) => {
	const gang = await createGang({ name: 'Peña Con Foto Grande', image: TEST_IMAGE });

	await page.goto(`/gang/${gang.id}`);
	await page.locator('#map.leaflet-container').waitFor();

	await page.getByRole('button', { name: `Ver la foto de la peña ${gang.name}` }).click();

	const photoDialog = page.locator('dialog[open]');
	await expect(photoDialog).toBeVisible();
	await expect(
		photoDialog.locator('img[alt="Foto de la peña Peña Con Foto Grande"]')
	).toBeVisible();

	await page.keyboard.press('Escape');
	await expect(page.locator('dialog[open]')).toHaveCount(0);
});

test('un miembro validado ve el botón de cámara y puede abrir el formulario de subida', async ({
	page
}) => {
	const gang = await createGang({ name: 'Peña Sin Foto' });
	const member = await createUser({
		name: 'Miembro Validado',
		gangId: gang.id,
		membershipGangStatus: 'VALIDATED'
	});
	await seedSession(page, member);

	await page.goto(`/gang/${gang.id}`);
	await page.locator('#map.leaflet-container').waitFor();

	await page.getByRole('button', { name: 'Añadir la foto de la peña' }).click();

	const uploadDialog = page.locator('dialog[open]');
	await expect(uploadDialog).toBeVisible();
	await expect(uploadDialog.locator('input[type="file"][name="imageFile"]')).toBeVisible();
});

test('un miembro pendiente no ve el botón de cámara', async ({ page }) => {
	const gang = await createGang({ name: 'Peña Con Pendiente' });
	const applicant = await createUser({
		name: 'Solicitante Pendiente',
		gangId: gang.id,
		membershipGangStatus: 'PENDING'
	});
	await seedSession(page, applicant);

	await page.goto(`/gang/${gang.id}`);
	await page.locator('#map.leaflet-container').waitFor();

	await expect(page.getByRole('button', { name: 'Añadir la foto de la peña' })).toHaveCount(0);
});

test('un miembro de otra peña no ve el botón de cámara', async ({ page }) => {
	const gang = await createGang({ name: 'Peña Objetivo' });
	const otherGang = await createGang({ name: 'Peña Ajena' });
	const otherMember = await createUser({
		name: 'Miembro De Otra Peña',
		gangId: otherGang.id,
		membershipGangStatus: 'VALIDATED'
	});
	await seedSession(page, otherMember);

	await page.goto(`/gang/${gang.id}`);
	await page.locator('#map.leaflet-container').waitFor();

	await expect(page.getByRole('button', { name: 'Añadir la foto de la peña' })).toHaveCount(0);
});

test('un no miembro no puede subir la foto directamente contra la action', async ({ page }) => {
	const gang = await createGang({ name: 'Peña Protegida' });
	const applicant = await createUser({
		name: 'Solicitante Sin Permiso',
		gangId: gang.id,
		membershipGangStatus: 'PENDING'
	});
	await seedSession(page, applicant);

	const response = await page.request.post(`/gang/${gang.id}?/uploadImage`, {
		multipart: {}
	});

	expect(response.status()).toBe(403);
});
