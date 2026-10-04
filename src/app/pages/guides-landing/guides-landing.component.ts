import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { GUIDE_SERIES } from '../../core/data/guides-data';
import { I18nService } from '../../core/services/i18n.service';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-guides-landing',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent],
  template: `
    <div class="pt-28 pb-20 min-h-screen">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div class="mb-8">
          <app-breadcrumb [items]="crumbs()" [label]="i18n.t().guides.breadcrumbLabel" />
        </div>

        <div class="mb-12">
          <h1 class="font-display font-bold text-4xl sm:text-5xl mb-6">
            {{ i18n.t().guides.heroTitle }} <span class="gradient-text">{{ i18n.t().guides.heroHighlight }}</span>
          </h1>
          <p class="font-body text-lg leading-relaxed mb-3" style="color: var(--text-secondary)">
            {{ i18n.t().guides.heroText }}
          </p>
          <p class="font-body text-base leading-relaxed" style="color: var(--text-muted)">
            {{ i18n.t().guides.heroAiText }}
          </p>
        </div>

        <h2 class="font-display font-bold text-xl mb-4">{{ i18n.t().guides.seriesList }}</h2>

        <div class="flex flex-col gap-4">
          @for (s of series; track s.slug) {
            <section class="rounded-2xl border overflow-hidden" style="border-color: var(--border); background: var(--bg-surface)">
              <h3>
                <button
                  type="button"
                  class="series-btn w-full flex items-center gap-4 px-5 py-4 text-left"
                  [id]="'series-btn-' + s.slug"
                  [attr.aria-expanded]="isOpen(s.slug)"
                  [attr.aria-controls]="'series-panel-' + s.slug"
                  (click)="toggle(s.slug)"
                >
                  <span class="text-3xl" aria-hidden="true">{{ s.icon }}</span>
                  <span class="flex-1 min-w-0">
                    <span class="block font-display font-bold text-lg">{{ s.title }}</span>
                    <span class="block text-sm" style="color: var(--text-secondary)">{{ s.subtitle }}</span>
                  </span>
                  <span class="text-xs shrink-0" style="color: var(--text-muted)">{{ s.games.length }} {{ i18n.t().guides.guidesCount }}</span>
                  <svg class="chev shrink-0" [class.chev-open]="isOpen(s.slug)" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </h3>

              @if (isOpen(s.slug)) {
                <ul
                  class="border-t px-3 py-3 grid gap-2 sm:grid-cols-2"
                  style="border-color: var(--border)"
                  role="region"
                  [id]="'series-panel-' + s.slug"
                  [attr.aria-labelledby]="'series-btn-' + s.slug"
                >
                  @for (g of s.games; track g.slug) {
                    <li>
                      <a
                        [routerLink]="['/guides', s.slug, g.slug]"
                        class="game-link flex items-center gap-3 rounded-xl px-4 py-3"
                      >
                        <span class="text-2xl" aria-hidden="true">{{ g.icon }}</span>
                        <span class="min-w-0">
                          <span class="block font-semibold">{{ g.title }}</span>
                          @if (g.sub) {
                            <span class="block text-sm" style="color: var(--text-secondary)">{{ g.sub }}</span>
                          }
                        </span>
                      </a>
                    </li>
                  }
                </ul>
              }
            </section>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .series-btn { cursor: pointer; background: transparent; color: inherit; font: inherit; }
    .series-btn:hover { background: rgba(127,127,127,0.06); }
    .series-btn:focus-visible, .game-link:focus-visible { outline: 2px solid var(--accent-indigo); outline-offset: -2px; }
    .chev { transition: transform 0.2s; color: var(--text-secondary); }
    .chev-open { transform: rotate(180deg); }
    .game-link { border: 1px solid var(--border); transition: 0.15s; }
    .game-link:hover { border-color: var(--accent-indigo); background: rgba(127,127,127,0.06); }
  `],
})
export class GuidesLandingComponent {
  i18n = inject(I18nService);
  private route = inject(ActivatedRoute);

  series = GUIDE_SERIES;

  private openParam = toSignal(
    this.route.queryParamMap.pipe(map(p => p.get('open'))),
    { initialValue: this.route.snapshot.queryParamMap.get('open') }
  );

  /** Open series slugs. Seeded from `?open=` so the breadcrumb can return here expanded. */
  private openSet = signal<Set<string>>(new Set());

  crumbs = computed(() => [{ label: this.i18n.t().guides.root }]);

  constructor() {
    effect(() => {
      const slug = this.openParam();
      if (slug && GUIDE_SERIES.some(s => s.slug === slug)) {
        this.openSet.update(set => new Set(set).add(slug));
      }
    });
  }

  isOpen(slug: string): boolean {
    return this.openSet().has(slug);
  }

  toggle(slug: string): void {
    this.openSet.update(set => {
      const next = new Set(set);
      if (!next.delete(slug)) next.add(slug);
      return next;
    });
  }
}
