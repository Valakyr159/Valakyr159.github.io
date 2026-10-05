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

const META_KEY = 'genshin.meta.v1';
const seedMeta = (page: Page, value: unknown) =>
  page.addInitScript(([k, v]) => localStorage.setItem(k as string, v as string), [META_KEY, JSON.stringify(value)]);
const ago = (hours: number) => Math.floor(Date.now() / 1000 - hours * 3600);

async function mockBackend(page: Page, opts: { showcase?: boolean } = {}) {
  await page.route('https://enka.network/**', r => r.abort());
  await page.route('**/genshin/profile/*', r => r.fulfill({ json: {
    uid: '618285856', nickname: 'Tester', adventureRank: 60, ttl: 60, showcaseVisible: opts.showcase ?? true,
    characters: opts.showcase === false ? [] : [{ id: FURINA, level: 90, cons: 2 }, { id: NAHIDA, level: 80, cons: 0 }],
  } }));
  await page.route('**/genshin/meta**', r => r.fulfill({ json: { status: 'fresh', meta } }));
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
    await expect(page.getByRole('heading', { name: 'Banners y novedades' })).toBeVisible();
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

  test('no AI-related request at all while the browser copy of the meta is fresh, and there is no refresh button', async ({ page }) => {
    await mockBackend(page);
    await seedMeta(page, { ...meta, fetchedAt: ago(1) });
    const metaRequests: string[] = [];
    page.on('request', r => r.url().includes('/genshin/meta') && metaRequests.push(r.method()));
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('tab', { name: 'Mejores equipos' }).click();
    await page.getByRole('tab', { name: '¿A quién sacar?' }).click();
    await page.getByRole('button', { name: /Vesna/ }).first().click(); // planner interaction
    await page.getByRole('tab', { name: 'Chat con IA' }).click();
    await expect(page.getByText(/Meta del parche 7.1/)).toBeVisible();
    expect(metaRequests).toEqual([]);
    await expect(page.getByRole('button', { name: /Actualizar meta/ })).toHaveCount(0);
  });

  test('marking characters and using the planner never hits the backend', async ({ page }) => {
    await mockBackend(page);
    await seedMeta(page, { ...meta, fetchedAt: ago(1) });
    const calls: string[] = [];
    page.on('request', r => /\/genshin\/(meta|chat|profile)/.test(r.url()) && calls.push(r.url()));
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('button', { name: 'Furina (no lo tienes)' }).click();
    await page.getByRole('button', { name: 'Nahida (no lo tienes)' }).click();
    await page.getByRole('tab', { name: '¿A quién sacar?' }).click();
    await page.getByRole('button', { name: /Vesna/ }).first().click();
    await page.getByLabel('Comparar otro personaje').selectOption({ label: 'Bennett' });
    await expect(page.getByRole('heading', { name: /Equipos del meta con Bennett/ })).toBeVisible();
    expect(calls).toEqual([]);
  });

  test('an expired copy stays visible while the update runs, with a live timer, then is replaced', async ({ page }) => {
    await page.route('https://enka.network/**', r => r.abort());
    await seedMeta(page, { ...meta, patch: '7.0', fetchedAt: ago(14) }); // older than 12 h
    let polls = 0;
    await page.route('**/genshin/meta**', r => {
      polls++;
      r.fulfill({ json: polls < 3
        ? { status: 'updating', elapsed: polls === 1 ? 4 : 6, meta: { ...meta, patch: '7.0', fetchedAt: ago(14) } }
        : { status: 'fresh', meta } });
    });
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('tab', { name: 'Mejores equipos' }).click();

    await expect(page.getByText(/Actualizando el meta con la información más reciente… \(4 s\)/)).toBeVisible();
    await expect(page.getByText('Mientras tanto ves el último guardado.')).toBeVisible();
    await expect(page.getByText(/Meta del parche 7.0/)).toBeVisible();          // the old data is still on screen
    await expect(page.getByRole('listitem').filter({ hasText: 'Vesna Swirl' })).toBeVisible();

    await expect(page.getByText(/Meta del parche 7.1/)).toBeVisible({ timeout: 10_000 }); // swapped when ready
    await expect(page.getByText(/Actualizando el meta/)).toHaveCount(0);
    expect(polls).toBe(3);
  });

  test('first visit with no copy: shows the update message and timer instead of empty content, then the teams', async ({ page }) => {
    await page.route('https://enka.network/**', r => r.abort());
    let polls = 0;
    await page.route('**/genshin/meta**', r => {
      polls++;
      r.fulfill({ json: polls === 1 ? { status: 'updating', elapsed: 2, meta: null } : { status: 'fresh', meta } });
    });
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('tab', { name: 'Mejores equipos' }).click();
    await expect(page.getByText(/Actualizando el meta con la información más reciente… \(2 s\)/)).toBeVisible();
    await expect(page.getByText('Suele tardar menos de un minuto.')).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'Vesna Swirl' })).toHaveCount(0);
    await expect(page.getByRole('listitem').filter({ hasText: 'Vesna Swirl' })).toBeVisible({ timeout: 10_000 });
  });

  test('a slow server shows "connecting" first, with the timer running', async ({ page }) => {
    await page.route('https://enka.network/**', r => r.abort());
    await page.route('**/genshin/meta**', async r => {
      await new Promise(resolve => setTimeout(resolve, 2500)); // Render waking up
      await r.fulfill({ json: { status: 'fresh', meta } });
    });
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('tab', { name: 'Mejores equipos' }).click();
    await expect(page.getByText(/Conectando con el servidor… si estaba dormido puede tardar hasta un minuto \([12] s\)/)).toBeVisible();
    await expect(page.getByText(/Meta del parche 7.1/)).toBeVisible({ timeout: 10_000 });
  });

  test('when the update cannot run it shows the last copy with the reason, not an empty page', async ({ page }) => {
    await page.route('https://enka.network/**', r => r.abort());
    await page.route('**/genshin/meta**', r => r.fulfill({ json: {
      status: 'stale', meta: { ...meta, patch: '7.0', fetchedAt: ago(20) }, message: 'Se alcanzó el límite diario de actualizaciones del meta.' } }));
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('tab', { name: 'Mejores equipos' }).click();
    await expect(page.getByText(/Se alcanzó el límite diario de actualizaciones del meta\. Se muestra la última copia guardada\./)).toBeVisible();
    await expect(page.getByText(/Meta del parche 7.0/)).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'Vesna Swirl' })).toBeVisible();
  });

  test('unavailable (503): a clear message and Retry, which recovers on the next try', async ({ page }) => {
    await page.route('https://enka.network/**', r => r.abort());
    let calls = 0;
    await page.route('**/genshin/meta**', r => {
      calls++;
      r.fulfill(calls === 1
        ? { status: 503, json: { status: 'unavailable', meta: null, message: 'No se pudo actualizar el meta; se reintentará en unos minutos.' } }
        : { json: { status: 'fresh', meta } });
    });
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('tab', { name: 'Mejores equipos' }).click();
    await expect(page.getByText('No se pudo actualizar el meta; se reintentará en unos minutos.')).toBeVisible();
    await page.getByRole('button', { name: 'Reintentar' }).click();
    await expect(page.getByText(/Meta del parche 7.1/)).toBeVisible();
  });

  test('chat at its daily limit explains it and the rest of the guide keeps working', async ({ page }) => {
    await mockBackend(page);
    await page.route('**/genshin/chat', r => r.fulfill({ status: 429, json: { error: 'daily_limit', message: 'El chat alcanzó su límite diario. El resto de la guía sigue funcionando; vuelve mañana.' } }));
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('tab', { name: 'Chat con IA' }).click();
    await page.getByLabel('Tu pregunta').fill('hola');
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByRole('alert')).toContainText('límite diario');
    await page.getByRole('tab', { name: 'Mejores equipos' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: 'Vesna Swirl' })).toBeVisible();
  });

  test('a NEW character no source covers shows "Sin datos del meta", never a made-up percentage', async ({ page }) => {
    await page.route('https://enka.network/**', r => r.abort());
    // Vesna is covered (she has a team); Vodyanitsa is NEW on genshin.gg but on no tier list or team yet.
    const noData = { ...meta, banners: [VESNA], newCharacters: [VODYANITSA],
      characters: meta.characters.filter(c => c.id !== VODYANITSA), teams: [meta.teams[0]] };
    await page.route('**/genshin/meta**', r => r.fulfill({ json: { status: 'fresh', meta: noData } }));
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('button', { name: 'Furina (no lo tienes)' }).click();
    await page.getByRole('button', { name: 'Nahida (no lo tienes)' }).click();
    await page.getByRole('tab', { name: '¿A quién sacar?' }).click();

    await expect(page.getByRole('heading', { name: 'Banners y novedades' })).toBeVisible();
    const vodyCard = page.getByRole('button', { name: /Vodyanitsa/ }).first();  // listed because it is NEW, not a banner
    await expect(vodyCard).toContainText('Sin datos del meta');
    await expect(vodyCard).toContainText('aún sin datos en las fuentes');
    await expect(vodyCard).not.toContainText('%');
    await expect(page.getByRole('button', { name: /Vesna/ }).first()).toContainText('%');  // covered ones keep their estimate

    await vodyCard.click();
    await expect(page.getByText(/Ninguna de las fuentes consultadas tiene todavía datos de Vodyanitsa/)).toBeVisible();
    await expect(page.getByText(/Esto no significa que sea una mala opción/)).toBeVisible();
    await expect(page.getByText(/\(de [\d.]+ a [\d.]+\)/)).toHaveCount(0);  // no "from X to Y" for it
  });

  test('a team built from a character page is shown as "Sin rankear", not as a tier', async ({ page }) => {
    await page.route('https://enka.network/**', r => r.abort());
    const withPage = { ...meta, teams: [meta.teams[0], { ...meta.teams[1], name: 'Equipo de ficha', unranked: true, note: 'De la ficha del personaje en genshin.gg: aún no tiene tier oficial.' }] };
    await page.route('**/genshin/meta**', r => r.fulfill({ json: { status: 'fresh', meta: withPage } }));
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('tab', { name: 'Mejores equipos' }).click();
    const ranked = page.getByRole('listitem').filter({ hasText: 'Vesna Swirl' });
    const unranked = page.getByRole('listitem').filter({ hasText: 'Equipo de ficha' });
    await expect(unranked.locator('.tier')).toHaveText('Sin rankear');
    await expect(unranked.locator('.tier')).toHaveAttribute('title', /no tiene tier oficial/);
    await expect(ranked.locator('.tier')).toHaveText('S');  // ranked teams keep their letter
    await expect(unranked).toContainText('aún no tiene tier oficial');
  });

  test('the chat is told which characters have no data, so it cannot present them as bad picks', async ({ page }) => {
    await page.route('https://enka.network/**', r => r.abort());
    const noData = { ...meta, banners: [VESNA], newCharacters: [VODYANITSA],
      characters: meta.characters.filter(c => c.id !== VODYANITSA), teams: [meta.teams[0]] };
    await page.route('**/genshin/meta**', r => r.fulfill({ json: { status: 'fresh', meta: noData } }));
    let context = '';
    await page.route('**/genshin/chat', r => {
      context = r.request().postDataJSON().context;
      r.fulfill({ status: 200, contentType: 'text/event-stream', body: 'data: {"text":"ok"}\n\ndata: [DONE]\n\n' });
    });
    await page.goto('/guides/genshin-impact/mi-cuenta');
    await page.getByRole('tab', { name: 'Chat con IA' }).click();
    await page.getByLabel('Tu pregunta').fill('¿Vesna o Vodyanitsa?');
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByRole('log')).toContainText('ok');
    expect(context).toContain('Vodyanitsa [nuevo]: sin datos del meta todavía');
    expect(context).toContain('NO hay estimación de su mejora');
  });
});
