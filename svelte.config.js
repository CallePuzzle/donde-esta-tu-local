import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			images: {
				sizes: [640, 828, 1200, 1920, 3840],
				formats: ['image/avif', 'image/webp'],
				minimumCacheTTL: 300,
				domains: [
					'donde-esta-tu-local-git-staging-jilgues-projects.vercel.app',
					'donde-esta-tu-local.vercel.app',
					'xn--peas-hqa.montemayordepililla.cc'
				]
			}
		}),
		experimental: {
			tracing: {
				server: true
			},
			instrumentation: {
				server: true
			}
		}
	},

	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
