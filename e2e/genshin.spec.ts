import { readFileSync } from 'node:fs';
import { test, expect, Page } from '@playwright/test';

// Hermetic: the backend and Enka's image CDN are intercepted, ids come from the real roster.
const roster: { id: number; key: string }[] = JSON.parse(readFileSync('public/genshin/roster.json', 'utf8')).characters;
const id = (key: string) => roster.find(c => c.key === key)!.id;
const [FURINA, NAHIDA, XILONEN, BENNETT, VESNA, VODYANITSA, ESCOFFIER] =
  ['furina', 'nahida', 'xilonen', 'bennett', 'vesna', 'vodyanitsa', 'escoffier'].map(id);

const meta = {
  patch: '7.1', model: 'test', fetchedAt: Math.floor(Date.now() / 1000), cached: false, banners: [VESNA, VODYANITSA],
  sources: [{ title: 'genshin.gg/tier-list', url: 'https://genshin.gg/tier-list/' }],
  characters: [
    { id: VESNA, role: 'Main DPS', tier: 'S' }, { id: VODYANITSA, role: 'Support', tier: 'S' },
    { id: FURINA, role: 'Sub DPS', tier: 'S' }, { id: NAHIDA, role: 'Support', tier: 'S' },
    { id: BENNETT, role: 'Healer', tier: 'S' }, { id: XILONEN, role: 'Support', tier: 'A' },
  ],
  teams: [{
    name: 'Vesna Swirl', reaction: 'Swirl', tier: 'S', note: 'Equipo de prueba.',
    members: [{ id: VESNA, role: 'Main DPS' }, { id: FURINA, role: 'Sub DPS' }, { id: NAHIDA, role: 'Support' }, { id: BENNETT, role: 'Healer' }],
  }, {
    name: 'Vodyanitsa Hydro', reaction: 'Hydro', tier: 'A', note: '',
    members: [{ id: VESNA, role: 'Main DPS' }, { id: VODYANITSA, role: 'Support' }, { id: FURINA, role: 'Sub DPS' }, { id: BENNETT, role: 'Healer' }],
  }],
};

async function mockBackend(page: Page, opts: { showcase?: boolean } = {}) {
  await page.route('https://enka.network/**', r => r.abort());
  await page.route('**/genshin/profile/*', r => r.fulfill({ json: {
    uid: '618285856', nickname: 'Tester', adventureRank: 60, ttl: 60, showcaseVisible: opts.showcase ?? true,
    characters: opts.showcase === false ? [] : [{ id: FURINA, level: 90, cons: 2 }, { id: NAHIDA, level: 80, cons: 0 }],
  } }));
  await page.route('**/genshin/meta**', r => r.fulfill({ json: meta }));
}

