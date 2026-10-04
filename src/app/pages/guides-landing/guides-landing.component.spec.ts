import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GuidesLandingComponent } from './guides-landing.component';

describe('GuidesLandingComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(GuidesLandingComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('shows series collapsed, and expands to the games list on click', () => {
    const fixture = setup();
    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('button.series-btn') as HTMLButtonElement;

    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(el.textContent).not.toContain('Dream Drop Distance');

    btn.click();
    fixture.detectChanges();

    expect(btn.getAttribute('aria-expanded')).toBe('true');
    const hrefs = Array.from(el.querySelectorAll('a')).map(a => a.getAttribute('href'));
    expect(hrefs).toContain('/guides/kingdom-hearts/dream-drop-distance');
    expect(hrefs).toContain('/guides/kingdom-hearts/birth-by-sleep');
  });
});
