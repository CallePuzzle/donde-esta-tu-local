import { test, expect } from '@playwright/test';
import { prisma } from './helpers/db';
import { createActivity, createPushSubscription, createUser, resetDb } from './helpers/seed';
import { loadTestEnv } from './helpers/env';
import { seedSession } from './helpers/auth';
import { startFakePushServer } from './helpers/push-server';

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

test('envía a las suscripciones activas y borra las caducadas (410)', async ({ request }) => {
	const user = await createUser({});
	const server = await startFakePushServer({ '/ok': 201, '/gone': 410 });

	try {
		await createPushSubscription({ userId: user.id, endpoint: `${server.url}/ok` });
		await createPushSubscription({ userId: user.id, endpoint: `${server.url}/gone` });
		await createActivity({
			name: 'Actividad Con Suscriptores',
			date: new Date(Date.now() + 10 * 60 * 1000)
		});

		const response = await request.post('/api/notifications/send', {
			headers: { Authorization: `Bearer ${CRON_SECRET}` }
		});

		expect(response.ok()).toBe(true);
		const body = await response.json();
		expect(body.sent).toBe(1);
		expect(body.failed).toBe(0);

		const remaining = await prisma.pushSubscription.findMany();
		expect(remaining.map((subscription) => subscription.endpoint)).toEqual([`${server.url}/ok`]);
	} finally {
		await server.close();
	}
});

test('el toggle de avisos aparece en /profile', async ({ page }) => {
	const user = await createUser({});
	await seedSession(page, user);

	await page.goto('/profile');

	await expect(page.getByText('Avisos de actividades', { exact: true })).toBeVisible();
	await expect(page.getByRole('checkbox')).toBeVisible();
});
