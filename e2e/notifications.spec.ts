import { test, expect } from '@playwright/test';
import { prisma } from './helpers/db';
import { createActivity, resetDb } from './helpers/seed';
import { loadTestEnv } from './helpers/env';

const testEnv = loadTestEnv();
const CRON_SECRET = testEnv.CRON_SECRET;

test.beforeEach(async () => {
	await resetDb();
});

test('el endpoint de envío rechaza peticiones sin CRON_SECRET', async ({ request }) => {
	const response = await request.post('/api/notifications/send');
	expect(response.status()).toBe(401);
});

test('el endpoint de envío notifica actividades dentro de la ventana', async ({ request }) => {
	await createActivity({ name: 'Actividad Próxima', date: new Date(Date.now() + 30 * 60 * 1000) });

	const response = await request.post('/api/notifications/send', {
		headers: { Authorization: `Bearer ${CRON_SECRET}` }
	});

	expect(response.ok()).toBe(true);
	const body = await response.json();
	expect(body.activities).toBe(1);

	const log = await prisma.activityNotificationLog.findFirst({
		where: { activity: { name: 'Actividad Próxima' } }
	});
	expect(log).not.toBeNull();
});

test('el endpoint de envío no repite actividades ya notificadas', async ({ request }) => {
	await createActivity({
		name: 'Actividad Notificada',
		date: new Date(Date.now() + 20 * 60 * 1000)
	});

	await request.post('/api/notifications/send', {
		headers: { Authorization: `Bearer ${CRON_SECRET}` }
	});

	const secondResponse = await request.post('/api/notifications/send', {
		headers: { Authorization: `Bearer ${CRON_SECRET}` }
	});

	expect(secondResponse.ok()).toBe(true);
	const secondBody = await secondResponse.json();
	expect(secondBody.activities).toBe(0);
});
