import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const service = TestBed.inject(I18nService);
    expect(service).toBeTruthy();
  });

  it('defaults to English', () => {
    const service = TestBed.inject(I18nService);
    expect(service.currentLang()).toBe('en');
    expect(service.t().nav.home).toBe('Home');
  });

  it('restores a saved language preference', () => {
    localStorage.setItem('lang', 'es');
    const service = TestBed.inject(I18nService);
    expect(service.currentLang()).toBe('es');
    expect(service.t().nav.home).toBe('Inicio');
  });

  it('ignores an invalid saved language and keeps the default', () => {
    localStorage.setItem('lang', 'fr');
    const service = TestBed.inject(I18nService);
    expect(service.currentLang()).toBe('en');
  });

  it('toggle() switches between en and es and persists it', () => {
    const service = TestBed.inject(I18nService);
    service.toggle();
    expect(service.currentLang()).toBe('es');
    expect(localStorage.getItem('lang')).toBe('es');

    service.toggle();
    expect(service.currentLang()).toBe('en');
  });

  it('setLang() sets an explicit language', () => {
    const service = TestBed.inject(I18nService);
    service.setLang('es');
    expect(service.currentLang()).toBe('es');
    expect(localStorage.getItem('lang')).toBe('es');
  });
});
