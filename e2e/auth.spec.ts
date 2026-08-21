import { test, expect } from '@playwright/test';
import { loginViaUi, seedSession, waitForHydration } from './helpers/auth';
import { createUser, resetDb } from './helpers/seed';

test.beforeEach(async () => {
	await resetDb();
});

test('login por UI con OTP leído de la BD y logout desde el perfil', async ({ page }) => {
	const email = 'login-e2e@e2e.test';

	await loginViaUi(page, email);

	// Tras el login, el perfil muestra el email del usuario
	await page.goto('/profile');
	await waitForHydration(page);
	await expect(page.getByText(email)).toBeVisible();

	await page.getByRole('button', { name: 'Cerrar sesión' }).click();

	// De vuelta anónimo: el navbar muestra de nuevo "Iniciar sesión"
	await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
});

test('sin sesión, /gang/add y /admin devuelven 401', async ({ page }) => {
	const gangAdd = await page.goto('/gang/add');
	expect(gangAdd?.status()).toBe(401);

	const admin = await page.goto('/admin');
	expect(admin?.status()).toBe(401);
});

test('un usuario sin rol admin recibe 403 en /admin', async ({ page }) => {
	const user = await createUser({});
	await seedSession(page, user);

	const response = await page.goto('/admin');
	expect(response?.status()).toBe(403);
});
