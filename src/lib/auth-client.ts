import { createCallepuzzleAuthClient } from '@callepuzzle/auth/client';
import { emailOTPClient, adminClient } from 'better-auth/client/plugins';

export const authClient = createCallepuzzleAuthClient({
	plugins: [emailOTPClient(), adminClient()]
});

export type AuthClient = typeof authClient;
