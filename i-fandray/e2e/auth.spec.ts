import { test, expect, Page } from '@playwright/test';

test.describe('Authentication', () => {
  test('should load login page', async ({ page }: { page: Page }) => {
    await page.goto('/auth/login');

    // Check if the logo is visible
    await expect(page.locator('img[alt="i-fandray Logo"]')).toBeVisible();

    // Check if the app name is visible
    await expect(page.getByText('i-fandray')).toBeVisible();

    // Check if login form elements are present
    await expect(page.getByPlaceholder('john@example.com')).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();

    // Check if login button is present
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
  });

  test('should navigate to register page', async ({ page }: { page: Page }) => {
    await page.goto('/auth/login');

    // Click on register link
    await page.getByText(/create account|sign up/i).click();

    // Should navigate to register page
    await expect(page).toHaveURL(/.*register/);
  });

  test('should show validation errors for empty form', async ({ page }: { page: Page }) => {
    await page.goto('/auth/login');

    // Click login button without filling form
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Should show some validation or stay on page
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Navigation', () => {
  test('should load home page', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // Check if the page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have working header navigation', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // Check if header logo is clickable
    const logo = page.locator('img[alt="i-fandray Logo"]').first();
    await expect(logo).toBeVisible();

    // Click on logo should navigate to feed or home
    await logo.click();
    // Should not have errors
    await expect(page.locator('body')).toBeVisible();
  });
});