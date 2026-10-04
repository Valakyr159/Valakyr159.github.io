import { TestBed } from '@angular/core/testing';
import { GenshinAccountService } from './genshin-account.service';
import { EnkaProfile } from './genshin.models';

const profile = (over: Partial<EnkaProfile> = {}): EnkaProfile => ({
  uid: '618285856', nickname: 'Tester', adventureRank: 60, ttl: 60, showcaseVisible: true,
  characters: [{ id: 10000021, level: 90, cons: 6 }], ...over,
});

describe('GenshinAccountService', () => {
  beforeEach(() => localStorage.clear());
  const create = () => TestBed.inject(GenshinAccountService);

  it('toggles manual marks', () => {
    const s = create();
    s.toggle(1);
    expect(s.has(1)).toBe(true);
    expect(s.owned().get(1)?.source).toBe('manual');
    s.toggle(1);
    expect(s.has(1)).toBe(false);
  });

  it('imports showcase characters with level and constellation, overriding manual marks', () => {
    const s = create();
    s.toggle(10000021);
    s.importProfile(profile());
    expect(s.owned().get(10000021)).toEqual({ id: 10000021, level: 90, cons: 6, source: 'enka' });
    expect(s.uid()).toBe('618285856');
  });

  it('keeps characters that left the showcase on a later import', () => {
    const s = create();
    s.importProfile(profile());
    s.importProfile(profile({ characters: [{ id: 10000032, level: 80, cons: 0 }] }));
    expect(s.has(10000021)).toBe(true);
    expect(s.has(10000032)).toBe(true);
  });

  it('persists to localStorage and restores in a new instance', () => {
    const s = create();
    s.importProfile(profile());
    s.toggle(5);
    TestBed.tick();

    TestBed.resetTestingModule();
    const restored = TestBed.inject(GenshinAccountService);
    expect(restored.uid()).toBe('618285856');
    expect(restored.has(5)).toBe(true);
    expect(restored.owned().get(10000021)?.cons).toBe(6);
  });

  it('forget clears the state and the stored copy', () => {
    const s = create();
    s.importProfile(profile());
    TestBed.tick();
    s.forget();
    TestBed.tick();
    expect(s.count()).toBe(0);
    expect(localStorage.getItem('genshin.account.v1')).toBeNull();
  });

  it('survives corrupt stored data', () => {
    localStorage.setItem('genshin.account.v1', '{not json');
    expect(create().count()).toBe(0);
  });

  it('drops malformed entries when restoring', () => {
    localStorage.setItem('genshin.account.v1', JSON.stringify({ uid: '1', owned: [{ id: 7, source: 'manual' }, { id: 'x' }, null, { id: 8, source: 'hacked' }] }));
    const s = create();
    expect([...s.owned().keys()]).toEqual([7]);
  });
});
