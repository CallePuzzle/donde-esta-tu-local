import { webpush, type PushSubscription } from '$lib/server/web-push';
import prisma from '$lib/server/db';
import { Prisma } from '$lib/generated/prisma/client';
import {
	deletePushSubscription,
	getActivePushSubscriptions,
	getAdminPushSubscriptions,
	type PushSubscriptionJSON
} from '$lib/server/push-subscription';
import { logger } from '$lib/logger';
import { m } from '$lib/paraglide/messages.js';
import { formatTimeShort } from '$lib/utils/format-date';
import { memberDisplayName } from '$lib/utils/member-display';
import { WebPushError } from 'web-push';
import type { Activity, Gang, User } from '$lib/generated/prisma/client';

type ActivityWithPlace = Activity & { placeGang: Gang | null };
type SendResult = 'sent' | 'expired' | 'failed';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

export async function sendPushNotification(
	subscription: PushSubscriptionJSON,
	payload: object
): Promise<SendResult> {
	try {
		await webpush.sendNotification(subscription as PushSubscription, JSON.stringify(payload));
		return 'sent';
	} catch (error) {
		console.log('PUSH SEND ERROR:', error);
		if (error instanceof WebPushError && (error.statusCode === 410 || error.statusCode === 404)) {
			logger.debug('Suscripción push caducada, eliminando');
			await deletePushSubscription(subscription.endpoint);
			return 'expired';
		}
		logger.error(error, 'Error enviando notificación push');
		return 'failed';
	}
}

export function buildActivityPayload(activity: ActivityWithPlace) {
	const place = activity.placeGang?.name ?? activity.placeDesc ?? '';
	const time = formatTimeShort(activity.date);
	const body = place
		? m.push_notification_activity_body({ activity: activity.name, time, place })
		: m.push_notification_activity_body_no_place({ activity: activity.name, time });
	return {
		title: m.push_notification_activity_title(),
		body,
		icon: '/icon192.png',
		badge: '/icon192.png',
		tag: `activity-${activity.id}`,
		data: { url: '/activities' }
	};
}

// Se notifica a todos los suscriptores de todas las actividades: no hay
// segmentación por peña ni por interés (decisión de producto, no un olvido).
// Si crecen las actividades esto se vuelve spam y habrá que filtrar por
// placeGangId / membresía.
//
// Idempotencia por actividad, no por edición: si se cambia la fecha de una
// actividad ya notificada, no se vuelve a avisar. Tampoco hay retención sobre
// activity_notification_log (crece sin límite). Aceptable mientras el volumen
// de actividades sea bajo.
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
	// Suscripciones que han caducado (410/404) durante esta pasada: se evita
	// reintentarlas en las actividades siguientes del mismo bucle.
	const expiredEndpoints = new Set<string>();
	let sent = 0;
	let failed = 0;
	let notifiedActivities = 0;

	for (const activity of activities) {
		// El log actúa de cerrojo: se crea antes de enviar para que una segunda
		// ejecución del cron solapada con esta (p. ej. una pasada lenta) vea el
		// índice único de activityId y descarte la actividad en vez de
		// duplicar el envío o abortar el resto del bucle con un 500.
		try {
			await prisma.activityNotificationLog.create({ data: { activityId: activity.id } });
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === UNIQUE_CONSTRAINT_VIOLATION
			) {
				continue;
			}
			throw error;
		}

		notifiedActivities++;
		const payload = buildActivityPayload(activity);
		// Envío secuencial: aceptable para el volumen actual de suscriptores.
		// Si crece, pasar a Promise.allSettled por lotes antes de acercarse al
		// timeout de la función serverless.
		for (const { subscription } of subscriptions) {
			if (expiredEndpoints.has(subscription.endpoint)) continue;
			const result = await sendPushNotification(subscription, payload);
			if (result === 'sent') {
				sent++;
			} else if (result === 'expired') {
				expiredEndpoints.add(subscription.endpoint);
			} else {
				failed++;
			}
		}
	}

	return { sent, failed, activities: notifiedActivities };
}

export function buildPendingGangPayload(gang: Gang) {
	return {
		title: m.push_notification_admin_pending_gang_title(),
		body: m.push_notification_admin_pending_gang_body({ name: gang.name }),
		icon: '/icon192.png',
		badge: '/icon192.png',
		tag: `admin-pending-gang-${gang.id}`,
		data: { url: '/admin/gangs' }
	};
}

export function buildPendingMemberPayload(user: Pick<User, 'id' | 'name' | 'email'>, gang: Gang) {
	return {
		title: m.push_notification_admin_pending_member_title(),
		body: m.push_notification_admin_pending_member_body({
			name: memberDisplayName(user),
			gang: gang.name
		}),
		icon: '/icon192.png',
		badge: '/icon192.png',
		tag: `admin-pending-member-${user.id}`,
		data: { url: '/admin/members' }
	};
}

export async function notifyAdminsPendingGang(gang: Gang): Promise<void> {
	const subscriptions = await getAdminPushSubscriptions();
	if (subscriptions.length === 0) return;

	const payload = buildPendingGangPayload(gang);
	// Envío en paralelo: no bloquea la acción del usuario; los errores se
	// registran pero no abortan la operación principal.
	await Promise.allSettled(
		subscriptions.map(async ({ subscription }) => {
			await sendPushNotification(subscription, payload);
		})
	);
}

export async function notifyAdminsPendingMember(
	user: Pick<User, 'id' | 'name' | 'email'>,
	gang: Gang
): Promise<void> {
	const subscriptions = await getAdminPushSubscriptions();
	if (subscriptions.length === 0) return;

	const payload = buildPendingMemberPayload(user, gang);
	await Promise.allSettled(
		subscriptions.map(async ({ subscription }) => {
			await sendPushNotification(subscription, payload);
		})
	);
}
