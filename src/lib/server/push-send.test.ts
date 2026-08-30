import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Prisma } from '$lib/generated/prisma/client';
import type { Gang, User } from '$lib/generated/prisma/client';

const sendNotification = vi.fn();

vi.mock('web-push', () => {
	class WebPushError extends Error {
		statusCode: number;
		constructor(message: string, statusCode: number) {
			super(message);
			this.statusCode = statusCode;
		}
	}
	return {
		default: { setVapidDetails: vi.fn(), sendNotification },
		WebPushError
	};
});

const findMany = vi.fn();
const create = vi.fn();

vi.mock('$lib/server/db', () => ({
	default: {
		activity: { findMany },
		activityNotificationLog: { create }
	}
}));

const deletePushSubscription = vi.fn();
const getActivePushSubscriptions = vi.fn();
const getAdminPushSubscriptions = vi.fn();

vi.mock('$lib/server/push-subscription', () => ({
	deletePushSubscription,
	getActivePushSubscriptions,
	getAdminPushSubscriptions
}));

const { WebPushError } = await import('web-push');
const {
	sendPushNotification,
	sendActivityNotifications,
	buildPendingGangPayload,
	buildPendingMemberPayload,
	notifyAdminsPendingGang,
	notifyAdminsPendingMember
} = await import('./push-send');

function makeWebPushError(statusCode: number, message = 'error') {
	return new WebPushError(message, statusCode, {}, '', '');
}

function makeSubscription(endpoint: string) {
	return { endpoint, keys: { p256dh: `p256dh-${endpoint}`, auth: `auth-${endpoint}` } };
}

function makeActivity(id: number, overrides: Partial<{ name: string; date: Date }> = {}) {
	return {
		id,
		name: overrides.name ?? `Actividad ${id}`,
		date: overrides.date ?? new Date(),
		placeGang: null,
		placeDesc: null
	};
}

beforeEach(() => {
	sendNotification.mockReset();
	findMany.mockReset();
	create.mockReset();
	deletePushSubscription.mockReset();
	getActivePushSubscriptions.mockReset();
	getAdminPushSubscriptions.mockReset();
});

describe('sendPushNotification', () => {
	it('devuelve "sent" cuando el envío funciona', async () => {
		sendNotification.mockResolvedValue(undefined);
		const result = await sendPushNotification(makeSubscription('https://push.test/1'), {
			title: 'x'
		});
		expect(result).toBe('sent');
		expect(deletePushSubscription).not.toHaveBeenCalled();
	});

	it.each([410, 404])(
		'devuelve "expired" y borra la suscripción cuando el push service responde %i',
		async (statusCode) => {
			sendNotification.mockRejectedValue(makeWebPushError(statusCode, 'gone'));
			const subscription = makeSubscription('https://push.test/2');
			const result = await sendPushNotification(subscription, { title: 'x' });
			expect(result).toBe('expired');
			expect(deletePushSubscription).toHaveBeenCalledWith(subscription.endpoint);
		}
	);

	it('devuelve "failed" y no borra la suscripción ante otros errores', async () => {
		sendNotification.mockRejectedValue(makeWebPushError(500, 'server error'));
		const result = await sendPushNotification(makeSubscription('https://push.test/3'), {
			title: 'x'
		});
		expect(result).toBe('failed');
		expect(deletePushSubscription).not.toHaveBeenCalled();
	});
});

