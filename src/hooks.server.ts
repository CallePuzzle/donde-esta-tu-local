import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { securityHeadersHandle } from '#lib/handles/security-headers-handle.ts';
import { skipAssets } from '#lib/handles/skip-assets-handle.ts';
import { betterAuthHandle } from '@callepuzzle/auth/hooks';
import { paraglideHandle } from '#lib/handles/paraglide-handle.ts';
import { loggingHandle } from '#lib/handles/logging-handle.ts';
import { auth } from '#lib/server/auth.js';
import { building } from '$app/env';

export const handle: Handle = sequence(
	securityHeadersHandle,
	loggingHandle,
	skipAssets(betterAuthHandle(auth, building)),
	paraglideHandle
);
