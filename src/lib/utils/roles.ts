const ADMIN_ROLES = ['admin', 'system'];

// Compartido entre cliente y servidor: acepta cualquier objeto con un `role`,
// sin acoplarse al User del cliente Prisma ni al tipo inferido de better-auth.
export function isAdmin(user: { role?: string | null } | null | undefined): boolean {
	return !!user?.role && ADMIN_ROLES.includes(user.role);
}
