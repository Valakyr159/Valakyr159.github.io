import { Component, inject, signal, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { GUIDES, GuideTab } from '../../core/data/guides-data';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-guide-viewer',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (guide(); as g) {
      <div class="pt-20 h-screen max-h-screen flex flex-col overflow-hidden">

        <!-- Compact header: back link + title + tabs, all on one row -->
        <div class="flex-shrink-0 border-b px-3 py-2 bg-white/50 dark:bg-[#0E1A2E]/50 backdrop-blur-md" style="border-color: var(--border)">
          <div class="max-w-7xl mx-auto flex items-center gap-3">
            <a
              routerLink="/projects"
              class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style="color: var(--text-secondary)"
              aria-label="Volver a proyectos"
              title="Volver a proyectos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </a>

            <h1 class="font-display font-bold text-sm sm:text-base truncate shrink-0" style="max-width: 40vw">{{ g.title }}</h1>

            <div class="ml-auto flex gap-1.5 overflow-x-auto" role="tablist" [attr.aria-label]="g.title">
              @for (tab of g.tabs; track tab.id) {
                <button
                  type="button"
                  role="tab"
                  class="tab-btn"
                  [id]="'tabbtn-' + tab.id"
                  [attr.aria-selected]="activeTabId() === tab.id"
                  [attr.aria-controls]="'panel-' + tab.id"
                  [attr.title]="tab.sub || tab.label"
                  [tabIndex]="activeTabId() === tab.id ? 0 : -1"
                  [class.tab-btn-active]="activeTabId() === tab.id"
                  (click)="selectTab(tab)"
                  (keydown)="onTabKeydown($event, tab)"
                >
                  <span class="mr-1">{{ tab.icon }}</span>{{ tab.label }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Panels -->
        <div class="flex-1 w-full relative min-h-0" style="background: var(--bg-base)">
          @for (tab of g.tabs; track tab.id) {
            @if (loadedTabIds().has(tab.id)) {
              <div
                role="tabpanel"
                [id]="'panel-' + tab.id"
                [attr.aria-labelledby]="'tabbtn-' + tab.id"
                [hidden]="activeTabId() !== tab.id"
                class="absolute inset-0"
              >
                <iframe
                  [id]="'iframe-' + tab.id"
                  [src]="safeUrl(tab)"
                  [title]="g.title + ' — ' + tab.label"
                  class="w-full h-full border-0 block"
                ></iframe>
              </div>
            }
          }
        </div>
      </div>
    } @else {
      <div class="pt-28 min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h1 class="font-display font-bold text-2xl mb-2">Guía no encontrada</h1>
          <a routerLink="/projects" class="underline" style="color: var(--accent-indigo)">Volver a proyectos</a>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .tab-btn {
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 6px 12px;
      font-weight: 700;
      font-size: 12.5px;
      color: var(--text-secondary);
      transition: 0.15s;
      font-family: inherit;
    }
    .tab-btn:focus-visible {
      outline: 2px solid var(--accent-indigo);
      outline-offset: 2px;
    }
    .tab-btn-active {
      background: var(--accent-gradient);
      color: white;
      border-color: transparent;
    }
  `],
})
export class GuideViewerComponent {
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private theme = inject(ThemeService);

  private slug = toSignal(
    this.route.paramMap.pipe(map(params => params.get('slug') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('slug') ?? '' }
  );

  guide = computed(() => GUIDES[this.slug()] ?? null);

  activeTabId = signal<string>('');
  loadedTabIds = signal<Set<string>>(new Set());
  private urlCache = new Map<string, SafeResourceUrl>();

  constructor() {
    const g = this.guide();
    if (g && g.tabs.length) {
      this.selectTab(g.tabs[0]);
    }

    // Push live theme changes into every mounted guide iframe (the guide's
    // own script listens for this and flips its data-theme attribute).
    effect(() => {
      const themeValue = this.theme.isDark() ? 'dark' : 'light';
      const loaded = this.loadedTabIds();
      for (const id of loaded) {
        const iframe = document.getElementById('iframe-' + id) as HTMLIFrameElement | null;
        iframe?.contentWindow?.postMessage({ type: 'kh-guide-theme', value: themeValue }, window.location.origin);
      }
    });
  }

  selectTab(tab: GuideTab): void {
    this.activeTabId.set(tab.id);
    if (!this.loadedTabIds().has(tab.id)) {
      this.loadedTabIds.update(set => new Set(set).add(tab.id));
    }
  }

  onTabKeydown(event: KeyboardEvent, tab: GuideTab): void {
    const g = this.guide();
    if (!g || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')) return;
    event.preventDefault();
    const idx = g.tabs.findIndex(t => t.id === tab.id);
    const nextIdx = (idx + (event.key === 'ArrowRight' ? 1 : -1) + g.tabs.length) % g.tabs.length;
    const next = g.tabs[nextIdx];
    this.selectTab(next);
    queueMicrotask(() => document.getElementById('tabbtn-' + next.id)?.focus());
  }

  safeUrl(tab: GuideTab): SafeResourceUrl {
    let url = this.urlCache.get(tab.id);
    if (!url) {
      const themeParam = this.theme.isDark() ? 'dark' : 'light';
      const sep = tab.src.includes('?') ? '&' : '?';
      url = this.sanitizer.bypassSecurityTrustResourceUrl(tab.src + sep + 'theme=' + themeParam);
      this.urlCache.set(tab.id, url);
    }
    return url;
  }
}
