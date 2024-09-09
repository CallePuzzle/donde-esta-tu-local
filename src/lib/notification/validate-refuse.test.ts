import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getPrismaClient } from '$lib/tests/clientForTest';
import { ValidateRefuse } from './validate-refuse';
import { AddGang } from '$lib/gang/add-gang';
import { RequestNewMember } from '$lib/gang/request-new-member';
import type { Gang, Notification, User } from '@prisma/client';

const prisma = await getPrismaClient();

describe('validate gang', () => {
	const USER_LOCAL = 'user|local';
	const USER_ADMIN = 'admin|local';
	let gang: Gang;
	let notification: Notification;

	beforeAll(async () => {
		const ret = await AddGang(prisma, USER_LOCAL, 'validategang', '0', '0');
		gang = ret.data as Gang;
		notification = (await prisma.notification.findFirst({
			where: {
				relatedGangId: gang.id
			}
		})) as Notification;
		const notificationId = notification?.id as number;
		await ValidateRefuse(prisma, notificationId, USER_ADMIN, 'gang', 'VALIDATED', 'gang validated');
		gang = (await prisma.gang.findUnique({
			where: {
				id: gang.id
			}
		})) as Gang;
		notification = (await prisma.notification.findUnique({
			where: {
				id: notificationId
			}
		})) as Notification;
	});

	afterAll(async () => {
		await prisma.gang.delete({
			where: {
				id: gang.id
			}
		});
		await prisma.notification.delete({
			where: {
				id: notification.id
			}
		});
		await prisma.$disconnect();
	});

	it('gang is validated', async () => {
		expect(gang.status).toBe('VALIDATED');
	});
	it('notification is not PEDING', async () => {
		expect(notification.status).not.toBe('PENDING');
	});
	it('notification reviewedByUserId is USER_ADMIN', async () => {
		expect(notification.reviewedByUserId).toBe(USER_ADMIN);
	});
});

describe('refuse gang', () => {
	const USER_LOCAL = 'user|local';
	const USER_ADMIN = 'admin|local';
	let gang: Gang;
	let notification: Notification;

	beforeAll(async () => {
		const ret = await AddGang(prisma, USER_LOCAL, 'refusegang', '0', '0');
		gang = ret.data as Gang;
		notification = (await prisma.notification.findFirst({
			where: {
				relatedGangId: gang.id
			}
		})) as Notification;
		const notificationId = notification?.id as number;
		await ValidateRefuse(prisma, notificationId, USER_ADMIN, 'gang', 'REFUSED', 'gang refused');
		gang = (await prisma.gang.findUnique({
			where: {
				id: gang.id
			}
		})) as Gang;
		notification = (await prisma.notification.findUnique({
			where: {
				id: notificationId
			}
		})) as Notification;
	});

	afterAll(async () => {
		await prisma.gang.delete({
			where: {
				id: gang.id
			}
		});
		await prisma.notification.delete({
			where: {
				id: notification.id
			}
		});
		await prisma.$disconnect();
	});

	it('gang is refused', async () => {
		expect(gang.status).toBe('REFUSED');
	});
	it('notification is not PEDING', async () => {
		expect(notification.status).not.toBe('PENDING');
	});
	it('notification reviewedByUserId is USER_ADMIN', async () => {
		expect(notification.reviewedByUserId).toBe(USER_ADMIN);
	});
});

