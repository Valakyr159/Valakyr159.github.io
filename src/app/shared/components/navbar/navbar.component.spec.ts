import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders Home, Projects and Chatbot nav links', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Home');
    expect(text).toContain('Projects');
    expect(text).toContain('RAG Chatbot');
  });

  it('toggleMobile() flips the mobileOpen signal', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.mobileOpen()).toBe(false);
    component.toggleMobile();
    expect(component.mobileOpen()).toBe(true);
  });

  it('onEscape() closes the mobile menu', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.mobileOpen.set(true);
    component.onEscape();
    expect(component.mobileOpen()).toBe(false);
  });

  it('toggleTheme() delegates to ThemeService', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const initial = component.theme.isDark();

    component.toggleTheme();
    expect(component.theme.isDark()).toBe(!initial);
  });
});
