import { requireAdmin } from '#lib/server/membership.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = requireAdmin(locals);

	return {
		user
	};
};
