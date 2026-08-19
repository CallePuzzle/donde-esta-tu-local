import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { securityHeadersHandle } from '$lib/handles/security-headers-handle';
import { betterAuthHandle } from '$lib/handles/better-auth-handle';
import { paraglideHandle } from '$lib/handles/paraglide-handle';
import { loggingHandle } from '$lib/handles/logging-handle';
import { auth } from '$lib/server/auth.js';
import { building } from '$app/environment';

export const handle: Handle = sequence(
	securityHeadersHandle,
	loggingHandle,
	betterAuthHandle(auth, building),
	paraglideHandle
);
