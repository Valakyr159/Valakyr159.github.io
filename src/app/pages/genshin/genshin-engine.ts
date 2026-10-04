import {
  Meta, MetaCharacter, MetaTeam, OwnedCharacter, PullCandidateResult, RosterCharacter, Role, ScoredSlot,
  ScoredTeam, Tier,
} from './genshin.models';

/**
 * Deterministic team scoring. The LLM never produces these numbers: it only
 * explains them. Everything here is a *heuristic estimate* and the UI says so.
 *
 *   slot quality   = character power (level / constellation) x fit (1 if exact, <1 if substitute)
 *   team score     = 100 x tier factor x weighted mean of slot quality (weights by role)
 *   account score  = mean score of the TOP_N best teams
 *   improvement %  = (account score with candidate - without) / without
 */

export const TOP_N = 3;
export const TIER_FACTOR: Record<Tier, number> = { S: 1, A: 0.85, B: 0.7 };
export const ROLE_WEIGHT: Record<Role, number> = { 'Main DPS': 0.4, 'Sub DPS': 0.25, Support: 0.2, Healer: 0.15 };

const DEFAULT_POWER = 0.9; // owned, but level unknown (manual checklist)
const CONS_BONUS = 0.02;
const MAX_POWER = 1.12;
const SUBSTITUTE_FIT = 0.7;
const OFF_ELEMENT_FIT = 0.8; // a substitute carry of another element
const UNLISTED_TIER_FACTOR = 0.5;

export interface EngineContext {
  meta: Meta;
  roster: Map<number, RosterCharacter>;
  owned: Map<number, OwnedCharacter>;
}

/** 0..1.12. Level counts for 70-100% of the base, each constellation adds 2%. */
export function power(c: OwnedCharacter): number {
  const base = c.level != null ? 0.7 + 0.3 * Math.min(Math.max(c.level, 1), 90) / 90 : DEFAULT_POWER;
  return Math.min(MAX_POWER, base + CONS_BONUS * Math.min(c.cons ?? 0, 6));
}

function metaIndex(meta: Meta): Map<number, MetaCharacter> {
  return new Map(meta.characters.map(c => [c.id, c]));
}

/** Best owned character for a slot, excluding ones already placed in the team. */
function bestSubstitute(
  wanted: { id: number; role: Role }, taken: Set<number>, ctx: EngineContext, index: Map<number, MetaCharacter>,
): { id: number; quality: number } | null {
  const wantedChar = ctx.roster.get(wanted.id);
  let best: { id: number; quality: number } | null = null;
  for (const [id, own] of ctx.owned) {
    if (taken.has(id)) continue;
    const listed = index.get(id);
    if (!listed || listed.role !== wanted.role) continue; // only characters the meta says can play this role
    let fit = SUBSTITUTE_FIT * TIER_FACTOR[listed.tier] / TIER_FACTOR.S;
    const isCarry = wanted.role === 'Main DPS' || wanted.role === 'Sub DPS';
    if (isCarry && wantedChar && ctx.roster.get(id)?.element !== wantedChar.element) fit *= OFF_ELEMENT_FIT;
    const quality = power(own) * fit;
    if (!best || quality > best.quality) best = { id, quality };
  }
  return best;
}

export function scoreTeam(team: MetaTeam, ctx: EngineContext, index = metaIndex(ctx.meta)): ScoredTeam {
  // Exact members first, so a substitute never steals a seat a real member holds.
  const taken = new Set<number>(team.members.filter(m => ctx.owned.has(m.id)).map(m => m.id));
  const slots: ScoredSlot[] = team.members.map(m => {
    const own = ctx.owned.get(m.id);
    if (own) return { wantedId: m.id, role: m.role, status: 'owned', fillId: m.id, quality: power(own) };
    return { wantedId: m.id, role: m.role, status: 'missing', fillId: null, quality: 0 };
  });

  for (const slot of slots) {
    if (slot.status !== 'missing') continue;
    const sub = bestSubstitute({ id: slot.wantedId, role: slot.role }, taken, ctx, index);
    if (sub) {
      taken.add(sub.id);
      Object.assign(slot, { status: 'substitute', fillId: sub.id, quality: sub.quality });
    }
  }

  const totalWeight = slots.reduce((sum, s) => sum + ROLE_WEIGHT[s.role], 0);
  const weighted = slots.reduce((sum, s) => sum + ROLE_WEIGHT[s.role] * s.quality, 0);
  return {
    team,
    score: round1(100 * TIER_FACTOR[team.tier] * (totalWeight ? weighted / totalWeight : 0)),
    slots,
    ownedCount: slots.filter(s => s.status === 'owned').length,
    missingCount: slots.filter(s => s.status === 'missing').length,
  };
}

export function scoreAllTeams(ctx: EngineContext): ScoredTeam[] {
  const index = metaIndex(ctx.meta);
  return ctx.meta.teams.map(t => scoreTeam(t, ctx, index)).sort((a, b) => b.score - a.score);
}

/** Mean of the TOP_N best scores: how good the account's best options are overall. */
export function accountScore(scored: ScoredTeam[]): number {
  const top = [...scored].sort((a, b) => b.score - a.score).slice(0, TOP_N);
  return top.length ? round1(top.reduce((s, t) => s + t.score, 0) / top.length) : 0;
}

export function improvement(before: number, after: number): number | null {
  return before > 0 ? round1(((after - before) / before) * 100) : null;
}

/** Evaluates pulling `candidateId` (at C0, level unknown) on top of the current account. */
export function evaluatePull(candidateId: number, ctx: EngineContext): PullCandidateResult {
  const before = accountScore(scoreAllTeams(ctx));
  const owned = new Map(ctx.owned).set(candidateId, { id: candidateId, source: 'manual' });
  const withCandidate: EngineContext = { ...ctx, owned };
  const scored = scoreAllTeams(withCandidate);
  const after = accountScore(scored);
  return {
    id: candidateId,
    newScore: after,
    improvementPct: improvement(before, after),
    unlocked: scored.filter(t => t.team.members.some(m => m.id === candidateId)),
  };
}

/** Candidates worth comparing: the banner characters (not owned) plus the meta's S-tier ones. */
export function pullCandidates(ctx: EngineContext): number[] {
  const ids = new Set<number>(ctx.meta.banners);
  for (const c of ctx.meta.characters) if (c.tier === 'S') ids.add(c.id);
  return [...ids].filter(id => ctx.roster.has(id) && !ctx.owned.has(id));
}

export function rankPulls(ids: number[], ctx: EngineContext): PullCandidateResult[] {
  return ids
    .map(id => evaluatePull(id, ctx))
    // null (no baseline) sorts first: the account has nothing playable yet.
    .sort((a, b) => (b.improvementPct ?? Infinity) - (a.improvementPct ?? Infinity) || b.newScore - a.newScore);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
