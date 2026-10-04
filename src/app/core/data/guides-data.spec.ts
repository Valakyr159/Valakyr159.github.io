import { findGame, findSeries, GUIDE_SERIES } from './guides-data';

describe('guides-data', () => {
  it('finds a series by slug and rejects unknown ones', () => {
    expect(findSeries('kingdom-hearts')?.title).toBe('Kingdom Hearts');
    expect(findSeries('nope')).toBeNull();
    expect(findSeries(null)).toBeNull();
  });

  it('finds a game only inside its own series', () => {
    const hit = findGame('kingdom-hearts', 'dream-drop-distance');
    expect(hit?.game.title).toBe('Dream Drop Distance');
    expect(findGame('kingdom-hearts', 'nope')).toBeNull();
    expect(findGame('nope', 'dream-drop-distance')).toBeNull();
  });

  it('gives every iframe game a src and every app game a route', () => {
    for (const s of GUIDE_SERIES) {
      for (const g of s.games) {
        if (g.kind === 'iframe') expect(g.src).toBeTruthy();
        else expect(g.route).toBeTruthy();
      }
    }
  });
});
