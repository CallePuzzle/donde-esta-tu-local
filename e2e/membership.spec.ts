import { test, expect } from '@playwright/test';
import { seedSession } from './helpers/auth';
import { prisma } from './helpers/db';
import { createGang, createUser, resetDb } from './helpers/seed';

test.beforeEach(async () => {
	await resetDb();
});

test('un usuario solicita unirse a una peña validada', async ({ page }) => {
	const gang = await createGang({ name: 'Peña Con Miembros' });
	const applicant = await createUser({ name: 'Solicitante E2E' });
	await seedSession(page, applicant);

	await page.goto(`/gang/${gang.id}`);
	// El mapa se inicializa en onMount: si existe, la página ya está hidratada
	// y los botones tienen sus manejadores registrados
	await page.locator('#map.leaflet-container').waitFor();

	await page.getByRole('button', { name: 'Solicitar unirme a la peña' }).click();

	await expect(page.getByText('Solicitud enviada con éxito', { exact: true })).toBeVisible();

	const applicantInDb = await prisma.user.findUnique({ where: { id: applicant.id } });
	expect(applicantInDb?.gangId).toBe(gang.id);
	expect(applicantInDb?.membershipGangStatus).toBe('PENDING');
});

test('un miembro validado valida una solicitud pendiente', async ({ page }) => {
	const gang = await createGang({ name: 'Peña Con Solicitudes' });
	const member = await createUser({
		name: 'Miembro Validado',
		gangId: gang.id,
		membershipGangStatus: 'VALIDATED'
	});
	const applicant = await createUser({
		name: 'Solicitante Pendiente',
		gangId: gang.id,
		membershipGangStatus: 'PENDING'
	});
	await seedSession(page, member);

	await page.goto(`/gang/${gang.id}`);
	await page.locator('#map.leaflet-container').waitFor();

	const pendingRow = page.locator('li').filter({ hasText: applicant.name });
	await expect(pendingRow).toBeVisible();
	await pendingRow.getByRole('button', { name: 'Validar' }).click();

	// exact: el nombre del miembro ("Miembro Validado") también casa con el texto
	await expect(page.getByText('Validado', { exact: true })).toBeVisible();

	const applicantInDb = await prisma.user.findUnique({ where: { id: applicant.id } });
	expect(applicantInDb?.membershipGangStatus).toBe('VALIDATED');
});

test('un miembro validado rechaza una solicitud pendiente', async ({ page }) => {
	const gang = await createGang({ name: 'Peña Con Solicitudes' });
	const member = await createUser({
		name: 'Miembro Validado',
		gangId: gang.id,
		membershipGangStatus: 'VALIDATED'
	});
	const applicant = await createUser({
		name: 'Solicitante Rechazado',
		gangId: gang.id,
		membershipGangStatus: 'PENDING'
	});
	await seedSession(page, member);

	await page.goto(`/gang/${gang.id}`);
	await page.locator('#map.leaflet-container').waitFor();

	const pendingRow = page.locator('li').filter({ hasText: applicant.name });
	await expect(pendingRow).toBeVisible();
	await pendingRow.getByRole('button', { name: 'Rechazar' }).click();

	// exact: el nombre del solicitante ("Solicitante Rechazado") también casa
	await expect(page.getByText('Rechazado', { exact: true })).toBeVisible();

	const applicantInDb = await prisma.user.findUnique({ where: { id: applicant.id } });
	expect(applicantInDb?.membershipGangStatus).toBe('REFUSED');
});
