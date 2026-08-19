import { error } from '@sveltejs/kit';
import { z } from 'zod/v4';
import prisma from '$lib/server/db';
import { m } from '$lib/paraglide/messages.js';
import { isAdmin } from '$lib/utils/roles';

export { isAdmin };

// El usuario de sesión es el que define better-auth (App.Locals, derivado de
// auth.$Infer.Session), no el modelo crudo de @prisma/client
type SessionUser = NonNullable<App.Locals['user']>;

// Esquema de validación de los parámetros de los endpoints de miembros
export const memberRequestSchema = z.object({
	userId: z.string().min(1),
	gangId: z.coerce.number().int().positive()
});

// Comprueba si el usuario es admin o miembro validado de la peña indicada
export async function canManageGangMembers(
	user: App.Locals['user'],
	gangId: number
): Promise<boolean> {
	if (!user) return false;
	if (isAdmin(user)) return true;

	const member = await prisma.user.findUnique({
		where: {
			id: user.id
		},
		select: {
			gangId: true,
			membershipGangStatus: true
		}
	});

	return !!member && member.gangId === gangId && member.membershipGangStatus === 'VALIDATED';
}

// Exige que haya un usuario autenticado; devuelve 401 en caso contrario
export function requireUser(locals: App.Locals): SessionUser {
	if (!locals.user) {
		throw error(401, m.error_user_not_logged_in());
	}
	return locals.user;
}

// Exige que el usuario autenticado sea admin o system; devuelve 403 en caso contrario
export function requireAdmin(locals: App.Locals): SessionUser {
	const user = requireUser(locals);
	if (!isAdmin(user)) {
		throw error(403, m.error_forbidden());
	}
	return user;
}

// Exige que el usuario autenticado sea admin o miembro validado de la peña; 403 en caso contrario
export async function requireValidatedMember(
	locals: App.Locals,
	gangId: number
): Promise<SessionUser> {
	const user = requireUser(locals);
	if (!(await canManageGangMembers(user, gangId))) {
		throw error(403, m.error_forbidden());
	}
	return user;
}
