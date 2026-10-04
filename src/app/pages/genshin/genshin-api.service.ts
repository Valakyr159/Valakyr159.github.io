import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EnkaProfile, Meta, RosterCharacter } from './genshin.models';

const META_KEY = 'genshin.meta.v1';
/** Matches the backend cache (12 h): inside this window the browser doesn't ask again. */
export const META_MAX_AGE_MS = 12 * 3600 * 1000;
/** Gemini needs ~50 s cold, and Render can take another 30-60 s to wake up. */
const META_TIMEOUT_MS = 150_000;
/** A snapshot from the backup model expires quickly in the browser too (the backend keeps it ~10 min). */
export const DEGRADED_META_MAX_AGE_MS = 10 * 60 * 1000;

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

  /** Returns the browser-cached meta when it is fresh; `refresh` skips that and asks the backend. */
  async meta(refresh = false): Promise<Meta> {
    if (!refresh) {
      const cached = this.readCachedMeta();
      if (cached) return cached;
    }
    try {
      const url = `${this.base}/genshin/meta${refresh ? '?refresh=1' : ''}`;
      const meta = await firstValueFrom(this.http.post<Meta>(url, {}).pipe(timeout(META_TIMEOUT_MS)));
      this.writeCachedMeta(meta);
      return meta;
    } catch (e) {
      throw this.toError(e, 'No se pudo obtener el meta ahora mismo.');
    }
  }

  /** Last meta saved in this browser, even if stale (for showing something while a refresh runs). */
  readCachedMeta(maxAgeMs = META_MAX_AGE_MS): Meta | null {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (!raw) return null;
      const meta = JSON.parse(raw) as Meta;
      const age = Date.now() - meta.fetchedAt * 1000;
      const limit = meta.degraded ? Math.min(maxAgeMs, DEGRADED_META_MAX_AGE_MS) : maxAgeMs;
      return Array.isArray(meta.teams) && age < limit ? meta : null;
    } catch {
      return null;
    }
  }

  private writeCachedMeta(meta: Meta): void {
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
