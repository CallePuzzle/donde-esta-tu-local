import { test, expect } from '@playwright/test';
import { seedSession } from './helpers/auth';
import { prisma } from './helpers/db';
import { createUser, resetDb } from './helpers/seed';

test.beforeEach(async () => {
	await resetDb();
});

test('un usuario crea una peña haciendo click en el mapa', async ({ page }) => {
	const user = await createUser({});
	await seedSession(page, user);

	await page.goto('/gang/add');

	// El modal informativo se abre solo al montar la página (que se abra ya
	// prueba que la página está hidratada): se cierra con Escape — el botón
	// del backdrop queda tapado por la caja del modal y no es clickable.
	const infoDialog = page.locator('dialog[open]');
	await expect(infoDialog).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.locator('dialog[open]')).toHaveCount(0);

	// Click real sobre el mapa Leaflet → popup con el botón de alta
	const map = page.locator('#map.leaflet-container');
	await expect(map).toBeVisible();
	await map.click({ position: { x: 400, y: 300 } });

	const popup = page.locator('.leaflet-popup');
	await popup.getByRole('button', { name: 'Añadir peña en esta localización' }).click();

	// Modal con el formulario de alta
	const addDialog = page.locator('dialog[open]');
	await expect(addDialog).toBeVisible();
	await addDialog.locator('input[name="name"]').fill('Peña E2E Mapa');
	await addDialog.getByRole('button', { name: 'Añadir peña', exact: true }).click();

	await expect(addDialog.getByText('Peña añadida con éxito')).toBeVisible();

	// La peña queda registrada como pendiente de validación
	const gang = await prisma.gang.findFirst({ where: { name: 'Peña E2E Mapa' } });
	expect(gang).not.toBeNull();
	expect(gang?.status).toBe('PENDING');
});
