import prisma from '$lib/server/db';
import { MAX_PUSH_SUBSCRIPTIONS_PER_USER } from '$lib/push-subscription-limit';
import type { PushSubscription } from 'web-push';

export type PushSubscriptionJSON = Pick<PushSubscription, 'endpoint' | 'keys'>;

export { MAX_PUSH_SUBSCRIPTIONS_PER_USER };

export class PushSubscriptionLimitError extends Error {
	constructor() {
		super('Push subscription limit reached');
		this.name = 'PushSubscriptionLimitError';
	}
}

export async function savePushSubscription(
	userId: string,
	subscription: PushSubscriptionJSON
): Promise<void> {
	const existing = await prisma.pushSubscription.findUnique({
		where: { endpoint: subscription.endpoint },
		select: { userId: true }
	});

	// Solo cuenta contra el límite si es un dispositivo nuevo para este
	// usuario: resincronizar un endpoint ya suyo (ver NotificationToggle,
	// onMount) no debe bloquearse aunque ya esté al límite.
	if (existing?.userId !== userId) {
		const subscriptionCount = await prisma.pushSubscription.count({ where: { userId } });
		if (subscriptionCount >= MAX_PUSH_SUBSCRIPTIONS_PER_USER) {
			throw new PushSubscriptionLimitError();
		}
	}

	await prisma.pushSubscription.upsert({
		where: { endpoint: subscription.endpoint },
		update: {
			p256dh: subscription.keys.p256dh,
			auth: subscription.keys.auth,
			userId
		},
		create: {
			endpoint: subscription.endpoint,
			p256dh: subscription.keys.p256dh,
			auth: subscription.keys.auth,
			userId
		}
	});
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
	await prisma.pushSubscription.deleteMany({
		where: { endpoint }
	});
}

// Variante para el endpoint de baja del propio usuario: sin el filtro por
// userId, cualquier usuario autenticado que conociera un endpoint ajeno
// podría desuscribirlo.
export async function deletePushSubscriptionForUser(
	endpoint: string,
	userId: string
): Promise<void> {
	await prisma.pushSubscription.deleteMany({
		where: { endpoint, userId }
	});
}

export async function deletePushSubscriptionsByUser(userId: string): Promise<void> {
	await prisma.pushSubscription.deleteMany({
		where: { userId }
	});
}

export async function getActivePushSubscriptions(): Promise<
	{ userId: string; subscription: PushSubscriptionJSON }[]
> {
	const rows = await prisma.pushSubscription.findMany();
	return rows.map((row) => ({
		userId: row.userId,
		subscription: {
			endpoint: row.endpoint,
			keys: {
				p256dh: row.p256dh,
				auth: row.auth
			}
		}
	}));
}

export async function getAdminPushSubscriptions(): Promise<
	{ userId: string; subscription: PushSubscriptionJSON }[]
> {
	const rows = await prisma.pushSubscription.findMany({
		where: {
			user: {
				role: { in: ['admin', 'system'] }
			}
		}
	});
	return rows.map((row) => ({
		userId: row.userId,
		subscription: {
			endpoint: row.endpoint,
			keys: {
				p256dh: row.p256dh,
				auth: row.auth
			}
		}
	}));
}
