import { defineEnvVars } from '@sveltejs/kit/env';

// Variables de entorno de SvelteKit 3 (`$app/env/private`). Las dinámicas se leen
// al arrancar y caen a cadena vacía si faltan, igual que el antiguo
// `$env/dynamic/private`: quien las usa ya comprueba el valor vacío (p.ej. `db.ts`
// lanza un error claro sin `DATABASE_URL`) y así el build no las exige. Las de
// SMTP siguen siendo estáticas (se incrustan en el build), como con
// `$env/static/private`.
export const variables = defineEnvVars({
	VAPID_PUBLIC_KEY: { schema: (input) => input ?? '' },
	CRON_SECRET: { schema: (input) => input ?? '' },
	SMTP_HOST: { static: true },
	SMPT_AUTH_USER: { static: true },
	SMPT_AUTH_PASS: { static: true },
	SMPT_SENDER: { static: true },
	DATABASE_URL: { schema: (input) => input ?? '' },
	VAPID_SUBJECT: { schema: (input) => input ?? '' },
	VAPID_PRIVATE_KEY: { schema: (input) => input ?? '' }
});
