import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  /** Omit on the current (last) page. */
  link?: string;
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav [attr.aria-label]="label()">
      <ol class="flex items-center flex-wrap gap-1.5 text-sm" style="color: var(--text-secondary)">
        @for (item of items(); track $index; let last = $last) {
          <li class="flex items-center gap-1.5 min-w-0">
            @if (item.link && !last) {
              <a
                [routerLink]="item.link"
                [queryParams]="item.queryParams"
                class="breadcrumb-link truncate"
              >{{ item.label }}</a>
            } @else {
              <span class="font-semibold truncate" style="color: var(--text-primary)" aria-current="page">{{ item.label }}</span>
            }
            @if (!last) {
              <span aria-hidden="true" class="opacity-50">/</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-link { text-decoration: underline; text-underline-offset: 3px; text-decoration-color: transparent; transition: 0.15s; }
    .breadcrumb-link:hover { color: var(--accent-indigo); text-decoration-color: currentColor; }
    .breadcrumb-link:focus-visible { outline: 2px solid var(--accent-indigo); outline-offset: 2px; border-radius: 4px; }
  `],
})
export class BreadcrumbComponent {
  items = input.required<BreadcrumbItem[]>();
  label = input('Breadcrumb');
}
