import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DEGRADED_META_MAX_AGE_MS, GenshinApiService } from './genshin-api.service';
import { Meta } from './genshin.models';

const meta = (over: Partial<Meta> = {}, ageMs = 0): Meta => ({
  patch: '7.1', characters: [], teams: [], banners: [], sources: [], model: 't',
  fetchedAt: Math.floor((Date.now() - ageMs) / 1000), ...over,
});

describe('GenshinApiService.readCachedMeta', () => {
  let service: GenshinApiService;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(GenshinApiService); // reads localStorage on every call, so one instance is enough
  });
  const api = () => service;
  const store = (m: Meta) => localStorage.setItem('genshin.meta.v1', JSON.stringify(m));

  it('returns a fresh snapshot and nothing when storage is empty or corrupt', () => {
    expect(api().readCachedMeta()).toBeNull();
    localStorage.setItem('genshin.meta.v1', '{nope');
    expect(api().readCachedMeta()).toBeNull();
    store(meta());
    expect(api().readCachedMeta()?.patch).toBe('7.1');
  });

  it('expires a normal snapshot after 12 h', () => {
    store(meta({}, 13 * 3600 * 1000));
    expect(api().readCachedMeta()).toBeNull();
  });

  it('expires a degraded snapshot after 10 minutes, long before 12 h', () => {
    store(meta({ degraded: true }, DEGRADED_META_MAX_AGE_MS - 60_000));
    expect(api().readCachedMeta()).not.toBeNull();
    store(meta({ degraded: true }, DEGRADED_META_MAX_AGE_MS + 60_000));
    expect(api().readCachedMeta()).toBeNull();
  });
});
