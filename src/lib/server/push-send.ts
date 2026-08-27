import { webpush, type PushSubscription } from '$lib/server/web-push';
import prisma from '$lib/server/db';
import {
	deletePushSubscription,
	getActivePushSubscriptions,
	type PushSubscriptionJSON
} from '$lib/server/push-subscription';
import { logger } from '$lib/logger';
import { m } from '$lib/paraglide/messages.js';
import { formatWeekdayDayTime } from '$lib/utils/format-date';
import { WebPushError } from 'web-push';
import type { Activity, Gang } from '@prisma/client';

type ActivityWithPlace = Activity & { placeGang: Gang | null };

export async function sendPushNotification(
	subscription: PushSubscriptionJSON,
	payload: object
): Promise<void> {
	try {
		await webpush.sendNotification(subscription as PushSubscription, JSON.stringify(payload));
	} catch (error) {
		if (error instanceof WebPushError && (error.statusCode === 410 || error.statusCode === 404)) {
			logger.info({ endpoint: subscription.endpoint }, 'Suscripción push caducada, eliminando');
			await deletePushSubscription(subscription.endpoint);
			return;
		}
		throw error;
	}
}

export function buildActivityPayload(activity: ActivityWithPlace) {
	const place = activity.placeGang?.name ?? activity.placeDesc ?? '';
	const time = formatWeekdayDayTime(activity.date);
	return {
		title: m.push_notification_activity_title(),
		body: m.push_notification_activity_body({ activity: activity.name, time, place }),
		icon: '/icon192.png',
		badge: '/icon192.png',
		tag: `activity-${activity.id}`,
		data: { url: '/activities' }
	};
}

export async function sendActivityNotifications(
	windowMinutes = 60
): Promise<{ sent: number; failed: number; activities: number }> {
	const now = new Date();
	const windowEnd = new Date(now.getTime() + windowMinutes * 60 * 1000);

	const activities = await prisma.activity.findMany({
		where: {
			date: { gte: now, lte: windowEnd },
			notificationLog: null
		},
		include: { placeGang: true }
	});

	if (activities.length === 0) {
		return { sent: 0, failed: 0, activities: 0 };
	}

	const subscriptions = await getActivePushSubscriptions();
	let sent = 0;
	let failed = 0;

	for (const activity of activities) {
		const payload = buildActivityPayload(activity as ActivityWithPlace);
		for (const { subscription } of subscriptions) {
			try {
				await sendPushNotification(subscription, payload);
				sent++;
			} catch (error) {
				failed++;
				logger.error(error, 'Error enviando notificación push');
			}
		}
		await prisma.activityNotificationLog.create({
			data: { activityId: activity.id }
		});
	}

	return { sent, failed, activities: activities.length };
}
