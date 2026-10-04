import { Injectable, computed, effect, signal } from '@angular/core';
import { EnkaProfile, OwnedCharacter } from './genshin.models';

const KEY = 'genshin.account.v1';

interface Stored {
  uid: string | null;
  nickname: string | null;
  owned: OwnedCharacter[];
  fetchedAt: number | null;
}

/**
 * The user's account: UID, the characters they own and when Enka was last
 * read. Persisted in localStorage (per browser). Every storage access is
 * guarded: it can throw or come back empty in private windows.
 */
@Injectable({ providedIn: 'root' })
export class GenshinAccountService {
  uid = signal<string | null>(null);
  nickname = signal<string | null>(null);
  fetchedAt = signal<number | null>(null);
  private ownedList = signal<OwnedCharacter[]>([]);

  owned = computed(() => new Map(this.ownedList().map(o => [o.id, o])));
  count = computed(() => this.ownedList().length);

  constructor() {
    this.restore();
    effect(() => this.persist({
      uid: this.uid(), nickname: this.nickname(), owned: this.ownedList(), fetchedAt: this.fetchedAt(),
    }));
  }

  has(id: number): boolean {
    return this.owned().has(id);
  }

  /** Marks or unmarks a character by hand (the manual checklist). */
  toggle(id: number): void {
    this.ownedList.update(list =>
      list.some(o => o.id === id) ? list.filter(o => o.id !== id) : [...list, { id, source: 'manual' }]);
  }

  /**
   * Merges an Enka showcase read. Showcase data (level, constellation) wins
   * over manual marks. Characters that left the showcase stay owned: the
   * showcase is only a window on the account, not the whole roster.
   */
  importProfile(profile: EnkaProfile): void {
    this.uid.set(profile.uid);
    this.nickname.set(profile.nickname);
    this.fetchedAt.set(Date.now());
    this.ownedList.update(list => {
      const byId = new Map(list.map(o => [o.id, o]));
      for (const c of profile.characters) {
        byId.set(c.id, { id: c.id, level: c.level, cons: c.cons, source: 'enka' });
      }
      return [...byId.values()];
    });
  }

  forget(): void {
    this.uid.set(null);
    this.nickname.set(null);
    this.fetchedAt.set(null);
    this.ownedList.set([]);
  }

  private restore(): void {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Partial<Stored>;
      this.uid.set(typeof data.uid === 'string' ? data.uid : null);
      this.nickname.set(typeof data.nickname === 'string' ? data.nickname : null);
      this.fetchedAt.set(typeof data.fetchedAt === 'number' ? data.fetchedAt : null);
      if (Array.isArray(data.owned)) {
        this.ownedList.set(data.owned.filter(o => o && Number.isInteger(o.id) && (o.source === 'enka' || o.source === 'manual')));
      }
    } catch { /* corrupt or unavailable storage: start empty */ }
  }

  private persist(data: Stored): void {
    try {
      if (!data.uid && !data.owned.length) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, JSON.stringify(data));
    } catch { /* storage unavailable: the session still works, it just won't be remembered */ }
  }
}
