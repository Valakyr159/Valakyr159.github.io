import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark', 'light');
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const service = TestBed.inject(ThemeService);
    expect(service).toBeTruthy();
  });

  it('defaults to dark mode when nothing is saved', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('respects a saved light preference', () => {
    localStorage.setItem('theme', 'light');
    const service = TestBed.inject(ThemeService);
    expect(service.isDark()).toBe(false);
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('toggle() flips the theme and persists it', () => {
    const service = TestBed.inject(ThemeService);
    const initial = service.isDark();

    service.toggle();
    expect(service.isDark()).toBe(!initial);
    expect(localStorage.getItem('theme')).toBe(!initial ? 'dark' : 'light');

    service.toggle();
    expect(service.isDark()).toBe(initial);
  });
});
