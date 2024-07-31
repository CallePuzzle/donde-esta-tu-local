import type { Config } from 'tailwindcss';

import daisyui from 'daisyui';

const config = {
	darkMode: 'class',

	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},

	plugins: [daisyui]
} satisfies Config;

export default config;
