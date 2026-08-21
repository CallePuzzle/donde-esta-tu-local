import { enhancedImages } from '@sveltejs/enhanced-img';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		enhancedImages(), // must come before the SvelteKit plugin
		paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide' }),
		tailwindcss(),
		sveltekit()
	],
	test: {
		environment: 'node',
		include: ['src/**/*.{test,spec}.ts']
	}
});
