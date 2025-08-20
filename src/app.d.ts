// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session?: import('@prisma/client').Session;
			user?: import('@prisma/client').User;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