test.describe('genshin guide', () => {
  test('reachable from the landing accordion', async ({ page }) => {
    await page.goto('/guides');
    await page.getByRole('button', { name: /Genshin Impact/ }).click();
    await page.getByRole('link', { name: /Mi cuenta/ }).click();
    await expect(page).toHaveURL(/\/guides\/genshin-impact\/mi-cuenta$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Mi cuenta');
  });

  test('imports a UID, remembers it after reload, and lets you mark characters by hand', async ({ page }) => {
    await mockBackend(page);
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await expect(page.getByRole('button', { name: 'Furina (no lo tienes)' })).toBeVisible();

    await page.getByLabel('UID de Genshin Impact').fill('618285856');
    await page.getByRole('button', { name: 'Importar' }).click();
    await expect(page.getByText(/Se importaron 2 personajes/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Furina (lo tienes)' })).toContainText('Nv. 90 · C2');

    await page.getByRole('button', { name: 'Bennett (no lo tienes)' }).click();
    await expect(page.getByRole('button', { name: 'Bennett (lo tienes)' })).toBeVisible();
    await expect(page.getByText('(3 marcados)')).toBeVisible();

    await page.reload(); // survives in localStorage
    await expect(page.getByLabel('UID de Genshin Impact')).toHaveValue('618285856');
    await expect(page.getByRole('button', { name: 'Furina (lo tienes)' })).toBeVisible();
    await expect(page.getByText('(3 marcados)')).toBeVisible();
  });

  test('warns when the showcase is hidden instead of silently importing nothing', async ({ page }) => {
    await mockBackend(page, { showcase: false });
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByLabel('UID de Genshin Impact').fill('618285856');
    await page.getByRole('button', { name: 'Importar' }).click();
    await expect(page.getByText(/vitrina está oculta o vacía/)).toBeVisible();
  });

  test('rejects an invalid UID before calling the backend', async ({ page }) => {
    let called = false;
    await page.route('**/genshin/profile/*', r => { called = true; r.abort(); });
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByLabel('UID de Genshin Impact').fill('123');
    await expect(page.getByRole('button', { name: 'Importar' })).toBeDisabled();
    expect(called).toBe(false);
  });

  test('shows meta teams with owned, substituted and missing members, and ranks pulls', async ({ page }) => {
    await mockBackend(page);
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByLabel('UID de Genshin Impact').fill('618285856');
    await page.getByRole('button', { name: 'Importar' }).click();
    await expect(page.getByText(/Se importaron/)).toBeVisible();

    await page.getByRole('tab', { name: 'Mejores equipos' }).click();
    await expect(page.getByText(/Meta del parche 7.1/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'genshin.gg/tier-list' })).toBeVisible();
    const team = page.getByRole('listitem').filter({ hasText: 'Vesna Swirl' });
    await expect(team).toContainText('2/4 los tienes'); // Furina + Nahida
    await expect(team).toContainText('te falta');       // Vesna and Bennett

    await page.getByRole('tab', { name: '¿A quién sacar?' }).click();
    await expect(page.getByRole('heading', { name: 'En banner ahora' })).toBeVisible();
    await page.getByRole('button', { name: /Vesna/ }).first().click();
    await expect(page.getByRole('heading', { name: /Equipos del meta con Vesna/ })).toBeVisible();
    await expect(page.getByText(/de [\d.]+ a [\d.]+\)/)).toBeVisible();
  });

  test('shows a clear error and a retry when the meta cannot be loaded', async ({ page }) => {
    await page.route('https://enka.network/**', r => r.abort());
    await page.route('**/genshin/meta**', r => r.fulfill({ status: 502, json: { error: 'meta_unavailable', message: 'No se pudo obtener el meta ahora mismo.' } }));
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('tab', { name: 'Mejores equipos' }).click();
    await expect(page.getByText('No se pudo obtener el meta ahora mismo.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
  });

  test('chat sends the account + engine numbers as context and renders the streamed answer', async ({ page }) => {
    await mockBackend(page);
    let sent: { messages: { role: string; content: string }[]; context: string } | null = null;
    await page.route('**/genshin/chat', async r => {
      sent = r.request().postDataJSON();
      const sse = (d: unknown) => `data: ${JSON.stringify(d)}\n\n`;
      await r.fulfill({ status: 200, contentType: 'text/event-stream',
        body: sse({ text: 'Te recomiendo a **Vesna** ' }) + sse({ text: 'porque desbloquea un equipo.' }) + 'data: [DONE]\n\n' });
    });
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByLabel('UID de Genshin Impact').fill('618285856');
    await page.getByRole('button', { name: 'Importar' }).click();
    await expect(page.getByText(/Se importaron/)).toBeVisible();

    await page.getByRole('tab', { name: 'Chat con IA' }).click();
    await page.getByLabel('Tu pregunta').fill('¿Vesna o Vodyanitsa?');
    await page.getByRole('button', { name: 'Enviar' }).click();

    const log = page.getByRole('log', { name: 'Conversación' });
    await expect(log).toContainText('Te recomiendo a Vesna porque desbloquea un equipo.');
    await expect(log.locator('strong')).toHaveText('Vesna'); // bold rendered as an element, not raw asterisks
    expect(sent!.messages.at(-1)).toEqual({ role: 'user', content: '¿Vesna o Vodyanitsa?' });
    expect(sent!.context).toContain('Furina (nv 90, C2)');
    expect(sent!.context).toMatch(/Vesna \[en banner\]: .*%/);
  });

  test('chat shows the error and leaves no empty bubble when the backend fails', async ({ page }) => {
    await mockBackend(page);
    await page.route('**/genshin/chat', r => r.fulfill({ status: 429, json: { error: 'rate_limited', message: 'Demasiadas peticiones, inténtalo más tarde.' } }));
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('tab', { name: 'Chat con IA' }).click();
    await page.getByRole('button', { name: /¿Saco a|¿A quién/ }).first().click();
    await expect(page.getByRole('alert')).toContainText('Demasiadas peticiones');
    await expect(page.locator('.msg-user')).toHaveCount(1);
    await expect(page.locator('.msg:not(.msg-user)')).toHaveCount(0); // no empty assistant bubble
  });

  test('chat renders model output as text, never as HTML', async ({ page }) => {
    await mockBackend(page);
    await page.route('**/genshin/chat', r => r.fulfill({ status: 200, contentType: 'text/event-stream',
      body: `data: ${JSON.stringify({ text: '<img src=x onerror="window.__xss=1"> hola' })}\n\ndata: [DONE]\n\n` }));
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('tab', { name: 'Chat con IA' }).click();
    await page.getByLabel('Tu pregunta').fill('hola');
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByRole('log')).toContainText('<img src=x');
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  });
});
