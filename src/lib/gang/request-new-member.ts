import type { PrismaClient, User } from '@prisma/client';
import {
	NewNotificationForAdmins,
	NewNotificationForUsers,
	type Payload,
	type NotificationExtraData
} from '$lib/notification/notifications';

export async function RequestNewMember(prisma: PrismaClient, gangId: number, userId: string) {
	const user = await prisma.user.findUnique({
		where: {
			id: userId as string
		}
	});
	const gang = await prisma.gang.findUnique({
		where: {
			id: gangId
		},
		include: {
			members: true
		}
	});

	const payload: Payload = {
		title: 'Nueva solicitud de miembro',
		body: `${user?.name} ha solicitado unirse a la peña ${gang?.name}`
	};

	const extraData: NotificationExtraData = {
		type: 'gang-member-request',
		status: 'PENDING',
		relatedGangId: gang?.id,
		addedByUserId: user?.id
	};

	if (gang?.members.length === 0) {
		if (!(await NewNotificationForAdmins(payload, extraData, prisma))) {
			return { success: false, error: 'Error sending notification' };
		}
	} else {
		if (!(await NewNotificationForUsers(payload, extraData, gang?.members as User[], prisma))) {
			return { success: false, error: 'Error sending notification' };
		}
	}

	return {
		success: true,
		data: {
			user: user,
			gang: gang
		},
		type: 'requestNewMember'
	};
}
