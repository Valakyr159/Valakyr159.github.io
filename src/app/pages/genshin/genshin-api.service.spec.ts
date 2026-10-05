import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DEGRADED_META_MAX_AGE_MS, GenshinApiError, GenshinApiService, META_MAX_AGE_MS, metaIsFresh } from './genshin-api.service';
import { Meta, MetaState } from './genshin.models';

const meta = (over: Partial<Meta> = {}, ageMs = 0): Meta => ({
  patch: '7.1', characters: [], teams: [], banners: [], sources: [], model: 't',
  fetchedAt: Math.floor((Date.now() - ageMs) / 1000), ...over,
});
const URL = (req: { url: string }) => /\/genshin\/meta$/.test(req.url);

describe('metaIsFresh', () => {
  it('is fresh for 12 h, or 10 min when the backup model made it', () => {
    expect(metaIsFresh(meta({}, META_MAX_AGE_MS - 60_000))).toBe(true);
    expect(metaIsFresh(meta({}, META_MAX_AGE_MS + 60_000))).toBe(false);
    expect(metaIsFresh(meta({ degraded: true }, DEGRADED_META_MAX_AGE_MS - 60_000))).toBe(true);
    expect(metaIsFresh(meta({ degraded: true }, DEGRADED_META_MAX_AGE_MS + 60_000))).toBe(false);
  });
});

describe('GenshinApiService', () => {
  let service: GenshinApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(GenshinApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  async function respond(request: () => Promise<MetaState>, flush: (req: ReturnType<HttpTestingController['expectOne']>) => void) {
    const pending = request();
    flush(http.expectOne(URL));
    return pending;
  }

  describe('readLastMeta', () => {
    it('returns nothing when storage is empty or corrupt', () => {
      expect(service.readLastMeta()).toBeNull();
      localStorage.setItem('genshin.meta.v1', '{nope');
      expect(service.readLastMeta()).toBeNull();
      localStorage.setItem('genshin.meta.v1', JSON.stringify({ patch: 'x' })); // not a meta
      expect(service.readLastMeta()).toBeNull();
    });

    it('returns a copy of ANY age: it is shown while a newer one is fetched', () => {
      localStorage.setItem('genshin.meta.v1', JSON.stringify(meta({ patch: '6.9' }, 40 * 24 * 3600 * 1000)));
      expect(service.readLastMeta()?.patch).toBe('6.9');
    });
  });

  describe('metaState', () => {
    it('POSTs once, returns the state and remembers the meta for the next visit', async () => {
      const state: MetaState = { status: 'fresh', meta: meta({ patch: '7.1' }) };
      const result = await respond(() => service.metaState(), req => {
        expect(req.request.method).toBe('POST');
        req.flush(state);
      });
      expect(result).toEqual(state);
      expect(service.readLastMeta()?.patch).toBe('7.1');
    });

    it('passes `updating` through with its elapsed time, and still remembers the previous copy', async () => {
      const result = await respond(() => service.metaState(), req => req.flush({ status: 'updating', elapsed: 12, meta: meta({ patch: '7.0' }) }));
      expect(result.status).toBe('updating');
      expect(result.elapsed).toBe(12);
      expect(service.readLastMeta()?.patch).toBe('7.0');
    });

    it('does not overwrite the remembered meta when the state has none', async () => {
      localStorage.setItem('genshin.meta.v1', JSON.stringify(meta({ patch: 'kept' })));
      await respond(() => service.metaState(), req => req.flush({ status: 'updating', elapsed: 1, meta: null }));
      expect(service.readLastMeta()?.patch).toBe('kept');
    });

    it('hands over a 503 "unavailable" body as a normal state instead of throwing', async () => {
      const body = { status: 'unavailable', meta: null, message: 'No se pudo actualizar el meta.' };
      const result = await respond(() => service.metaState(), req => req.flush(body, { status: 503, statusText: 'Service Unavailable' }));
      expect(result).toEqual(body);
    });

    it('turns other failures into an error with the backend message', async () => {
      const pending = service.metaState();
      http.expectOne(URL).flush({ error: 'rate_limited', message: 'Demasiadas peticiones, inténtalo más tarde.' }, { status: 429, statusText: 'Too Many' });
      await expect(pending).rejects.toMatchObject({ message: 'Demasiadas peticiones, inténtalo más tarde.', status: 429 });
      await expect(pending).rejects.toBeInstanceOf(GenshinApiError);
    });

    it('explains a dead connection as "the server may be waking up"', async () => {
      const pending = service.metaState();
      http.expectOne(URL).error(new ProgressEvent('error'));
      await expect(pending).rejects.toThrow(/despertando/);
    });
  });
});
