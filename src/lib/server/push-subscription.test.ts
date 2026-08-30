import { describe, expect, it, vi, beforeEach } from 'vitest';

const upsert = vi.fn();
const deleteMany = vi.fn();
const findMany = vi.fn();
const findUnique = vi.fn();
const count = vi.fn();

vi.mock('$lib/server/db', () => ({
	default: { pushSubscription: { upsert, deleteMany, findMany, findUnique, count } }
}));

const {
	savePushSubscription,
	deletePushSubscription,
	deletePushSubscriptionForUser,
	deletePushSubscriptionsByUser,
	getActivePushSubscriptions,
	PushSubscriptionLimitError,
	MAX_PUSH_SUBSCRIPTIONS_PER_USER
} = await import('./push-subscription');

function makeSubscription(endpoint = 'https://push.test/sub/1') {
	return {
		endpoint,
		keys: {
			p256dh: 'p256dh-' + endpoint,
			auth: 'auth-' + endpoint
		}
	};
}

beforeEach(() => {
	upsert.mockReset();
	deleteMany.mockReset();
	findMany.mockReset();
	findUnique.mockReset();
	findUnique.mockResolvedValue(null);
	count.mockReset();
	count.mockResolvedValue(0);
});

describe('savePushSubscription', () => {
	it('hace upsert por endpoint', async () => {
		const subscription = makeSubscription();
		await savePushSubscription('user-1', subscription);
		expect(upsert).toHaveBeenCalledWith({
			where: { endpoint: subscription.endpoint },
			update: {
				p256dh: subscription.keys.p256dh,
				auth: subscription.keys.auth,
				userId: 'user-1'
			},
			create: {
				endpoint: subscription.endpoint,
				p256dh: subscription.keys.p256dh,
				auth: subscription.keys.auth,
				userId: 'user-1'
			}
		});
	});

	it('rechaza un dispositivo nuevo si el usuario ya está al límite', async () => {
		findUnique.mockResolvedValue(null);
		count.mockResolvedValue(MAX_PUSH_SUBSCRIPTIONS_PER_USER);

		await expect(savePushSubscription('user-1', makeSubscription())).rejects.toBeInstanceOf(
			PushSubscriptionLimitError
		);
		expect(upsert).not.toHaveBeenCalled();
	});

	it('permite resincronizar un endpoint ya propio aunque esté al límite', async () => {
		const subscription = makeSubscription();
		findUnique.mockResolvedValue({ userId: 'user-1' });
		count.mockResolvedValue(MAX_PUSH_SUBSCRIPTIONS_PER_USER);

		await savePushSubscription('user-1', subscription);

		expect(upsert).toHaveBeenCalled();
	});

	it('cuenta como nuevo un endpoint que pertenecía a otro usuario', async () => {
		findUnique.mockResolvedValue({ userId: 'user-2' });
		count.mockResolvedValue(MAX_PUSH_SUBSCRIPTIONS_PER_USER);

		await expect(savePushSubscription('user-1', makeSubscription())).rejects.toBeInstanceOf(
			PushSubscriptionLimitError
		);
	});
});

describe('deletePushSubscription', () => {
	it('borra la suscripción por endpoint', async () => {
		await deletePushSubscription('https://push.test/sub/2');
		expect(deleteMany).toHaveBeenCalledWith({
			where: { endpoint: 'https://push.test/sub/2' }
		});
	});
});

describe('deletePushSubscriptionForUser', () => {
	it('borra la suscripción solo si pertenece al usuario', async () => {
		await deletePushSubscriptionForUser('https://push.test/sub/2', 'user-1');
		expect(deleteMany).toHaveBeenCalledWith({
			where: { endpoint: 'https://push.test/sub/2', userId: 'user-1' }
		});
	});
});

describe('deletePushSubscriptionsByUser', () => {
	it('borra todas las suscripciones del usuario', async () => {
		await deletePushSubscriptionsByUser('user-2');
		expect(deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-2' } });
	});
});

describe('getActivePushSubscriptions', () => {
	it('devuelve las suscripciones con su usuario', async () => {
		findMany.mockResolvedValue([
			{
				id: 1,
				endpoint: 'https://push.test/sub/3',
				p256dh: 'p256dh-3',
				auth: 'auth-3',
				userId: 'user-3',
				createdAt: new Date(),
				updatedAt: new Date()
			}
		]);

		const result = await getActivePushSubscriptions();

		expect(result).toEqual([
			{
				userId: 'user-3',
				subscription: {
					endpoint: 'https://push.test/sub/3',
					keys: { p256dh: 'p256dh-3', auth: 'auth-3' }
				}
			}
		]);
	});
});
