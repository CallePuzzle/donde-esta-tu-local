import { browser, dev } from '$app/environment';
import pino, { type LoggerOptions } from 'pino';

// Q16: medido el coste real del build de navegador de pino que arrastran
// ButtonRequest.svelte, show-my-position.ts y gang/[slug]/+page.svelte: el
// chunk que lo contiene pesa ~12 KB sin comprimir / ~3.4 KB con gzip (bun run
// only-build + inspección de .svelte-kit/output/client). No se justifica un
// wrapper mínimo para ahorrar eso; se deja pino tal cual.

const level = dev ? 'debug' : 'info';

// Base configuration for all environments
const baseOptions: LoggerOptions = {
	level,
	timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`
};

// Browser-specific base options
const browserOptions: LoggerOptions = {
	...baseOptions,
	browser: { asObject: false },
	base: undefined // Removes "pid" and "hostname" from logs
};

// Development transport configuration (shared)
const devTransport = {
	target: 'pino-pretty',
	options: {
		colorize: true,
		levelFirst: true,
		translateTime: true
	}
};

// Final options based on environment
const options: LoggerOptions = dev
	? { ...(browser ? browserOptions : baseOptions), transport: devTransport }
	: browser
		? browserOptions
		: baseOptions;

export const logger = pino(options);
