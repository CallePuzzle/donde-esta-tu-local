import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Ver mapa' }).click();
	const modal = await page.locator('#wellcomeModal');
	// modal has not a open property
	expect(modal).not.toHaveAttribute('open');
	await page.getByRole('link', { name: 'Montemayor de Pililla' }).click();
	expect(modal).toBeVisible();
	expect(modal).toHaveAttribute('open');
});
