import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeKey = 'theme';
  private defaultTheme = 'light';

  constructor() {
    const storedTheme = localStorage.getItem(this.themeKey);
    if (!storedTheme) {
      this.setTheme(this.defaultTheme);
    }
  }

  get currentTheme(): string {
    return localStorage.getItem(this.themeKey) || this.defaultTheme;
  }

  toggleTheme(): void {
    const currentTheme = this.currentTheme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private setTheme(theme: string): void {
    localStorage.setItem(this.themeKey, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}