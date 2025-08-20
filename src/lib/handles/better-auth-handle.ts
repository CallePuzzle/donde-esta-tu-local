import type { Handle } from '@sveltejs/kit';
import { betterAuth } from 'better-auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Session, User } from '@prisma/client';

export const betterAuthHandle =
	(auth: ReturnType<typeof betterAuth>, building: boolean): Handle =>
	async ({ event, resolve }) => {
		const session = await auth.api.getSession({
			headers: event.request.headers
		});

		if (session) {
			event.locals.session = session?.session as Session;
			event.locals.user = session?.user as User;
		}
		return svelteKitHandler({ event, resolve, auth, building });
	};