describe('sendActivityNotifications', () => {
	it('no hace nada si no hay actividades en la ventana', async () => {
		findMany.mockResolvedValue([]);
		const result = await sendActivityNotifications(60);
		expect(result).toEqual({ sent: 0, failed: 0, activities: 0 });
		expect(getActivePushSubscriptions).not.toHaveBeenCalled();
	});

	it('busca actividades entre ahora y ahora + windowMinutes sin log previo', async () => {
		findMany.mockResolvedValue([]);
		const before = Date.now();
		await sendActivityNotifications(45);
		const after = Date.now();

		const where = findMany.mock.calls[0][0].where;
		expect(where.notificationLog).toBeNull();
		expect(where.date.gte.getTime()).toBeGreaterThanOrEqual(before);
		expect(where.date.gte.getTime()).toBeLessThanOrEqual(after);
		expect(where.date.lte.getTime() - where.date.gte.getTime()).toBe(45 * 60 * 1000);
	});

	it('cuenta envíos correctos y fallidos, y crea el log por actividad', async () => {
		findMany.mockResolvedValue([makeActivity(1)]);
		create.mockResolvedValue(undefined);
		getActivePushSubscriptions.mockResolvedValue([
			{ userId: 'u1', subscription: makeSubscription('https://push.test/ok') },
			{ userId: 'u2', subscription: makeSubscription('https://push.test/fail') }
		]);
		sendNotification.mockImplementation((subscription: { endpoint: string }) => {
			if (subscription.endpoint === 'https://push.test/fail') {
				return Promise.reject(makeWebPushError(500, 'server error'));
			}
			return Promise.resolve();
		});

		const result = await sendActivityNotifications();

		expect(result).toEqual({ sent: 1, failed: 1, activities: 1 });
		expect(create).toHaveBeenCalledWith({ data: { activityId: 1 } });
	});

	it('salta una actividad si el log ya existe (carrera con otra ejecución del cron)', async () => {
		findMany.mockResolvedValue([makeActivity(1), makeActivity(2)]);
		create
			.mockRejectedValueOnce(
				new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
					code: 'P2002',
					clientVersion: '0.0.0'
				})
			)
			.mockResolvedValueOnce(undefined);
		getActivePushSubscriptions.mockResolvedValue([
			{ userId: 'u1', subscription: makeSubscription('https://push.test/ok') }
		]);
		sendNotification.mockResolvedValue(undefined);

		const result = await sendActivityNotifications();

		expect(result).toEqual({ sent: 1, failed: 0, activities: 1 });
		expect(sendNotification).toHaveBeenCalledTimes(1);
	});

	it('propaga errores del log que no son de restricción única', async () => {
		findMany.mockResolvedValue([makeActivity(1)]);
		create.mockRejectedValue(new Error('boom'));
		getActivePushSubscriptions.mockResolvedValue([]);

		await expect(sendActivityNotifications()).rejects.toThrow('boom');
	});

	it('no reintenta una suscripción caducada en actividades posteriores de la misma pasada', async () => {
		findMany.mockResolvedValue([makeActivity(1), makeActivity(2)]);
		create.mockResolvedValue(undefined);
		getActivePushSubscriptions.mockResolvedValue([
			{ userId: 'u1', subscription: makeSubscription('https://push.test/gone') }
		]);
		sendNotification.mockRejectedValue(makeWebPushError(410, 'gone'));

		const result = await sendActivityNotifications();

		expect(result).toEqual({ sent: 0, failed: 0, activities: 2 });
		expect(sendNotification).toHaveBeenCalledTimes(1);
		expect(deletePushSubscription).toHaveBeenCalledTimes(1);
	});
});

describe('buildPendingGangPayload', () => {
	it('incluye el nombre de la peña y apunta a /admin/gangs', () => {
		const payload = buildPendingGangPayload({ id: 1, name: 'Peña Test' } as Gang);
		expect(payload.title).toBe('Nueva peña pendiente');
		expect(payload.body).toContain('Peña Test');
		expect(payload.data.url).toBe('/admin/gangs');
	});
});

describe('buildPendingMemberPayload', () => {
	it('usa el nombre del usuario y apunta a /admin/members', () => {
		const payload = buildPendingMemberPayload(
			{ id: 'u1', name: 'Ana', email: 'ana@test.com' } as User,
			{ id: 1, name: 'Peña Test' } as Gang
		);
		expect(payload.title).toBe('Nueva solicitud de miembro');
		expect(payload.body).toContain('Ana');
		expect(payload.body).toContain('Peña Test');
		expect(payload.data.url).toBe('/admin/members');
	});

	it('falla al email si el usuario no tiene nombre', () => {
		const payload = buildPendingMemberPayload(
			{ id: 'u1', name: null, email: 'ana@test.com' } as unknown as User,
			{ id: 1, name: 'Peña Test' } as Gang
		);
		expect(payload.body).toContain('ana@test.com');
	});
});

describe('notifyAdminsPendingGang', () => {
	it('no consulta suscripciones si no hay admins suscritos', async () => {
		getAdminPushSubscriptions.mockResolvedValue([]);
		await notifyAdminsPendingGang({ id: 1, name: 'Peña Test' } as Gang);
		expect(sendNotification).not.toHaveBeenCalled();
	});

	it('envía a todas las suscripciones de admin', async () => {
		getAdminPushSubscriptions.mockResolvedValue([
			{ userId: 'admin1', subscription: makeSubscription('https://push.test/admin1') },
			{ userId: 'admin2', subscription: makeSubscription('https://push.test/admin2') }
		]);
		sendNotification.mockResolvedValue(undefined);

		await notifyAdminsPendingGang({ id: 1, name: 'Peña Test' } as Gang);

		expect(sendNotification).toHaveBeenCalledTimes(2);
	});
});

describe('notifyAdminsPendingMember', () => {
	it('envía a todas las suscripciones de admin', async () => {
		getAdminPushSubscriptions.mockResolvedValue([
			{ userId: 'admin1', subscription: makeSubscription('https://push.test/admin1') }
		]);
		sendNotification.mockResolvedValue(undefined);

		await notifyAdminsPendingMember(
			{ id: 'u1', name: 'Ana', email: 'ana@test.com' } as User,
			{ id: 1, name: 'Peña Test' } as Gang
		);

		expect(sendNotification).toHaveBeenCalledTimes(1);
	});
});
