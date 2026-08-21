import { defineConfig, devices } from '@playwright/test';
import { loadTestEnv } from './e2e/helpers/env';

const testEnv = loadTestEnv();
const baseURL = testEnv.BETTER_AUTH_URL ?? 'http://localhost:4174';

// Las variables de .env.test deben llegar al globalSetup (prisma migrate
// deploy) y al proceso del webServer; process.env tiene prioridad sobre los
// .env que cargan Vite/bun, así el dev server usa la BD de test y no la real.
Object.assign(process.env, testEnv);

export default defineConfig({
	testDir: './e2e',
	// BD compartida entre tests: sin paralelismo
	fullyParallel: false,
	workers: 1,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: 'list',
	globalSetup: './e2e/global-setup.ts',
	use: {
		baseURL,
		trace: 'retain-on-failure',
		// La app registra un service worker que interferiría con las peticiones
		serviceWorkers: 'block'
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'bun run dev -- --port 4174 --strictPort',
		// La URL de readiness no puede ser `/`: Playwright arranca el servidor
		// ANTES del globalSetup (prisma migrate deploy), y con la BD recién
		// creada la home devuelve 500 hasta que se aplican las migraciones,
		// así que el readiness nunca se cumpliría. robots.txt es estático.
		url: `${baseURL}/robots.txt`,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		env: testEnv
	}
});
