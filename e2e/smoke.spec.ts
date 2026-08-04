import { test, expect } from '@playwright/test';

test('home page loads with the hero and nav', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.locator('text=Javier').first()).toBeVisible();
});

test('navigating to /projects renders project cards', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /view projects/i }).click();
  await expect(page).toHaveURL(/\/projects/);
  await expect(page.locator('.project-card').first()).toBeVisible();
});

test('chatbot page loads and shows a connection status badge', async ({ page }) => {
  await page.goto('/chatbot');
  await expect(
    page.locator('text=/Connected to MCP|Disconnected/i').first()
  ).toBeVisible();
});

test('dark mode toggle switches the html class', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const initiallyDark = await html.evaluate(el => el.classList.contains('dark'));

  await page.getByRole('button', { name: /toggle theme|cambiar tema/i }).click();

  await expect(async () => {
    const isDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(isDark).toBe(!initiallyDark);
  }).toPass();
});
