import { Component, computed, input, signal } from '@angular/core';
import { Element, RosterCharacter } from './genshin.models';

export const ELEMENT_COLOR: Record<Element, string> = {
  Pyro: '#ef4444', Hydro: '#3b82f6', Anemo: '#2dd4bf', Electro: '#a855f7',
  Cryo: '#67e8f9', Geo: '#eab308', Dendro: '#84cc16',
};
export const ENKA_UI = 'https://enka.network/ui/';

/**
 * Character portrait from Enka's CDN. Falls back to the small side icon (a few
 * characters use a different file name for the full icon) and finally to the
 * initial on an element-colored disc, so the grid never shows broken images.
 */
@Component({
  selector: 'app-character-avatar',
  standalone: true,
  template: `
    <span
      class="avatar relative inline-block shrink-0 rounded-full overflow-hidden"
      [class.avatar-dim]="dim()"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.--ring]="color()"
      [style.box-shadow]="'0 0 0 2px ' + ringColor()"
      [style.background]="'linear-gradient(160deg, ' + color() + '55, ' + color() + '11)'"
    >
      @if (stage() < 2) {
        <img
          [src]="url()"
          [alt]="character().name.es"
          loading="lazy"
          decoding="async"
          class="w-full h-full object-cover"
          (error)="onError()"
        />
      } @else {
        <span class="w-full h-full flex items-center justify-center font-bold" [style.font-size.px]="size() * 0.4" [style.color]="color()">
          {{ character().name.es.charAt(0) }}
        </span>
      }
    </span>
  `,
  styles: [`
    :host { display: inline-block; line-height: 0; }
    .avatar { transition: filter .15s, opacity .15s; }
    .avatar-dim { filter: grayscale(1); opacity: .35; }
  `],
})
export class CharacterAvatarComponent {
  character = input.required<RosterCharacter>();
  size = input(56);
  /** Not owned / not available: shown in grayscale. */
  dim = input(false);
  /** Overrides the ring color (e.g. green owned, red missing). Defaults to the element color. */
  ring = input<string | null>(null);

  protected stage = signal(0);
  protected color = computed(() => ELEMENT_COLOR[this.character().element]);
  protected ringColor = computed(() => this.ring() ?? this.color());
  protected url = computed(() => ENKA_UI + (this.stage() === 0 ? this.character().icon : this.character().sideIcon) + '.png');

  protected onError(): void {
    this.stage.update(s => s + 1);
  }
}
