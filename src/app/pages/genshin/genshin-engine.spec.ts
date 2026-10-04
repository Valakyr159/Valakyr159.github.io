import {
  accountScore, evaluatePull, improvement, power, pullCandidates, rankPulls, scoreAllTeams, scoreTeam,
} from './genshin-engine';
import { Element, Meta, OwnedCharacter, RosterCharacter, Role, Tier } from './genshin.models';

function ch(id: number, element: Element): RosterCharacter {
  return { id, key: `c${id}`, name: { en: `C${id}`, es: `C${id}`, pt: `C${id}` }, element, weapon: 'Sword', rarity: 5, icon: `i${id}`, sideIcon: `s${id}` };
}
// 1 carry (Pyro), 2 sub-DPS, 3 support, 4 healer; 5 = alternative Pyro carry; 6 = Hydro carry; 7 = alt healer
const ROSTER = new Map([ch(1, 'Pyro'), ch(2, 'Hydro'), ch(3, 'Anemo'), ch(4, 'Dendro'), ch(5, 'Pyro'), ch(6, 'Hydro'), ch(7, 'Hydro')].map(c => [c.id, c]));

function meta(over: Partial<Meta> = {}): Meta {
  const m = (id: number, role: Role) => ({ id, role });
  return {
    patch: '7.1', sources: [], model: 'test', fetchedAt: 0, banners: [],
    characters: [
      { id: 1, role: 'Main DPS', tier: 'S' }, { id: 5, role: 'Main DPS', tier: 'A' }, { id: 6, role: 'Main DPS', tier: 'S' },
      { id: 2, role: 'Sub DPS', tier: 'S' }, { id: 3, role: 'Support', tier: 'S' },
      { id: 4, role: 'Healer', tier: 'S' }, { id: 7, role: 'Healer', tier: 'B' },
    ],
    teams: [{ name: 'Main', reaction: 'Vaporize', tier: 'S' as Tier, note: '', members: [m(1, 'Main DPS'), m(2, 'Sub DPS'), m(3, 'Support'), m(4, 'Healer')] }],
    ...over,
  };
}
const maxed = (id: number): OwnedCharacter => ({ id, level: 90, cons: 0, source: 'enka' });
const ctx = (owned: OwnedCharacter[], m = meta()) => ({ meta: m, roster: ROSTER, owned: new Map(owned.map(o => [o.id, o])) });

