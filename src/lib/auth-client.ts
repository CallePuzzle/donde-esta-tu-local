import { createAuthClient } from 'better-auth/svelte';
import { emailOTPClient, adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	plugins: [emailOTPClient(), adminClient()]
	// eslint-disable-next-line
}) as any;

export const { signIn, signUp, useSession } = authClient;

export const session = useSession();

export type AuthClient = typeof authClient;
export type Session = typeof authClient.$Infer.Session;
