import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Verificar que el usuario esté autenticado
	if (!locals.user) {
		throw redirect(303, '/');
	}

	// Verificar que el usuario tenga rol de admin
	if (locals.user.role !== 'admin' && locals.user.role !== 'system') {
		throw redirect(303, '/');
	}

	return {
		user: locals.user
	};
};
