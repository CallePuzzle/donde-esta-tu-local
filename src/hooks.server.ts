import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { betterAuthHandle } from '$lib/better-auth-handle';
import { paraglideHandle } from '$lib/paraglide-handle';
import { auth } from '$lib/server/auth.js';
import { building } from '$app/environment';

export const handle: Handle = sequence(betterAuthHandle(auth, building), paraglideHandle);
