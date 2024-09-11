import { type User } from '@prisma/client';

const rangeOfPermissions = {
	USER: 1,
	ADMIN: 2
	//OWNER: 3,
};

function HasPermission(user: User | null, requiredPermission: string): boolean {
	if (!user) {
		return false;
	}
	if (!user?.role) {
		return false;
	}
	return rangeOfPermissions[user.role] >= rangeOfPermissions[requiredPermission];
}

export { HasPermission };
