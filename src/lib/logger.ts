import { browser, dev } from '$app/environment';
import pino, { type LoggerOptions } from 'pino';
import { get, readable } from 'svelte/store';

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

const pinoLogger = readable(pino(options));

export const logger = get(pinoLogger);
