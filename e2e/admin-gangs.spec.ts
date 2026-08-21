import { test, expect } from '@playwright/test';
import { seedSession, waitForHydration } from './helpers/auth';
import { prisma } from './helpers/db';
import { createGang, createUser, resetDb } from './helpers/seed';

test.beforeEach(async () => {
	await resetDb();
});

test('un admin valida una peña pendiente desde /admin/gangs', async ({ page }) => {
	const admin = await createUser({ name: 'Admin E2E', role: 'admin' });
	const gang = await createGang({ name: 'Peña Pendiente de Validar', status: 'PENDING' });
	await seedSession(page, admin);

	await page.goto('/admin/gangs');
	await waitForHydration(page);

	// El tab "Pendientes" es el activo por defecto
	const row = page.getByRole('row', { name: new RegExp(gang.name) });
	await expect(row).toBeVisible();
	await row.getByRole('button', { name: 'Validar' }).click();

	await expect(page.getByText('Gang validada correctamente')).toBeVisible();

	const gangInDb = await prisma.gang.findUnique({ where: { id: gang.id } });
	expect(gangInDb?.status).toBe('VALIDATED');
});

test('un admin rechaza una peña pendiente desde /admin/gangs', async ({ page }) => {
	const admin = await createUser({ name: 'Admin E2E', role: 'admin' });
	const gang = await createGang({ name: 'Peña Pendiente de Rechazar', status: 'PENDING' });
	await seedSession(page, admin);

	await page.goto('/admin/gangs');
	await waitForHydration(page);

	const row = page.getByRole('row', { name: new RegExp(gang.name) });
	await expect(row).toBeVisible();
	await row.getByRole('button', { name: 'Rechazar' }).click();

	await expect(page.getByText('Gang rechazada')).toBeVisible();

	const gangInDb = await prisma.gang.findUnique({ where: { id: gang.id } });
	expect(gangInDb?.status).toBe('REFUSED');
});
