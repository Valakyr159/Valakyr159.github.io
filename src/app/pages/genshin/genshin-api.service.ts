import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EnkaProfile, Meta, MetaState, RosterCharacter } from './genshin.models';

const META_KEY = 'genshin.meta.v1';
/** Matches the backend cache (12 h): inside this window the browser doesn't ask again. */
export const META_MAX_AGE_MS = 12 * 3600 * 1000;
/** A state request can wait for Render to wake up (~1 min); the AI itself runs in the background. */
const META_TIMEOUT_MS = 100_000;
/** A snapshot from the backup model expires quickly in the browser too (the backend keeps it ~10 min). */
export const DEGRADED_META_MAX_AGE_MS = 10 * 60 * 1000;

/** True when a meta copy needs no network at all: younger than 12 h (10 min if it came from the backup model). */
export function metaIsFresh(meta: Meta, now = Date.now()): boolean {
  const limit = meta.degraded ? DEGRADED_META_MAX_AGE_MS : META_MAX_AGE_MS;
  return now - meta.fetchedAt * 1000 < limit;
}

/** Error with a message that is safe and useful to show to the user. */
export class GenshinApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class GenshinApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  async roster(): Promise<RosterCharacter[]> {
    const data = await firstValueFrom(this.http.get<{ characters: RosterCharacter[] }>('/genshin/roster.json'));
    return data.characters;
  }

  async profile(uid: string): Promise<EnkaProfile> {
    try {
      return await firstValueFrom(this.http.get<EnkaProfile>(`${this.base}/genshin/profile/${encodeURIComponent(uid)}`).pipe(timeout(90_000)));
    } catch (e) {
      throw this.toError(e, 'No se pudo leer la cuenta.');
    }
  }

  /**
   * Asks the backend for the meta state. It is cheap (the backend answers from its stored snapshot) and is
   * what the page polls while an update runs. Callers skip it entirely while the browser copy is fresh.
   */
  async metaState(): Promise<MetaState> {
    try {
      const state = await firstValueFrom(this.http.post<MetaState>(`${this.base}/genshin/meta`, {}).pipe(timeout(META_TIMEOUT_MS)));
      if (state.meta) this.rememberMeta(state.meta);
      return state;
    } catch (e) {
      // 503 carries a normal state body ("unavailable"): hand it over instead of throwing.
      if (e instanceof HttpErrorResponse && e.status === 503 && e.error?.status === 'unavailable') return e.error as MetaState;
      throw this.toError(e, 'No se pudo obtener el meta ahora mismo.');
    }
  }

  /** Last meta saved in this browser, of any age: shown immediately while a newer one is being fetched. */
  readLastMeta(): Meta | null {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (!raw) return null;
      const meta = JSON.parse(raw) as Meta;
      return Array.isArray(meta.teams) && typeof meta.fetchedAt === 'number' ? meta : null;
    } catch {
      return null;
    }
  }

  private rememberMeta(meta: Meta): void {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(meta));
    } catch { /* not remembered, still usable */ }
  }

  private toError(e: unknown, fallback: string): GenshinApiError {
    if (e instanceof HttpErrorResponse) {
      const message = typeof e.error?.message === 'string' ? e.error.message : fallback;
      return new GenshinApiError(e.status === 0 ? 'No hay conexión con el servidor. Puede estar despertando, vuelve a intentarlo en un minuto.' : message, e.status);
    }
    if (e instanceof Error && e.name === 'TimeoutError') {
      return new GenshinApiError('El servidor tardó demasiado. Puede estar despertando, vuelve a intentarlo.', 0);
    }
    return new GenshinApiError(fallback, 0);
  }
}
