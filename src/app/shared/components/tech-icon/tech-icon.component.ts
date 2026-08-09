import { Component, Input } from '@angular/core';
import { getTechIcon } from '../../../core/data/tech-icons';

@Component({
  selector: 'app-tech-icon',
  standalone: true,
  template: `
    @if (icon; as ic) {
      <svg
        viewBox="0 0 24 24"
        width="12"
        height="12"
        fill="currentColor"
        class="inline-block shrink-0"
        role="img"
        [attr.aria-label]="ic.title"
      >
        <path [attr.d]="ic.path" />
      </svg>
    }
  `,
})
export class TechIconComponent {
  @Input({ required: true }) name!: string;

  get icon() {
    return getTechIcon(this.name);
  }
}
