import { browser, dev } from '$app/environment';

import pino, { type LoggerOptions } from 'pino';
import { get, readable } from 'svelte/store';

let options: LoggerOptions = {};

const level = dev ? 'debug' : 'info';

if (browser) {
	options = {
		browser: { asObject: false },
		level: level,
		base: undefined, // Removes "pid" and "hostname" from logs.
		timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true, // show colors in log
				levelFirst: true, // show levels first in log
				translateTime: true // translate the time in human readable format
			}
		}
	};
} else {
	options = {
		level: level,
		timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true, // show colors in log
				levelFirst: true, // show levels first in log
				translateTime: true // translate the time in human readable format
			}
		}
	};
}

const pinoLogger = readable(pino(options));

export const logger = get(pinoLogger);
