import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { securityHeadersHandle } from '$lib/handles/security-headers-handle';
import { skipAssets } from '$lib/handles/skip-assets-handle';
import { betterAuthHandle } from '@callepuzzle/auth/hooks';
import { paraglideHandle } from '$lib/handles/paraglide-handle';
import { loggingHandle } from '$lib/handles/logging-handle';
import { auth } from '$lib/server/auth.js';
import { building } from '$app/environment';

export const handle: Handle = sequence(
	securityHeadersHandle,
	loggingHandle,
	skipAssets(betterAuthHandle(auth, building)),
	paraglideHandle
);