describe('validate member', () => {
	const USER_LOCAL = 'user|local';
	const USER_ADMIN = 'admin|local';
	const USER_NO_GANG = 'user|no-gang';
	let gang: Gang;
	let notificationGang: Notification;
	let notificationMember: Notification;

	beforeAll(async () => {
		const ret = await AddGang(prisma, USER_LOCAL, 'validatemember', '0', '0');
		gang = ret.data as Gang;
		notificationGang = (await prisma.notification.findFirst({
			where: {
				relatedGangId: gang.id
			}
		})) as Notification;
		await RequestNewMember(prisma, gang.id, USER_NO_GANG);
		notificationMember = (await prisma.notification.findFirst({
			where: {
				type: 'gang-member-request',
				relatedGangId: gang.id,
				addedByUserId: USER_NO_GANG
			}
		})) as Notification;
		await ValidateRefuse(
			prisma,
			notificationMember.id,
			USER_ADMIN,
			'member',
			'VALIDATED',
			'member validated'
		);
		gang = (await prisma.gang.findUnique({
			where: {
				id: gang.id
			}
		})) as Gang;
		notificationMember = (await prisma.notification.findUnique({
			where: {
				id: notificationMember.id
			}
		})) as Notification;
	});

	afterAll(async () => {
		await prisma.gang.delete({
			where: {
				id: gang.id
			}
		});
		await prisma.notification.delete({
			where: {
				id: notificationGang.id
			}
		});
		await prisma.notification.delete({
			where: {
				id: notificationMember.id
			}
		});
		await prisma.user.update({
			where: {
				id: USER_NO_GANG
			},
			data: {
				gangId: null
			}
		});
		await prisma.$disconnect();
	});

	it('USER_NO_GANG has gang', async () => {
		const user = (await prisma.user.findUnique({
			where: {
				id: USER_NO_GANG
			}
		})) as User;
		expect(user.gangId).toBe(gang.id);
	});
	it('notification is not PEDING', async () => {
		expect(notificationMember.status).not.toBe('PENDING');
	});
	it('notification reviewedByUserId is USER_ADMIN', async () => {
		expect(notificationMember.reviewedByUserId).toBe(USER_ADMIN);
	});
});

describe('refuse member', () => {
	const USER_LOCAL = 'user|local';
	const USER_ADMIN = 'admin|local';
	const USER_NO_GANG = 'user|no-gang';
	let gang: Gang;
	let notificationGang: Notification;
	let notificationMember: Notification;

	beforeAll(async () => {
		const ret = await AddGang(prisma, USER_LOCAL, 'refuse member', '0', '0');
		gang = ret.data as Gang;
		notificationGang = (await prisma.notification.findFirst({
			where: {
				relatedGangId: gang.id
			}
		})) as Notification;
		await RequestNewMember(prisma, gang.id, USER_NO_GANG);
		notificationMember = (await prisma.notification.findFirst({
			where: {
				type: 'gang-member-request',
				relatedGangId: gang.id,
				addedByUserId: USER_NO_GANG
			}
		})) as Notification;
		await ValidateRefuse(
			prisma,
			notificationMember.id,
			USER_ADMIN,
			'member',
			'REFUSED',
			'member refused'
		);
		gang = (await prisma.gang.findUnique({
			where: {
				id: gang.id
			}
		})) as Gang;
		notificationMember = (await prisma.notification.findUnique({
			where: {
				id: notificationMember.id
			}
		})) as Notification;
	});

	afterAll(async () => {
		await prisma.gang.delete({
			where: {
				id: gang.id
			}
		});
		await prisma.notification.delete({
			where: {
				id: notificationGang.id
			}
		});
		await prisma.notification.delete({
			where: {
				id: notificationMember.id
			}
		});
		await prisma.user.update({
			where: {
				id: USER_NO_GANG
			},
			data: {
				gangId: null
			}
		});
		await prisma.$disconnect();
	});

	it('USER_NO_GANG has not gang', async () => {
		const user = (await prisma.user.findUnique({
			where: {
				id: USER_NO_GANG
			}
		})) as User;
		expect(user.gangId).toBe(null);
	});
	it('notification is not PEDING', async () => {
		expect(notificationMember.status).not.toBe('PENDING');
	});
	it('notification reviewedByUserId is USER_ADMIN', async () => {
		expect(notificationMember.reviewedByUserId).toBe(USER_ADMIN);
	});
});
