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

test('loading /projects directly reveals the cards (not stuck at opacity 0)', async ({ page }) => {
  // Regression test: ProjectsComponent used to have no IntersectionObserver
  // of its own for its `.reveal` elements — it relied on one HomeComponent
  // set up, so the whole page stayed at opacity:0 forever on a direct load
  // or a hard navigation. `toBeVisible()` alone doesn't catch this since
  // Playwright doesn't treat opacity:0 as invisible, hence the explicit
  // opacity check below.
  await page.goto('/projects');
  const firstCardWrapper = page.locator('.reveal').filter({ has: page.locator('.project-card') }).first();
  await expect(firstCardWrapper).toHaveClass(/visible/);
  await expect(firstCardWrapper).toHaveCSS('opacity', '1');
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

test.describe('guides landing', () => {
  test('landing -> expand series -> open game -> breadcrumb returns expanded', async ({ page }) => {
    await page.goto('/guides');
    await page.getByRole('button', { name: /Kingdom Hearts/ }).click();
    await page.getByRole('link', { name: /Dream Drop Distance/ }).click();

    await expect(page).toHaveURL(/\/guides\/kingdom-hearts\/dream-drop-distance$/);
    await expect(page.locator('iframe')).toHaveAttribute('src', /dream-drop-distance\.html/);

    await page.getByRole('navigation', { name: /breadcrumb|ruta|caminho/i }).getByRole('link', { name: 'Kingdom Hearts' }).click();
    await expect(page).toHaveURL(/\/guides\?open=kingdom-hearts$/);
    await expect(page.getByRole('link', { name: /Birth by Sleep/ })).toBeVisible();
  });

  test('old /guides/kingdom-hearts URL redirects to the expanded series', async ({ page }) => {
    await page.goto('/guides/kingdom-hearts');
    await expect(page).toHaveURL(/\/guides\?open=kingdom-hearts$/);
    await expect(page.getByRole('link', { name: /Dream Drop Distance/ })).toBeVisible();
  });

  test('unknown guide shows not-found', async ({ page }) => {
    await page.goto('/guides/kingdom-hearts/nope');
    await expect(page.getByRole('heading', { name: /no encontrada|not found|não encontrado/i })).toBeVisible();
  });
});
