import { createHmac, randomUUID } from 'node:crypto';
import { prisma } from './db';
import { loadTestEnv } from './env';

import type { Page } from '@playwright/test';
import type { User } from '$lib/generated/prisma/client';

// Nombre por defecto de la cookie de sesión de better-auth (cookiePrefix
// "better-auth" + "session_token"); la app no lo personaliza.
const SESSION_COOKIE_NAME = 'better-auth.session_token';

// better-auth firma la cookie de sesión: valor = `${token}.${firma}` con la
// firma = HMAC-SHA256 del token en base64 usando BETTER_AUTH_SECRET
// (ver signCookieValue en better-call/dist/crypto.mjs).
function signSessionToken(token: string): string {
	const secret = loadTestEnv().BETTER_AUTH_SECRET;
	const signature = createHmac('sha256', secret).update(token).digest('base64');
	return `${token}.${signature}`;
}

// Inserta una sesión directamente en BD y fija la cookie firmada en el
// contexto del navegador: evita el flujo OTP (rate-limited) en todos los
// tests salvo el de login.
export async function seedSession(page: Page, user: User): Promise<void> {
	const token = randomUUID();
	await prisma.session.create({
		data: {
			id: randomUUID(),
			token,
			userId: user.id,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			createdAt: new Date(),
			updatedAt: new Date()
		}
	});

	await page.context().addCookies([
		{
			name: SESSION_COOKIE_NAME,
			value: signSessionToken(token),
			url: loadTestEnv().BETTER_AUTH_URL
		}
	]);
}

// Espera a que el JS de SvelteKit haya cargado e hidratado la página: sin
// esto, un click inmediato tras goto() puede caer antes de que los
// manejadores estén registrados y no hacer nada.
export async function waitForHydration(page: Page): Promise<void> {
	await page.waitForLoadState('networkidle');
}

// Desactiva el tour guiado para el resto de navegaciones de esta página.
// El tour invitado arranca en "/" para un perfil nuevo y su backdrop
// (TourGuideJS pone `tg-no-interaction` en <body>) bloquea los clicks de
// Playwright sobre el botón de login: la carrera entre la hidratación del
// tour y el primer click hacía el test no determinista. Las claves son las
// de GUEST_STORAGE_KEY/MEMBER_STORAGE_KEY en src/lib/utils/tour.ts.
export function disableOnboardingTour(page: Page): void {
	page.addInitScript(() => {
		for (const key of ['onboarding-tour-guest-v1', 'onboarding-tour-member-v1']) {
			localStorage.setItem(key, JSON.stringify({ activeStep: 0, finished: true }));
		}
	});
}

// Flujo de login real por UI: el OTP no se envía por email en desarrollo,
// queda en la tabla verification (identifier "sign-in-otp-<email>",
// value "<otp>:<intentos>").
export async function loginViaUi(page: Page, email: string): Promise<void> {
	disableOnboardingTour(page);
	await page.goto('/');
	// El mapa se inicializa en onMount: si existe, la página ya está hidratada
	await page.locator('#map.leaflet-container').waitFor();

	const dialog = page.locator('dialog[open]');

	await page.getByRole('button', { name: 'Iniciar sesión' }).click();
	await dialog.locator('input[name="email"]').fill(email);
	await dialog.getByRole('button', { name: 'Iniciar sesión' }).click();

	const otp = await readOtp(email);

	// En el paso 2 el único input del diálogo es el del PinInput
	await dialog.locator('input').pressSequentially(otp);

	// El sign-in va por fetch en segundo plano: sin esta espera, un goto()
	// inmediato abortaría la petición y la cookie de sesión no se fijaría
	await page.waitForResponse(
		(response) => response.url().includes('/api/auth/sign-in/email-otp') && response.ok()
	);
	// invalidateAll() tras el login: el navbar sustituye el botón "Iniciar
	// sesión" por el menú de usuario (dropdown), que contiene el enlace al
	// perfil. El dropdown está cerrado (display:none hasta el foco), así que se
	// espera a que el enlace esté en el DOM (attached) y no a que sea visible.
	await page.locator('a[href="/profile"]').first().waitFor({ state: 'attached' });
}

// Lee el OTP de la tabla verification con polling (hasta 10 s)
async function readOtp(email: string): Promise<string> {
	const identifier = `sign-in-otp-${email}`;
	const deadline = Date.now() + 10_000;

	while (Date.now() < deadline) {
		const verification = await prisma.verification.findFirst({
			where: { identifier },
			orderBy: { createdAt: 'desc' }
		});
		const otp = verification?.value.split(':')[0];
		if (otp) return otp;
		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	throw new Error(`No se encontró el OTP de ${email} en la tabla verification`);
}
