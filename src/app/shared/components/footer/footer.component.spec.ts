import { TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { CV_DATA } from '../../../core/data/cv-data';

describe('FooterComponent', () => {
  it('should create', async () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the current year and full name from CV_DATA', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain(String(new Date().getFullYear()));
    expect(text).toContain(CV_DATA.personal.fullName);
  });

  it('links to the GitHub and LinkedIn profiles from CV_DATA', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('a')
    );

    expect(links.some(a => a.getAttribute('href') === CV_DATA.personal.github)).toBe(true);
    expect(links.some(a => a.getAttribute('href') === CV_DATA.personal.linkedin)).toBe(true);
  });
});
