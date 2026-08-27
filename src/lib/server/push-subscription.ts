import prisma from '$lib/server/db';
import type { PushSubscription } from 'web-push';

export type PushSubscriptionJSON = Pick<PushSubscription, 'endpoint' | 'keys'>;

export async function savePushSubscription(
	userId: string,
	subscription: PushSubscriptionJSON
): Promise<void> {
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
