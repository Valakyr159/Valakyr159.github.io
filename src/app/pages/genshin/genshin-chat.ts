import { accountScore, EngineContext, pullCandidates, rankPulls, scoreAllTeams, TOP_N } from './genshin-engine';

/** Backend limit is 12000 chars; stay under it. */
export const MAX_CONTEXT_CHARS = 11500;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_TEAMS = 8;
const MAX_PULLS = 12;

/**
 * Plain-text summary of everything the page already computed, sent as the
 * chat's context. The model explains these numbers; it never produces them.
 */
export function buildChatContext(ctx: EngineContext): string {
  const name = (id: number) => ctx.roster.get(id)?.name.es ?? `#${id}`;
  const scored = scoreAllTeams(ctx);
  const lines: string[] = [];

  lines.push(`Meta del parche ${ctx.meta.patch}. Puntuaciones heurísticas de 0 a 100 (100 = equipo S con todos al máximo).`);

  const owned = [...ctx.owned.values()].map(o => {
    const extra = o.level != null ? ` (nv ${o.level}, C${o.cons ?? 0})` : '';
    return name(o.id) + extra;
  });
  lines.push(`Personajes del jugador (${owned.length}): ${owned.join(', ') || 'ninguno marcado'}.`);
  if (ctx.meta.degraded) {
    lines.push('AVISO: este meta lo generó el modelo de reserva y puede estar desactualizado (por ejemplo, faltar personajes nuevos). Dilo si el usuario depende de ello.');
  }
  lines.push(`Banners actuales: ${ctx.meta.banners.map(name).join(', ') || 'no verificados'}.`);
  const fresh = (ctx.meta.newCharacters ?? []).filter(id => ctx.roster.has(id));
  if (fresh.length) lines.push(`Personajes nuevos (marcados NEW en genshin.gg): ${fresh.map(name).join(', ')}.`);
  lines.push('Un personaje «sin datos del meta» es muy reciente y ninguna fuente lo incluye aún: NO hay estimación de su mejora. Dilo así; no afirmes que no mejora ni que sea mala opción.');
  lines.push(`Nivel actual de la cuenta (media de sus ${TOP_N} mejores equipos): ${accountScore(scored)}.`);

  lines.push('', 'Mejores equipos del meta para el jugador:');
  for (const t of scored.slice(0, MAX_TEAMS)) {
    const members = t.slots.map(s => {
      if (s.status === 'owned') return `${name(s.wantedId)} (lo tiene)`;
      if (s.status === 'substitute') return `${name(s.wantedId)} (le falta; lo cubre ${name(s.fillId!)})`;
      return `${name(s.wantedId)} (le falta)`;
    });
    const tier = t.team.unranked ? 'sin tier oficial, de la ficha del personaje, puntuado como A' : t.team.tier;
    lines.push(`- ${t.team.name} [${tier}] ${t.team.reaction}: puntuación ${t.score}. ${members.join('; ')}.`);
  }

  const ids = pullCandidates(ctx);
  const banners = new Set(ctx.meta.banners);
  const novelties = new Set(fresh);
  const featured = (id: number) => banners.has(id) || novelties.has(id);
  const ranked = rankPulls(ids, ctx);
  const shown = [...ranked.filter(r => featured(r.id)), ...ranked.filter(r => !featured(r.id) && r.inMeta).slice(0, MAX_PULLS)];
  lines.push('', 'Mejora estimada si el jugador consigue a cada personaje (a C0):');
  for (const r of shown) {
    const tag = banners.has(r.id) ? ' [en banner]' : novelties.has(r.id) ? ' [nuevo]' : '';
    if (!r.inMeta) {
      lines.push(`- ${name(r.id)}${tag}: sin datos del meta todavía (ninguna fuente lo incluye aún; no hay estimación).`);
      continue;
    }
    const pct = r.improvementPct === null ? 'primer equipo jugable' : `${r.improvementPct > 0 ? '+' : ''}${r.improvementPct}%`;
    const teams = r.unlocked.slice(0, 3).map(t => t.team.name).join(', ') || 'ningún equipo del meta lo incluye';
    lines.push(`- ${name(r.id)}${tag}: ${pct} (puntuación ${r.newScore}). Equipos: ${teams}.`);
  }

  const text = lines.join('\n');
  return text.length > MAX_CONTEXT_CHARS ? text.slice(0, MAX_CONTEXT_CHARS) : text;
}

/** Splits `**bold**` into segments so the template can render <strong> without innerHTML. */
export function parseBold(text: string): { text: string; bold: boolean }[] {
  return text.split('**').map((part, i) => ({ text: part, bold: i % 2 === 1 })).filter(p => p.text);
}

/** Incremental SSE parser: feed it raw chunks, it returns the events completed so far. */
export class SseParser {
  private buffer = '';

  push(chunk: string): string[] {
    this.buffer += chunk;
    const events = this.buffer.split('\n\n');
    this.buffer = events.pop() ?? '';
    return events
      .map(e => e.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trimStart()).join('\n'))
      .filter(e => e.length > 0);
  }
}
