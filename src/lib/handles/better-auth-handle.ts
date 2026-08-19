import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { auth as Auth } from '$lib/server/auth';
import { isAssetPathname } from '$lib/utils/is-asset-pathname';

export const betterAuthHandle =
	(auth: typeof Auth, building: boolean): Handle =>
	async ({ event, resolve }) => {
		if (!isAssetPathname(event.url.pathname)) {
			const session = await auth.api.getSession({
				headers: event.request.headers
			});

			if (session) {
				event.locals.session = session.session;
				event.locals.user = session.user;
			}
		}
		return svelteKitHandler({ event, resolve, auth, building });
	};
