import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'theme';
  isDark = signal(true);

  constructor() {
    const saved = localStorage.getItem(this.KEY);
    this.isDark.set(saved !== 'light');
    this.apply();
  }

  toggle(): void {
    this.isDark.update(v => !v);
    this.apply();
    localStorage.setItem(this.KEY, this.isDark() ? 'dark' : 'light');
  }

  private apply(): void {
    const isDark = this.isDark();
    document.documentElement.classList.toggle('light', !isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }
}
