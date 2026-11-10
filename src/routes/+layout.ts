import { browser, dev } from '$app/env';
import { inject } from '@vercel/analytics';

// Equivalente a `injectAnalytics` de `@vercel/analytics/sveltekit`, que aún importa
// `$app/stores` (eliminado en SvelteKit 3) y rompe el arranque en cliente. Las
// páginas vistas se registran a mano en `+layout.svelte` con `$app/state`.
if (browser) {
	inject(
		{
			mode: dev ? 'development' : 'production',
			basePath: import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH,
			disableAutoTrack: true,
			framework: 'sveltekit'
		},
		import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG
	);
}
