import { test, expect } from '@playwright/test';

test.describe('Yaxa Smoke Tests', () => {
	test('homepage loads and renders primary hero elements', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/Yaxa/i);

		const heading = page.getByRole('heading', { level: 1 });
		await expect(heading).toBeVisible();

		// Check navigation links
		const docsLink = page.getByRole('link', { name: /docs|documentation/i }).first();
		await expect(docsLink).toBeVisible();
	});

	test('navigates to /docs showcase cleanly', async ({ page }) => {
		await page.goto('/docs');
		await expect(page).toHaveURL(/\/docs/);

		// Verify main content container is present
		const main = page.locator('main');
		await expect(main).toBeVisible();
	});

	test('navigates to /saas suite showcase cleanly', async ({ page }) => {
		await page.goto('/saas');
		await expect(page).toHaveURL(/\/saas/);

		// Check SaaS heading
		const saasHeading = page.getByRole('heading', { level: 1 });
		await expect(saasHeading).toBeVisible();
	});

	test('navigates to /admin dashboard cleanly', async ({ page }) => {
		await page.goto('/admin');
		await expect(page).toHaveURL(/\/admin/);

		// Check Admin Studio header
		const adminHeading = page.getByRole('heading', { name: /Database Studio|Admin/i });
		await expect(adminHeading).toBeVisible();
	});
});
