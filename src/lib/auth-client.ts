import { createAuthClient } from 'better-auth/svelte';
import { emailOTPClient, adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	plugins: [emailOTPClient(), adminClient()]
});

export type AuthClient = typeof authClient;
