import { buildChatContext, MAX_CONTEXT_CHARS, parseBold, SseParser } from './genshin-chat';
import { Meta, OwnedCharacter, RosterCharacter } from './genshin.models';

const ch = (id: number, es: string, element: RosterCharacter['element']): RosterCharacter =>
  ({ id, key: es.toLowerCase(), name: { en: es, es, pt: es }, element, weapon: 'Sword', rarity: 5, icon: '', sideIcon: '' });
const ROSTER = new Map([ch(1, 'Vesna', 'Anemo'), ch(2, 'Furina', 'Hydro'), ch(3, 'Nahida', 'Dendro'), ch(4, 'Bennett', 'Pyro'), ch(5, 'Vodyanitsa', 'Hydro')].map(c => [c.id, c]));
const meta: Meta = {
  patch: '7.1', sources: [], model: 't', fetchedAt: 0, banners: [1, 5],
  characters: [{ id: 1, role: 'Main DPS', tier: 'S' }, { id: 2, role: 'Sub DPS', tier: 'S' }, { id: 3, role: 'Support', tier: 'S' }, { id: 4, role: 'Healer', tier: 'S' }, { id: 5, role: 'Support', tier: 'S' }],
  teams: [{ name: 'Vesna Swirl', reaction: 'Swirl', tier: 'S', note: '', members: [{ id: 1, role: 'Main DPS' }, { id: 2, role: 'Sub DPS' }, { id: 3, role: 'Support' }, { id: 4, role: 'Healer' }] }],
};
const owned = new Map<number, OwnedCharacter>([[2, { id: 2, level: 90, cons: 2, source: 'enka' }], [3, { id: 3, source: 'manual' }]]);

describe('buildChatContext', () => {
  const text = buildChatContext({ meta, roster: ROSTER, owned });

  it('states the patch, the banners and what the player owns, with level and constellation when known', () => {
    expect(text).toContain('parche 7.1');
    expect(text).toContain('Banners actuales: Vesna, Vodyanitsa');
    expect(text).toContain('Furina (nv 90, C2)');
    expect(text).toMatch(/Nahida(?! \()/); // manual mark: no level claimed
  });

  it('lists each team with owned / missing slots and its score', () => {
    expect(text).toContain('Vesna Swirl [S] Swirl: puntuación');
    expect(text).toContain('Vesna (le falta)');
    expect(text).toContain('Furina (lo tiene)');
  });

  it('includes the engine percentages for banner characters, marked as such', () => {
    expect(text).toMatch(/- Vesna \[en banner\]: \+\d+(\.\d+)?% /);
    expect(text).toContain('Vodyanitsa [en banner]');
    expect(text).toContain('ningún equipo del meta lo incluye');
  });

  it('warns the model when the meta is degraded and does not claim banners it cannot verify', () => {
    const degraded = buildChatContext({ meta: { ...meta, degraded: true, banners: [] }, roster: ROSTER, owned });
    expect(degraded).toContain('AVISO');
    expect(degraded).toContain('Banners actuales: no verificados');
    expect(text).not.toContain('AVISO');
  });

  it('never exceeds the backend context limit', () => {
    const many = new Map<number, RosterCharacter>();
    for (let i = 1; i <= 600; i++) many.set(i, ch(i, 'Personaje con un nombre muy largo número ' + i, 'Geo'));
    const big = buildChatContext({ meta: { ...meta, characters: [], teams: [], banners: [] }, roster: many, owned: new Map([...many.keys()].map(id => [id, { id, source: 'manual' as const }])) });
    expect(big.length).toBeLessThanOrEqual(MAX_CONTEXT_CHARS);
  });
});

describe('parseBold', () => {
  it('alternates plain and bold segments and drops empties', () => {
    expect(parseBold('a **b** c')).toEqual([{ text: 'a ', bold: false }, { text: 'b', bold: true }, { text: ' c', bold: false }]);
    expect(parseBold('**solo**')).toEqual([{ text: 'solo', bold: true }]);
    expect(parseBold('<b>x</b>')).toEqual([{ text: '<b>x</b>', bold: false }]); // html stays text
  });
});

describe('SseParser', () => {
  it('reassembles events split across chunks', () => {
    const p = new SseParser();
    expect(p.push('data: {"text":"ho')).toEqual([]);
    expect(p.push('la"}\n\ndata: [DONE]\n\n')).toEqual(['{"text":"hola"}', '[DONE]']);
  });
  it('ignores non-data lines and keeps a trailing partial event buffered', () => {
    const p = new SseParser();
    expect(p.push(': ping\n\ndata: 1\n\ndata: 2')).toEqual(['1']);
    expect(p.push('\n\n')).toEqual(['2']);
  });
});
