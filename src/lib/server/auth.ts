import { dev } from '$app/environment';
import { Lucia } from 'lucia';
import { MongodbAdapter } from '@lucia-auth/adapter-mongodb';
import { GetConnectedMongoose } from '$lib/mongoose';
import { Auth0 } from 'arctic';
import { AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_REDIRECT_URI } from '$env/static/private';

const mongoose = await GetConnectedMongoose();

const adapter = new MongodbAdapter(
	mongoose.connection.collection('sessions'),
	mongoose.connection.collection('users')
);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			githubId: attributes.profile,
			username: attributes.email
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			profile: number;
			email: string;
		};
	}
}

export const Auth0AppDomain = 'https://callepuzzle.eu.auth0.com';

export const auth0 = new Auth0(
	Auth0AppDomain,
	AUTH0_CLIENT_ID,
	AUTH0_CLIENT_SECRET,
	AUTH0_REDIRECT_URI
);
