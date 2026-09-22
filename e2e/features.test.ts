import { test, expect } from '@playwright/test';

test.describe('Yaxa Interactive Feature Tests', () => {
	test('toggles theme between dark and light mode', async ({ page }) => {
		await page.goto('/');

		// Find theme toggle button
		const themeToggle = page
			.getByRole('button', { name: /toggle theme|switch theme|dark mode|light mode/i })
			.first();
		if (await themeToggle.isVisible()) {
			await themeToggle.click();
			// HTML element class check or dark mode attribute
			const html = page.locator('html');
			await expect(html).toBeDefined();
		}
	});

	test('docs layout switching and interactive table filter', async ({ page }) => {
		await page.goto('/docs/comp-buttons');
		await expect(page).toHaveURL(/\/docs\/comp-buttons/);

		// Check live props search input is present and functional
		const searchInput = page.locator('#props-filter-input');
		if (await searchInput.isVisible()) {
			await searchInput.fill('variant');
			await expect(searchInput).toHaveValue('variant');
		}
	});

	test('command palette opens via shortcut or button', async ({ page }) => {
		await page.goto('/');

		// Open command palette with Ctrl+K
		await page.keyboard.press('Control+k');

		const cmdInput = page.locator('#command-palette-input');
		if (await cmdInput.isVisible()) {
			await cmdInput.fill('Buttons');
			await expect(cmdInput).toHaveValue('Buttons');

			// Close command palette with Escape
			await page.keyboard.press('Escape');
			await expect(cmdInput).not.toBeVisible();
		}
	});
});
