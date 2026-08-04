import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle theme correctly', () => {
    const currentTheme = service.currentTheme;
    service.toggleTheme();
    expect(service.currentTheme).not.toBe(currentTheme);
    service.toggleTheme();
    expect(service.currentTheme).toBe(currentTheme);
  });
});