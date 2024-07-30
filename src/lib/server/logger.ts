import pino from 'pino';
import { dev } from '$app/environment';

let options: pino.LoggerOptions = {};

if (true) {
	options = {
		level: 'debug',
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true
			}
		}
	};
}

export const logger = pino(options);
