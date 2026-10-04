import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreadcrumbComponent } from './breadcrumb.component';

describe('BreadcrumbComponent', () => {
  function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(BreadcrumbComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Guías', link: '/guides' },
      { label: 'Kingdom Hearts', link: '/guides', queryParams: { open: 'kingdom-hearts' } },
      { label: 'Dream Drop Distance' },
    ]);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('links every item except the last, which is the current page', () => {
    const el = render();
    const links = el.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[1].getAttribute('href')).toBe('/guides?open=kingdom-hearts');
    const current = el.querySelector('[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('Dream Drop Distance');
  });
});
