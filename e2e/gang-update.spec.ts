import { test, expect } from '@playwright/test';
import { seedSession } from './helpers/auth';
import { prisma } from './helpers/db';
import { createGang, createUser, resetDb } from './helpers/seed';

test.beforeEach(async () => {
	await resetDb();
});

test('un miembro validado edita el nombre de su peña', async ({ page }) => {
	const gang = await createGang({ name: 'Peña Nombre Viejo' });
	const member = await createUser({
		name: 'Editor E2E',
		gangId: gang.id,
		membershipGangStatus: 'VALIDATED'
	});
	await seedSession(page, member);

	await page.goto(`/gang/${gang.id}/update`);

	// Modal informativo abierto al montar (prueba de que la página está
	// hidratada): se cierra con Escape para poder interactuar con el mapa
	const infoDialog = page.locator('dialog[open]');
	await expect(infoDialog).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.locator('dialog[open]')).toHaveCount(0);

	// En la página de edición, el click en el mapa abre el formulario directamente
	const map = page.locator('#map.leaflet-container');
	await expect(map).toBeVisible();
	await map.click({ position: { x: 400, y: 300 } });

	const editDialog = page.locator('dialog[open]');
	await expect(editDialog).toBeVisible();
	await editDialog.locator('input[name="name"]').fill('Peña Nombre Nuevo');
	await editDialog.getByRole('button', { name: 'Actualizar peña' }).click();

	await expect(editDialog.getByText('Peña añadida con éxito')).toBeVisible();

	// El cambio queda en la peña y registrado en el histórico
	const gangInDb = await prisma.gang.findUnique({ where: { id: gang.id } });
	expect(gangInDb?.name).toBe('Peña Nombre Nuevo');

	const historyEntry = await prisma.gangHistory.findFirst({
		where: { gangId: gang.id, changeType: 'UPDATE' }
	});
	expect(historyEntry).not.toBeNull();
	expect(historyEntry?.name).toBe('Peña Nombre Nuevo');
});
