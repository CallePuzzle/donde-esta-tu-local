// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session?: import('$lib/server/auth').auth.$Infer.Session['session'];
			user?: import('$lib/server/auth').auth.$Infer.Session['user'];
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
