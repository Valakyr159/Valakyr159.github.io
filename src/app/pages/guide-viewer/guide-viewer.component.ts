import { Component, inject, computed, effect, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { findGame } from '../../core/data/guides-data';
import { I18nService } from '../../core/services/i18n.service';
import { ThemeService } from '../../core/services/theme.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';

const IFRAME_ID = 'guide-iframe';

@Component({
  selector: 'app-guide-viewer',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent],
  template: `
    @if (iframeSrc(); as src) {
      <div class="pt-20 h-screen max-h-screen flex flex-col overflow-hidden">

        <div class="flex-shrink-0 border-b px-4 py-2.5 bg-white/50 dark:bg-[#0E1A2E]/50 backdrop-blur-md" style="border-color: var(--border)">
          <div class="max-w-7xl mx-auto">
            <app-breadcrumb [items]="crumbs()" [label]="i18n.t().guides.breadcrumbLabel" />
          </div>
        </div>

        <div class="flex-1 w-full relative min-h-0" style="background: var(--bg-base)">
          <iframe
            [id]="iframeId"
            [src]="src"
            [title]="iframeTitle()"
            class="absolute inset-0 w-full h-full border-0 block"
          ></iframe>
        </div>
      </div>
    } @else {
      <div class="pt-28 min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h1 class="font-display font-bold text-2xl mb-2">{{ i18n.t().guides.notFoundTitle }}</h1>
          <a routerLink="/guides" class="underline" style="color: var(--accent-indigo)">{{ i18n.t().guides.backToGuides }}</a>
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`],
})
export class GuideViewerComponent {
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private theme = inject(ThemeService);
  private titleService = inject(Title);
  i18n = inject(I18nService);

  readonly iframeId = IFRAME_ID;

  private params = toSignal(
    this.route.paramMap.pipe(map(p => ({ series: p.get('series'), game: p.get('game') }))),
    { initialValue: { series: this.route.snapshot.paramMap.get('series'), game: this.route.snapshot.paramMap.get('game') } }
  );

  /** Only iframe-type games render here; 'app' games have their own route. */
  private entry = computed(() => {
    const found = findGame(this.params().series, this.params().game);
    return found && found.game.kind === 'iframe' && found.game.src ? found : null;
  });

  crumbs = computed<BreadcrumbItem[]>(() => {
    const e = this.entry();
    if (!e) return [];
    return [
      { label: this.i18n.t().guides.root, link: '/guides' },
      { label: e.series.title, link: '/guides', queryParams: { open: e.series.slug } },
      { label: e.game.title },
    ];
  });

  iframeTitle = computed(() => {
    const e = this.entry();
    return e ? `${e.series.title} — ${e.game.title}` : '';
  });

  // The theme is read untracked on purpose: later theme changes reach the
  // iframe through postMessage, so they must not reload it with a new URL.
  iframeSrc = computed<SafeResourceUrl | null>(() => {
    const e = this.entry();
    if (!e?.game.src) return null;
    const src = e.game.src;
    const sep = src.includes('?') ? '&' : '?';
    const themeParam = untracked(() => this.theme.isDark()) ? 'dark' : 'light';
    return this.sanitizer.bypassSecurityTrustResourceUrl(src + sep + 'theme=' + themeParam);
  });

  constructor() {
    effect(() => {
      const e = this.entry();
      if (e) this.titleService.setTitle(`${e.game.title} · ${e.series.title} · Javier Morón`);
    });

    // Push live theme changes into the mounted guide iframe (the guide's own
    // script listens for this and flips its data-theme attribute).
    effect(() => {
      const themeValue = this.theme.isDark() ? 'dark' : 'light';
      const iframe = document.getElementById(IFRAME_ID) as HTMLIFrameElement | null;
      iframe?.contentWindow?.postMessage({ type: 'kh-guide-theme', value: themeValue }, window.location.origin);
    });
  }
}
