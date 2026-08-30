import { randomUUID, createECDH, randomBytes } from 'node:crypto';
import { prisma } from './db';
import { coordsMonte } from '../../src/lib/utils/coords-monte';

import type {
	Activity,
	Gang,
	GangStatus,
	MembershipGangStatus,
	PushSubscription,
	User
} from '$lib/generated/prisma/client';

// Coordenadas dentro del bounding box que valida addGangSchema: las de
// coords-monte.ts (Montemayor de Pililla), fuente única de verdad
export const TEST_COORDS = { lat: coordsMonte[0], lng: coordsMonte[1] };

// Deja la BD de test vacía entre tests. TRUNCATE ... CASCADE resuelve las
// referencias cruzadas user.gangId / gang.validatedByUserId.
export async function resetDb(): Promise<void> {
	await prisma.$executeRaw`TRUNCATE TABLE "activity_notification_log", "activity", "push_subscription", "gang_history", "session", "account", "verification", "user", "gang" RESTART IDENTITY CASCADE`;
}

export async function createUser(options: {
	email?: string;
	name?: string;
	role?: string;
	gangId?: number;
	membershipGangStatus?: MembershipGangStatus;
}): Promise<User> {
	const suffix = randomUUID().slice(0, 8);
	return prisma.user.create({
		data: {
			id: randomUUID(),
			name: options.name ?? `Usuario E2E ${suffix}`,
			email: options.email ?? `user-${suffix}@e2e.test`,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			role: options.role ?? null,
			gangId: options.gangId ?? null,
			membershipGangStatus: options.membershipGangStatus ?? 'PENDING'
		}
	});
}

export async function createGang(options: {
	name?: string;
	status?: GangStatus;
	lat?: number;
	lng?: number;
	image?: string;
}): Promise<Gang> {
	const name = options.name ?? `Peña E2E ${randomUUID().slice(0, 8)}`;
	return prisma.gang.create({
		data: {
			name,
			normalizedName: name.toLowerCase(),
			latitude: options.lat ?? TEST_COORDS.lat,
			longitude: options.lng ?? TEST_COORDS.lng,
			status: options.status ?? 'VALIDATED',
			image: options.image ?? null
		}
	});
}

export async function createActivity(options: {
	name?: string;
	date?: Date;
	placeGangId?: number;
	placeDesc?: string;
}): Promise<Activity> {
	const date = options.date ?? new Date(Date.now() + 30 * 60 * 1000);
	const name = options.name ?? `Actividad E2E ${randomUUID().slice(0, 8)}`;
	return prisma.activity.create({
		data: {
			name,
			date,
			placeGangId: options.placeGangId ?? null,
			placeDesc: options.placeDesc ?? null
		}
	});
}

// Claves de cifrado válidas para una suscripción push (mismo formato que
// generaría el navegador): un punto EC P-256 sin comprimir (65 bytes) como
// p256dh y un secreto de 16 bytes como auth. Sin esto, web-push rechaza la
// suscripción antes de intentar la petición HTTP (ver encryption-helper.js).
export function generatePushKeys(): { p256dh: string; auth: string } {
	const ecdh = createECDH('prime256v1');
	ecdh.generateKeys();
	return {
		p256dh: ecdh.getPublicKey('base64url'),
		auth: randomBytes(16).toString('base64url')
	};
}

export async function createPushSubscription(options: {
	userId: string;
	endpoint: string;
}): Promise<PushSubscription> {
	return prisma.pushSubscription.create({
		data: {
			endpoint: options.endpoint,
			userId: options.userId,
			...generatePushKeys()
		}
	});
}
