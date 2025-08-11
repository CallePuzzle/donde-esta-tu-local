import type { Handle } from '@sveltejs/kit';
import { betterAuth } from 'better-auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

export const betterAuthHandle =
	(auth: ReturnType<typeof betterAuth>, building: boolean): Handle =>
	async ({ event, resolve }) => {
		const session = await auth.api.getSession({
			headers: event.request.headers
		});

		if (session) {
			event.locals.session = session?.session;
			event.locals.user = session?.user;
		}
		return svelteKitHandler({ event, resolve, auth, building });
	};
