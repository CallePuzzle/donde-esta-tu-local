import { expect, test } from '@playwright/test';

test('navbar links', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Ver mapa' }).click();
	// When you click on #nav_details summary, the #nav_details should have a open attribute
	await page.locator('summary').click();
	expect(await page.$eval('#nav_details', (el) => el.hasAttribute('open'))).toBeTruthy();
});
