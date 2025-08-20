import { createAuthClient } from 'better-auth/svelte';
import { magicLinkClient, adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	plugins: [magicLinkClient(), adminClient()]
}) as any;

export const { signIn, signUp, useSession } = authClient;

export const session = useSession();

export type AuthClient = typeof authClient;
export type Session = typeof authClient.$Infer.Session;
