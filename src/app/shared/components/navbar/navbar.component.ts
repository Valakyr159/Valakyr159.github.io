import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { I18nService } from '../../../core/services/i18n.service';
import { CV_DATA } from '../../../core/data/cv-data';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      [class.nav-scrolled]="scrolled()"
      role="navigation"
      aria-label="Main navigation"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 md:h-20">
          <!-- Logo -->
          <a
            routerLink="/"
            class="flex items-center gap-3 group"
            aria-label="Go to homepage"
          >
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-white text-sm"
              style="background: var(--accent-gradient)"
            >
              {{ initials }}
            </div>
            <span
              class="font-display font-semibold text-lg hidden sm:block"
              style="color: var(--text-primary)"
            >
              {{ shortName }}
            </span>
          </a>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-6">
            @for (link of navLinks(); track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="nav-active"
                [routerLinkActiveOptions]="{ exact: link.exact }"
                class="nav-link relative font-body text-sm font-medium transition-colors duration-200"
                style="color: var(--text-secondary)"
                [attr.aria-current]="null"
              >
                {{ link.label }}
              </a>
            }

            <div class="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>

            <!-- Language toggle -->
            <button
              (click)="i18n.toggle()"
              class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 font-medium text-xs"
              style="background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-primary)"
              [attr.aria-label]="i18n.t().nav.switchLang"
            >
              {{ i18n.t().nav.langCode }}
            </button>

            <!-- Theme toggle -->
            <button
              (click)="toggleTheme()"
              class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style="background: var(--bg-elevated); border: 1px solid var(--border)"
              [attr.aria-label]="i18n.t().nav.switchTheme"
              [class.theme-toggle-spin]="isSpinning()"
            >
              @if (theme.isDark()) {
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-cyan)"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-violet)"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
          </div>

          <!-- Mobile: toggles + hamburger -->
          <div class="flex items-center gap-2 md:hidden">
            <!-- Language toggle -->
            <button
              (click)="i18n.toggle()"
              class="w-9 h-9 rounded-full flex items-center justify-center font-medium text-xs"
              style="background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-primary)"
              [attr.aria-label]="i18n.t().nav.switchLang"
            >
              {{ i18n.t().nav.langCode }}
            </button>

            <!-- Theme toggle -->
            <button
              (click)="toggleTheme()"
              class="w-9 h-9 rounded-full flex items-center justify-center"
              style="background: var(--bg-elevated); border: 1px solid var(--border)"
              [attr.aria-label]="i18n.t().nav.switchTheme"
              [class.theme-toggle-spin]="isSpinning()"
            >
              @if (theme.isDark()) {
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-cyan)"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-violet)"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>

            <button
              (click)="toggleMobile()"
              class="w-9 h-9 rounded-lg flex items-center justify-center"
              style="background: var(--bg-elevated); border: 1px solid var(--border)"
              aria-label="Toggle mobile menu"
              [attr.aria-expanded]="mobileOpen()"
            >
              @if (!mobileOpen()) {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-primary)"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-primary)"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Drawer -->
      @if (mobileOpen()) {
        <div
          class="md:hidden border-t transition-all duration-300"
          style="background: var(--bg-surface); border-color: var(--border)"
        >
          <div class="px-4 py-4 space-y-2">
            @for (link of navLinks(); track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="nav-active"
                [routerLinkActiveOptions]="{ exact: link.exact }"
                (click)="mobileOpen.set(false)"
                class="block px-4 py-3 rounded-lg font-body text-sm font-medium transition-colors duration-200"
                style="color: var(--text-secondary)"
              >
                {{ link.label }}
              </a>
            }
          </div>
        </div>
      }
    </nav>
  `,
  styles: [`
    .nav-link:hover {
      color: var(--text-primary) !important;
    }

    .nav-active {
      color: var(--text-primary) !important;
    }

    .nav-active::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--accent-gradient);
      border-radius: 1px;
    }

    :host {
      display: block;
    }
  `],
})
export class NavbarComponent implements OnInit, OnDestroy {
  readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);
  readonly initials = CV_DATA.personal.initials;
  readonly shortName = CV_DATA.personal.fullName.split(' ').slice(0, 2).join(' ');

  scrolled = signal(false);
  mobileOpen = signal(false);
  isSpinning = signal(false);

  navLinks = computed(() => [
    { path: '/', label: this.i18n.t().nav.home, exact: true },
    { path: '/projects', label: this.i18n.t().nav.projects, exact: false },
    { path: '/chatbot', label: this.i18n.t().nav.chatbot, exact: false },
  ]);

  private scrollHandler: (() => void) | null = null;

  ngOnInit(): void {
    this.scrollHandler = () => {
      this.scrolled.set(window.scrollY > 50);
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  toggleTheme(): void {
    this.isSpinning.set(true);
    this.theme.toggle();
    setTimeout(() => this.isSpinning.set(false), 500);
  }

  toggleMobile(): void {
    this.mobileOpen.update(v => !v);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.mobileOpen.set(false);
  }
}
