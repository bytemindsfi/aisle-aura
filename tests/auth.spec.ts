import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show sign in page', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('signin-button')).toBeVisible();
  });

  test('should show social login buttons', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByTestId('google-signin-button')).toBeVisible();
    await expect(page.getByTestId('apple-signin-button')).toBeVisible();
  });

  test('should navigate to sign up', async ({ page }) => {
    await page.goto('/signin');
    await page.getByRole('link', { name: 'Sign up for free' }).click();
    await expect(page).toHaveURL('/signup');
  });

  test('should show forgot password link', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByText('Forgot password?')).toBeVisible();
  });
});
