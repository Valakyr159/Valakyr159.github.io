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
  lines.push(`Nivel actual de la cuenta (media de sus ${TOP_N} mejores equipos): ${accountScore(scored)}.`);

  lines.push('', 'Mejores equipos del meta para el jugador:');
  for (const t of scored.slice(0, MAX_TEAMS)) {
    const members = t.slots.map(s => {
      if (s.status === 'owned') return `${name(s.wantedId)} (lo tiene)`;
      if (s.status === 'substitute') return `${name(s.wantedId)} (le falta; lo cubre ${name(s.fillId!)})`;
      return `${name(s.wantedId)} (le falta)`;
    });
    lines.push(`- ${t.team.name} [${t.team.tier}] ${t.team.reaction}: puntuación ${t.score}. ${members.join('; ')}.`);
  }

  const ids = pullCandidates(ctx);
  const banners = new Set(ctx.meta.banners);
  const ranked = rankPulls(ids, ctx);
  const shown = [...ranked.filter(r => banners.has(r.id)), ...ranked.filter(r => !banners.has(r.id)).slice(0, MAX_PULLS)];
  lines.push('', 'Mejora estimada si el jugador consigue a cada personaje (a C0):');
  for (const r of shown) {
    const pct = r.improvementPct === null ? 'primer equipo jugable' : `${r.improvementPct > 0 ? '+' : ''}${r.improvementPct}%`;
    const teams = r.unlocked.slice(0, 3).map(t => t.team.name).join(', ') || 'ningún equipo del meta lo incluye';
    lines.push(`- ${name(r.id)}${banners.has(r.id) ? ' [en banner]' : ''}: ${pct} (puntuación ${r.newScore}). Equipos: ${teams}.`);
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
