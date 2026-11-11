import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { VERCEL_APP_HOSTS, VERCEL_BLOB_HOST_PATTERN } from './src/lib/config/vercel-hosts.js';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

// `vite dev` no debe llevar CSP: rompería el cliente de HMR (scripts inline,
// websocket de recarga). `vite build`/`vite preview` sí la aplican.
const isDev = process.argv.includes('dev');

export default defineConfig({
	plugins: [
		enhancedImages() /* must come before the SvelteKit plugin */,
		paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide' }),
		tailwindcss(),
		sveltekit({
			// Consult https://svelte.dev/docs/kit/integrations
			// for more information about preprocessors
			preprocess: vitePreprocess(),
			compilerOptions: { experimental: { async: true } },
			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter({
				runtime: 'nodejs22.x',
				images: {
					sizes: [640, 828, 1200, 1920, 3840],
					formats: ['image/avif', 'image/webp'],
					minimumCacheTTL: 300,
					domains: VERCEL_APP_HOSTS
				}
			}),
			experimental: {},
			csp: isDev
				? undefined
				: {
						mode: 'nonce',
						directives: {
							'default-src': ['self'],
							'script-src': ['self'],
							'style-src': ['self', 'unsafe-inline'],
							'img-src': [
								'self',
								'data:',
								'blob:',
								'https://*.tile.openstreetmap.org',
								VERCEL_BLOB_HOST_PATTERN,
								// Avatares de usuarios migrados del antiguo OAuth de Google (B-avatar-google)
								'https://*.googleusercontent.com'
							],
							'connect-src': ['self'],
							'font-src': ['self', 'data:'],
							'worker-src': ['self', 'blob:'],
							'object-src': ['none'],
							'frame-src': ['none'],
							'frame-ancestors': ['self'],
							'base-uri': ['self'],
							'form-action': ['self'],
							'upgrade-insecure-requests': true
						}
					},
			tracing: { server: true }
		})
	],
	test: {
		environment: 'node',
		include: ['src/**/*.{test,spec}.ts']
	}
});