describe('genshin-engine', () => {
  describe('power', () => {
    it('is 1 for level 90 C0, 0.7 + 0.3*lvl/90 below, +2% per constellation, capped', () => {
      expect(power(maxed(1))).toBe(1);
      expect(power({ id: 1, level: 45, source: 'enka' })).toBeCloseTo(0.85);
      expect(power({ id: 1, level: 90, cons: 6, source: 'enka' })).toBeCloseTo(1.12);
      expect(power({ id: 1, level: 90, cons: 99, source: 'enka' })).toBeCloseTo(1.12);
    });
    it('assumes 0.9 when the level is unknown (manual checklist)', () => {
      expect(power({ id: 1, source: 'manual' })).toBe(0.9);
    });
  });

  describe('scoreTeam', () => {
    it('gives 100 to a full S-tier team of maxed characters', () => {
      const s = scoreTeam(meta().teams[0], ctx([1, 2, 3, 4].map(maxed)));
      expect(s.score).toBe(100);
      expect(s.ownedCount).toBe(4);
      expect(s.missingCount).toBe(0);
    });

    it('applies the tier factor', () => {
      const m = meta();
      m.teams[0].tier = 'A';
      expect(scoreTeam(m.teams[0], ctx([1, 2, 3, 4].map(maxed), m)).score).toBe(85);
    });

    it('scores a missing slot with no substitute as zero (weights: carry .4, sub .25, support .2, healer .15)', () => {
      const s = scoreTeam(meta().teams[0], ctx([1, 2, 3].map(maxed)));
      expect(s.score).toBe(85); // lost the healer's 15%
      expect(s.slots[3]).toMatchObject({ status: 'missing', fillId: null, quality: 0 });
    });

    it('fills a missing carry with a same-role substitute at 0.7 x tier ratio (A-tier => .7 x .85)', () => {
      const s = scoreTeam(meta().teams[0], ctx([5, 2, 3, 4].map(maxed)));
      expect(s.slots[0]).toMatchObject({ status: 'substitute', fillId: 5 });
      expect(s.slots[0].quality).toBeCloseTo(0.7 * 0.85);
      expect(s.score).toBeCloseTo(100 * (0.4 * 0.595 + 0.6), 1);
    });

    it('penalises a substitute carry of a different element', () => {
      const same = scoreTeam(meta().teams[0], ctx([5, 2, 3, 4].map(maxed))).slots[0].quality; // A-tier Pyro for Pyro
      const off = scoreTeam(meta().teams[0], ctx([6, 2, 3, 4].map(maxed))).slots[0].quality; // S-tier Hydro for Pyro
      expect(same).toBeCloseTo(0.7 * 0.85); // 0.595
      expect(off).toBeCloseTo(0.7 * 1 * 0.8); // 0.56: S-tier but off-element, so it scores below the on-element A-tier
    });

    it('ignores owned characters the meta does not list for that role', () => {
      const s = scoreTeam(meta().teams[0], ctx([2, 3, 4].map(maxed)));
      expect(s.slots[0].status).toBe('missing'); // 2 is a Sub DPS: it cannot cover the Main DPS seat
    });

    it('never lets a substitute take a seat held by an exact member', () => {
      // 4 (healer) is a real member; 7 is the only alt healer and must stay unused.
      const s = scoreTeam(meta().teams[0], ctx([1, 2, 3, 4, 7].map(maxed)));
      expect(s.slots.map(x => x.fillId)).toEqual([1, 2, 3, 4]);
    });

    it('does not use the same substitute twice', () => {
      const m = meta();
      m.teams[0].members = [{ id: 1, role: 'Main DPS' }, { id: 6, role: 'Main DPS' }, { id: 3, role: 'Support' }, { id: 4, role: 'Healer' }];
      const s = scoreTeam(m.teams[0], ctx([5, 3, 4].map(maxed), m));
      const fills = s.slots.map(x => x.fillId);
      expect(fills.filter(f => f === 5).length).toBe(1);
      expect(s.slots.filter(x => x.status === 'missing').length).toBe(1);
    });
  });

  describe('account score and improvement', () => {
    it('averages the best TOP_N teams and sorts teams best first', () => {
      const m = meta();
      m.teams.push({ ...m.teams[0], name: 'B-team', tier: 'B' });
      const scored = scoreAllTeams(ctx([1, 2, 3, 4].map(maxed), m));
      expect(scored.map(t => t.team.name)).toEqual(['Main', 'B-team']);
      expect(accountScore(scored)).toBe(85); // (100 + 70) / 2
      expect(accountScore([])).toBe(0);
    });

    it('computes percent change, null without a baseline', () => {
      expect(improvement(50, 75)).toBe(50);
      expect(improvement(80, 60)).toBe(-25);
      expect(improvement(0, 60)).toBeNull();
    });
  });

  describe('pull planner', () => {
    it('reports the gain of pulling the missing carry and lists the teams it joins', () => {
      const c = ctx([2, 3, 4].map(maxed)); // no carry at all
      const r = evaluatePull(1, c);
      expect(r.newScore).toBeGreaterThan(accountScore(scoreAllTeams(c)));
      expect(r.improvementPct).toBeCloseTo(((r.newScore - 60) / 60) * 100, 0);
      expect(r.unlocked.map(t => t.team.name)).toEqual(['Main']);
    });

    it('is reproducible: same inputs give identical results', () => {
      const c = ctx([2, 3, 4].map(maxed));
      expect(evaluatePull(1, c)).toEqual(evaluatePull(1, c));
    });

    it('returns null improvement when the account has no playable team at all', () => {
      expect(evaluatePull(1, ctx([])).improvementPct).toBeNull();
    });

    it('does not mutate the caller owned map', () => {
      const c = ctx([2, 3, 4].map(maxed));
      evaluatePull(1, c);
      expect(c.owned.has(1)).toBe(false);
    });

    it('offers banners and S-tier characters the user lacks, never owned ones', () => {
      const m = meta({ banners: [5] });
      const ids = pullCandidates(ctx([1].map(maxed), m)).sort();
      expect(ids).toEqual([2, 3, 4, 5, 6]);
    });

    it('ranks the pull with the biggest gain first', () => {
      const c = ctx([2, 3, 4].map(maxed));
      const ranked = rankPulls([5, 1], c); // S-tier carry beats the A-tier one
      expect(ranked.map(r => r.id)).toEqual([1, 5]);
    });
  });
});
