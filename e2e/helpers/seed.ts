import { randomUUID } from 'node:crypto';
import { prisma } from './db';
import { coordsMonte } from '../../src/lib/utils/coords-monte';

import type { Gang, GangStatus, MembershipGangStatus, User } from '@prisma/client';

// Coordenadas dentro del bounding box que valida addGangSchema: las de
// coords-monte.ts (Montemayor de Pililla), fuente única de verdad
export const TEST_COORDS = { lat: coordsMonte[0], lng: coordsMonte[1] };

// Deja la BD de test vacía entre tests. TRUNCATE ... CASCADE resuelve las
// referencias cruzadas user.gangId / gang.validatedByUserId.
export async function resetDb(): Promise<void> {
	await prisma.$executeRaw`TRUNCATE TABLE "gang_history", "session", "account", "verification", "user", "gang" RESTART IDENTITY CASCADE`;
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
}): Promise<Gang> {
	const name = options.name ?? `Peña E2E ${randomUUID().slice(0, 8)}`;
	return prisma.gang.create({
		data: {
			name,
			normalizedName: name.toLowerCase(),
			latitude: options.lat ?? TEST_COORDS.lat,
			longitude: options.lng ?? TEST_COORDS.lng,
			status: options.status ?? 'VALIDATED'
		}
	});
}
