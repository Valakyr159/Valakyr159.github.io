import { NgTemplateOutlet } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { CharacterAvatarComponent, ELEMENT_COLOR } from './character-avatar.component';
import { accountScore, EngineContext, evaluatePull, pullCandidates, rankPulls, scoreAllTeams } from './genshin-engine';
import { GenshinAccountService } from './genshin-account.service';
import { GenshinApiService, metaIsFresh } from './genshin-api.service';
import { buildChatContext, ChatMessage, parseBold } from './genshin-chat';
import { GenshinChatService } from './genshin-chat.service';
import { Element, Meta, PullCandidateResult, RosterCharacter, ScoredTeam } from './genshin.models';

type Tab = 'account' | 'teams' | 'pull' | 'chat';
type Notice = { kind: 'ok' | 'warn' | 'error'; text: string };

const ELEMENTS = Object.keys(ELEMENT_COLOR) as Element[];
/** While the meta updates the page asks again every few seconds; 150 polls is about 5 minutes. */
const META_POLL_MS = 2000;
const MAX_META_POLLS = 150;
const GREEN = '#4ade80';
const AMBER = '#fbbf24';
const RED = '#f87171';

@Component({
  selector: 'app-genshin',
  standalone: true,
  imports: [BreadcrumbComponent, CharacterAvatarComponent, NgTemplateOutlet],
  template: `
    <div class="pt-28 pb-20 min-h-screen">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div class="mb-6"><app-breadcrumb [items]="crumbs" label="Ruta de navegación" /></div>

        <h1 class="font-display font-bold text-3xl sm:text-4xl mb-2">Genshin Impact · <span class="gradient-text">Mi cuenta</span></h1>
        <p class="mb-6 max-w-3xl" style="color: var(--text-secondary)">
          Importa tu vitrina con el UID, marca el resto de tus personajes y compara con el meta actual:
          qué equipos puedes armar, con quién cubrir a los que te faltan y a quién conviene sacar.
        </p>

        <div role="tablist" aria-label="Secciones" class="flex gap-2 mb-6 overflow-x-auto">
          @for (t of tabs; track t.id) {
            <button type="button" role="tab" class="tab-btn" [class.tab-btn-active]="tab() === t.id"
              [attr.aria-selected]="tab() === t.id" (click)="select(t.id)">{{ t.label }}</button>
          }
        </div>

        <!-- ======================= CUENTA ======================= -->
        @if (tab() === 'account') {
          <section class="panel p-5 mb-6">
            <h2 class="font-display font-bold text-lg mb-1">1 · Tu cuenta</h2>
            <p class="text-sm mb-4" style="color: var(--text-secondary)">
              Se lee la <strong>vitrina</strong> pública del juego (hasta 8 personajes, con nivel y constelaciones) vía Enka.Network.
              No se pide ninguna contraseña. El UID y tus marcas se guardan solo en este navegador.
            </p>
            <form class="flex flex-wrap gap-2 items-start" (submit)="$event.preventDefault(); importUid()">
              <div>
                <label for="uid" class="sr-only">UID de Genshin Impact</label>
                <input id="uid" class="field" inputmode="numeric" maxlength="10" placeholder="UID (9-10 dígitos)"
                  [value]="uidInput()" (input)="uidInput.set(asValue($event))" [attr.aria-invalid]="uidInput() !== '' && !uidValid()" />
              </div>
              <button type="submit" class="btn" [disabled]="!uidValid() || importing()">
                {{ importing() ? 'Leyendo…' : (account.uid() ? 'Actualizar' : 'Importar') }}
              </button>
              @if (account.uid()) {
                <button type="button" class="btn btn-ghost" (click)="forget()">Olvidar cuenta</button>
              }
            </form>
            @if (account.uid()) {
              <p class="text-sm mt-3" style="color: var(--text-secondary)">
                UID {{ account.uid() }}@if (account.nickname()) { · {{ account.nickname() }}}
                @if (account.fetchedAt(); as at) { · leído {{ formatDate(at) }} }
              </p>
            }
            @if (notice(); as n) {
              <p class="text-sm mt-3 notice" [class.notice-warn]="n.kind === 'warn'" [class.notice-error]="n.kind === 'error'" role="status">{{ n.text }}</p>
            }
          </section>

          <section class="panel p-5">
            <h2 class="font-display font-bold text-lg mb-1">2 · Tus personajes <span class="text-sm font-normal" style="color: var(--text-secondary)">({{ account.count() }} marcados)</span></h2>
            <p class="text-sm mb-4" style="color: var(--text-secondary)">
              La vitrina no trae todo tu roster: toca un personaje para marcarlo o desmarcarlo.
              Los de la vitrina llevan su nivel; de los marcados a mano no se conoce el nivel y se asume una calidad media.
            </p>
            <div class="flex flex-wrap gap-2 items-center mb-4">
              <label for="q" class="sr-only">Buscar personaje</label>
              <input id="q" class="field" type="search" placeholder="Buscar personaje" [value]="search()" (input)="search.set(asValue($event))" />
              <button type="button" class="chip" [class.chip-active]="elementFilter() === null" (click)="elementFilter.set(null)">Todos</button>
              @for (el of elements; track el) {
                <button type="button" class="chip" [class.chip-active]="elementFilter() === el" [style.--chip]="color(el)"
                  [attr.aria-pressed]="elementFilter() === el" (click)="elementFilter.set(elementFilter() === el ? null : el)">{{ el }}</button>
              }
            </div>

            @if (rosterError()) {
              <p class="notice notice-error" role="alert">{{ rosterError() }}</p>
            } @else if (!roster().length) {
              <p style="color: var(--text-secondary)">Cargando personajes…</p>
            } @else {
              <ul class="grid gap-3 grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
                @for (c of visibleRoster(); track c.id) {
                  <li>
                    <button type="button" class="char-btn" [attr.aria-pressed]="account.has(c.id)"
                      [attr.aria-label]="c.name.es + (account.has(c.id) ? ' (lo tienes)' : ' (no lo tienes)')"
                      (click)="account.toggle(c.id)">
                      <app-character-avatar [character]="c" [size]="64" [dim]="!account.has(c.id)" [ring]="account.has(c.id) ? green : null" />
                      <span class="char-name">{{ c.name.es }}</span>
                      @if (ownedInfo(c.id); as info) { <span class="char-sub">{{ info }}</span> }
                    </button>
                  </li>
                } @empty {
                  <li style="color: var(--text-secondary)">Ningún personaje coincide.</li>
                }
              </ul>
            }
          </section>
        }

        <!-- ======================= EQUIPOS / PULL: meta ======================= -->
        @if (tab() !== 'account') {
          <section class="panel p-4 mb-6" aria-live="polite">
            @if (metaPhase() !== 'idle') {
              <p role="status" class="flex items-center gap-3 text-sm" [class.mb-3]="meta()">
                <span class="spinner" aria-hidden="true"></span>
                @if (metaPhase() === 'connecting') {
                  <span>Conectando con el servidor… si estaba dormido puede tardar hasta un minuto ({{ elapsed() }} s).</span>
                } @else {
                  <span>Actualizando el meta con la información más reciente… ({{ elapsed() }} s).
                    @if (meta()) { Mientras tanto ves el último guardado. } @else { Suele tardar menos de un minuto. }</span>
                }
              </p>
            }
            @if (meta(); as m) {
              <p class="text-sm">
                Meta del parche <strong>{{ m.patch }}</strong> · {{ formatDate(m.fetchedAt * 1000) }}
                @if (metaNotice(); as n) { <br /><span class="txt-warn">{{ n }} Se muestra la última copia guardada.</span> }
                @if (m.degraded) { <br /><span class="txt-warn">Generado con un modelo de reserva: puede estar desactualizado y los banners no están verificados. Se reintentará con el modelo principal en unos minutos.</span> }
                <br />
                <span style="color: var(--text-secondary)">Fuentes leídas:
                  @for (s of m.sources; track s.url; let last = $last) {
                    <a [href]="s.url" target="_blank" rel="noopener noreferrer" class="underline">{{ s.title }}</a>@if (!last) {, }
                  }
                  · generado por IA a partir de esas páginas, puede contener errores.</span>
              </p>
            } @else if (metaPhase() === 'idle') {
              <div class="flex flex-wrap items-center gap-3">
                <p class="text-sm flex-1">{{ metaError() ?? 'Todavía no se ha cargado el meta.' }}</p>
                <button type="button" class="btn" (click)="loadMeta()">Reintentar</button>
              </div>
            }
          </section>
          @if (metaError() && meta()) { <p class="notice notice-error mb-4" role="alert">{{ metaError() }}</p> }
        }

        <!-- ======================= MEJORES EQUIPOS ======================= -->
        @if (tab() === 'teams' && meta()) {
          @if (!account.count()) {
            <p class="notice notice-warn mb-4">Aún no has marcado personajes: los equipos aparecen todos incompletos. Ve a «Mi cuenta».</p>
          }
          <p class="mb-4 text-sm" style="color: var(--text-secondary)">
            Puntuación estimada de 0 a 100 (100 = equipo S con todos al máximo). Tu nivel actual (media de tus {{ topN }} mejores equipos):
            <strong style="color: var(--text-primary)">{{ currentScore() }}</strong>.
          </p>
          <ul class="grid gap-4 md:grid-cols-2">
            @for (t of scored(); track t.team.name) {
              <li class="panel p-4">
                <ng-container *ngTemplateOutlet="teamCard; context: { $implicit: t }" />
              </li>
            }
          </ul>
        }

        <!-- ======================= ¿A QUIÉN SACAR? ======================= -->
        @if (tab() === 'pull' && meta()) {
          <p class="mb-4 text-sm" style="color: var(--text-secondary)">
            Cada barra es el % de mejora estimado de tus mejores equipos si consigues a ese personaje
            (a C0). Tu nivel actual: <strong style="color: var(--text-primary)">{{ currentScore() }}</strong>.
          </p>

          @if (bannerPulls().length) {
            <h2 class="font-display font-bold text-lg mb-2">Banners y novedades</h2>
            <ul class="grid gap-3 sm:grid-cols-2 mb-6">
              @for (r of bannerPulls(); track r.id) {
                <li><ng-container *ngTemplateOutlet="pullCard; context: { $implicit: r }" /></li>
              }
            </ul>
          }

          <h2 class="font-display font-bold text-lg mb-2">Los que más mejorarían tu cuenta</h2>
          <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            @for (r of topPulls(); track r.id) {
              <li><ng-container *ngTemplateOutlet="pullCard; context: { $implicit: r }" /></li>
            }
          </ul>

          <div class="panel p-4 mb-6">
            <label for="other" class="text-sm font-semibold block mb-2">Comparar otro personaje</label>
            <select id="other" class="field" (change)="selectPull(asNumber($event))">
              <option value="">Elige uno…</option>
              @for (c of unownedRoster(); track c.id) { <option [value]="c.id" [selected]="selectedPull() === c.id">{{ c.name.es }}</option> }
            </select>
          </div>

          @if (selectedResult(); as r) {
            <section class="panel p-5" aria-live="polite">
              <div class="flex items-center gap-4 mb-4">
                <app-character-avatar [character]="char(r.id)" [size]="72" />
                <div>
                  <h2 class="font-display font-bold text-xl">{{ char(r.id).name.es }}</h2>
                  <p class="text-sm" style="color: var(--text-secondary)">
                    {{ char(r.id).element }} · {{ char(r.id).weapon }} · {{ char(r.id).rarity }}★ —
                    <strong [class]="pctClass(r)">{{ pct(r) }}</strong>
                    @if (r.inMeta) { (de {{ currentScore() }} a {{ r.newScore }}) }
                  </p>
                </div>
              </div>
              @if (r.unlocked.length) {
                <h3 class="font-semibold mb-2">Equipos del meta con {{ char(r.id).name.es }}</h3>
                <ul class="grid gap-3 md:grid-cols-2">
                  @for (t of r.unlocked; track t.team.name) {
                    <li class="panel p-4"><ng-container *ngTemplateOutlet="teamCard; context: { $implicit: t }" /></li>
                  }
                </ul>
              } @else if (!r.inMeta) {
                <p class="notice notice-warn">
                  Ninguna de las fuentes consultadas tiene todavía datos de {{ char(r.id).name.es }} (puede ser muy reciente),
                  así que no se puede estimar cuánto mejoraría tu cuenta. Esto no significa que sea una mala opción.
                </p>
              } @else {
                <p style="color: var(--text-secondary)">Ningún equipo del meta actual lo incluye.</p>
              }
            </section>
          }
        }

        <!-- ======================= CHAT ======================= -->
        @if (tab() === 'chat' && meta()) {
          <section class="panel p-5" aria-label="Chat con IA">
            <p class="text-sm mb-4" style="color: var(--text-secondary)">
              Pregunta sobre tu cuenta. La IA recibe tus personajes, el meta y los números que ya calculó la página, y los explica: no calcula ella los porcentajes.
              @if (!account.count()) { <br /><strong class="txt-warn">Aún no has marcado personajes: sus respuestas serán genéricas.</strong> }
            </p>

            <div class="chat-log mb-4" role="log" aria-live="polite" aria-label="Conversación">
              @for (m of messages(); track $index) {
                <div class="msg" [class.msg-user]="m.role === 'user'">
                  <span class="sr-only">{{ m.role === 'user' ? 'Tú:' : 'IA:' }}</span>
                  @if (m.role === 'assistant' && !m.content) {
                    <span class="spinner" aria-label="Escribiendo"></span>
                  } @else {
                    @for (seg of parts(m.content); track $index) {
                      @if (seg.bold) { <strong>{{ seg.text }}</strong> } @else { {{ seg.text }} }
                    }
                  }
                </div>
              } @empty {
                <p class="text-sm" style="color: var(--text-secondary)">Empieza con una pregunta o elige una sugerencia.</p>
              }
            </div>

            @if (chatError(); as err) { <p class="notice notice-error mb-3" role="alert">{{ err }}</p> }

            <div class="flex flex-wrap gap-2 mb-3">
              @for (q of suggestions(); track q) {
                <button type="button" class="chip" [disabled]="sending()" (click)="send(q)">{{ q }}</button>
              }
            </div>

            <form class="flex gap-2" (submit)="$event.preventDefault(); send()">
              <label for="chat-input" class="sr-only">Tu pregunta</label>
              <input id="chat-input" class="field flex-1" maxlength="500" placeholder="Pregunta sobre tus equipos o a quién sacar…"
                [value]="draft()" (input)="draft.set(asValue($event))" [disabled]="sending()" autocomplete="off" />
              @if (sending()) {
                <button type="button" class="btn btn-ghost" (click)="stop()">Detener</button>
              } @else {
                <button type="submit" class="btn" [disabled]="!draft().trim()">Enviar</button>
              }
              @if (messages().length && !sending()) {
                <button type="button" class="btn btn-ghost" (click)="clearChat()">Borrar</button>
              }
            </form>
          </section>
        }

        @if (tab() !== 'account') {
          <details class="mt-8 text-sm" style="color: var(--text-secondary)">
            <summary class="cursor-pointer font-semibold">¿Cómo se calcula?</summary>
            <p class="mt-2 max-w-3xl">
              Es una <strong>estimación heurística</strong>, no una simulación de daño. Cada hueco vale según su rol
              (DPS principal 40 %, DPS secundario 25 %, soporte 20 %, sanador 15 %) por la calidad de quien lo ocupa
              (nivel y constelaciones; 0,9 si no se conoce el nivel, lo que equivale a nivel 60). Si te falta un personaje, lo cubre el mejor que
              tengas con el mismo rol según el meta, con un 70 % de eficacia (80 % más si cambia el elemento del DPS).
              El resultado se multiplica por el tier del equipo (S 1,0 · A 0,85 · B 0,7). Los equipos que solo salen en la ficha de un personaje recién lanzado aún no tienen tier oficial: se marcan «Sin rankear» y se puntúan como A. Si ninguna fuente tiene datos de un personaje, se indica «Sin datos del meta» en vez de un porcentaje. El % de mejora compara la media
              de tus {{ topN }} mejores equipos antes y después de conseguir al personaje. El meta lo extrae una IA de
              las páginas citadas y se valida contra la lista de personajes del juego.
            </p>
          </details>
        }
      </div>
    </div>

    <!-- ======================= plantillas ======================= -->
    <ng-template #teamCard let-t>
      <div class="flex items-center justify-between gap-2 mb-1">
        <h3 class="font-display font-bold">{{ t.team.name }}</h3>
        @if (t.team.unranked) {
          <span class="tier" data-tier="U" title="Equipo de la ficha del personaje: aún no tiene tier oficial. Se puntúa como A.">Sin rankear</span>
        } @else {
          <span class="tier" [attr.data-tier]="t.team.tier">{{ t.team.tier }}</span>
        }
      </div>
      <p class="text-xs mb-3" style="color: var(--text-secondary)">{{ t.team.reaction }} · {{ t.ownedCount }}/4 los tienes</p>
      <div class="flex gap-3 mb-3">
        @for (s of t.slots; track $index) {
          <div class="flex flex-col items-center gap-1 text-center min-w-0 flex-1">
            <app-character-avatar [character]="char(s.fillId ?? s.wantedId)" [size]="52"
              [dim]="s.status === 'missing'" [ring]="s.status === 'owned' ? green : s.status === 'substitute' ? amber : red" />
            <span class="text-xs truncate w-full">{{ char(s.fillId ?? s.wantedId).name.es }}</span>
            @if (s.status === 'substitute') {
              <span class="text-[11px] leading-tight txt-warn">en lugar de {{ char(s.wantedId).name.es }}</span>
            } @else if (s.status === 'missing') {
              <span class="text-[11px] leading-tight txt-neg">te falta</span>
            }
          </div>
        }
      </div>
      <div class="bar" role="img" [attr.aria-label]="'Puntuación ' + t.score + ' sobre 100'">
        <div class="bar-fill" [style.width.%]="min100(t.score)"></div>
      </div>
      <p class="text-xs mt-1" style="color: var(--text-secondary)">Puntuación estimada: <strong style="color: var(--text-primary)">{{ t.score }}</strong></p>
      @if (t.team.note) { <p class="text-xs mt-2" style="color: var(--text-secondary)">{{ t.team.note }}</p> }
    </ng-template>

    <ng-template #pullCard let-r>
      <button type="button" class="panel pull-btn w-full p-4 text-left" [class.pull-active]="selectedPull() === r.id"
        [attr.aria-pressed]="selectedPull() === r.id" (click)="selectPull(r.id)">
        <div class="flex items-center gap-3 mb-2">
          <app-character-avatar [character]="char(r.id)" [size]="52" />
          <div class="min-w-0">
            <div class="font-semibold truncate">{{ char(r.id).name.es }}</div>
            <div class="text-xs" style="color: var(--text-secondary)">{{ char(r.id).element }} · @if (r.inMeta) { {{ r.unlocked.length }} equipos del meta } @else { aún sin datos en las fuentes }</div>
          </div>
          <strong class="ml-auto" [class]="pctClass(r)">{{ pct(r) }}</strong>
        </div>
        <div class="bar"><div class="bar-fill" [style.width.%]="barPct(r)"></div></div>
      </button>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }
    .panel { border: 1px solid var(--border); border-radius: 16px; background: var(--bg-surface); }
    .field { background: var(--bg-elevated); border: 1px solid var(--border-bright); color: var(--text-primary); border-radius: 10px; padding: 8px 12px; font: inherit; min-width: 12rem; }
    .field:focus-visible, .btn:focus-visible, .chip:focus-visible, .char-btn:focus-visible, .pull-btn:focus-visible, .tab-btn:focus-visible { outline: 2px solid var(--accent-indigo); outline-offset: 2px; }
    .field[aria-invalid="true"] { border-color: #f87171; }
    .btn { background: var(--accent-gradient); color: #fff; border: 0; border-radius: 10px; padding: 8px 16px; font-weight: 700; cursor: pointer; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn-ghost { background: transparent; color: var(--text-primary); border: 1px solid var(--border-bright); }
    .tab-btn { cursor: pointer; white-space: nowrap; border: 1px solid var(--border); border-radius: 10px; padding: 8px 16px; font-weight: 700; color: var(--text-secondary); background: transparent; }
    .tab-btn-active { background: var(--accent-gradient); color: #fff; border-color: transparent; }
    .chip { cursor: pointer; border: 1px solid var(--border-bright); border-radius: 999px; padding: 4px 12px; font-size: 13px; background: transparent; color: var(--text-secondary); }
    .chip-active { background: var(--chip, var(--accent-indigo)); color: #fff; border-color: transparent; }
    .char-btn { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border-radius: 12px; cursor: pointer; background: transparent; border: 1px solid transparent; color: inherit; }
    .char-btn:hover { background: rgba(127,127,127,.08); }
    .char-btn[aria-pressed="true"] { border-color: rgba(74,222,128,.45); }
    .char-name { font-size: 12px; text-align: center; line-height: 1.2; }
    .char-sub { font-size: 11px; color: var(--text-secondary); }
    .pull-btn { cursor: pointer; color: inherit; }
    .pull-btn:hover, .pull-active { border-color: var(--accent-indigo); }
    .bar { height: 8px; border-radius: 999px; background: rgba(127,127,127,.2); overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 999px; background: var(--accent-gradient); transition: width .3s; }
    .tier { font-weight: 800; font-size: 12px; padding: 2px 8px; border-radius: 6px; border: 1px solid var(--border-bright); }
    .tier[data-tier="S"] { color: #b45309; border-color: #f59e0b; }
    .tier[data-tier="U"] { color: var(--text-secondary); border-style: dashed; font-weight: 600; }
    :host-context(html.dark) .tier[data-tier="S"] { color: #fcd34d; }
    /* Text colors are darker on the light theme so they keep >= 4.5:1 contrast on white. */
    .txt-pos { color: #15803d; } .txt-neg { color: #b91c1c; } .txt-warn { color: #b45309; } .txt-zero { color: var(--text-secondary); }
    :host-context(html.dark) .txt-pos { color: #4ade80; }
    :host-context(html.dark) .txt-neg { color: #f87171; }
    :host-context(html.dark) .txt-warn { color: #fbbf24; }
    .chat-log { display: flex; flex-direction: column; gap: 10px; max-height: 28rem; overflow-y: auto; }
    .msg { align-self: flex-start; max-width: 85%; padding: 10px 14px; border-radius: 14px; border: 1px solid var(--border-bright); white-space: pre-wrap; overflow-wrap: anywhere; }
    .msg-user { align-self: flex-end; background: var(--accent-gradient); color: #fff; border-color: transparent; }
    .chip:disabled { opacity: .5; cursor: not-allowed; }
    .notice { padding: 8px 12px; border-radius: 10px; border: 1px solid #4ade80; }
    .notice-warn { border-color: #f59e0b; color: #b45309; }
    :host-context(html.dark) .notice-warn { color: #fcd34d; }
    .notice-error { border-color: #ef4444; color: #b91c1c; }
    :host-context(html.dark) .notice-error { color: #fca5a5; }
    .spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border-bright); border-top-color: var(--accent-indigo); animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .spinner { animation: none; } .bar-fill { transition: none; } }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  `],
})
export class GenshinComponent implements OnDestroy {
  private api = inject(GenshinApiService);
  private titleService = inject(Title);
  private chat = inject(GenshinChatService);
  account = inject(GenshinAccountService);

  readonly crumbs: BreadcrumbItem[] = [
    { label: 'Guías', link: '/guides' },
    { label: 'Genshin Impact', link: '/guides', queryParams: { open: 'genshin-impact' } },
    { label: 'Mi cuenta' },
  ];
  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'account', label: 'Mi cuenta' },
    { id: 'teams', label: 'Mejores equipos' },
    { id: 'pull', label: '¿A quién sacar?' },
    { id: 'chat', label: 'Chat con IA' },
  ];
  readonly elements = ELEMENTS;
  readonly topN = 3;
  readonly green = GREEN;
  readonly amber = AMBER;
  readonly red = RED;

  tab = signal<Tab>('account');
  roster = signal<RosterCharacter[]>([]);
  rosterError = signal<string | null>(null);
  meta = signal<Meta | null>(null);
  /** idle | connecting (waiting for the server, which may be waking up) | updating (the meta is being regenerated) */
  metaPhase = signal<'idle' | 'connecting' | 'updating'>('idle');
  metaLoading = computed(() => this.metaPhase() !== 'idle');
  metaError = signal<string | null>(null);
  /** Why the meta couldn't be refreshed, when an older copy is being shown instead. */
  metaNotice = signal<string | null>(null);
  elapsed = signal(0);
  private destroyed = false;
  private timer: ReturnType<typeof setInterval> | null = null;

  uidInput = signal('');
  importing = signal(false);
  notice = signal<Notice | null>(null);
  search = signal('');
  elementFilter = signal<Element | null>(null);
  selectedPull = signal<number | null>(null);

  messages = signal<ChatMessage[]>([]);
  draft = signal('');
  sending = signal(false);
  chatError = signal<string | null>(null);
  private abort: AbortController | null = null;
  readonly parts = parseBold;
  suggestions = computed(() => {
    const banners = (this.meta()?.banners ?? []).filter(id => this.rosterMap().has(id)).map(id => this.char(id).name.es);
    const compare = banners.length >= 2 ? `¿Saco a ${banners[0]} o a ${banners[1]}?` : '¿A quién me conviene sacar?';
    return [compare, '¿Qué equipo del meta puedo armar ya?', '¿Con quién cubro a los que me faltan?'];
  });

  private rosterMap = computed(() => new Map(this.roster().map(c => [c.id, c])));
  uidValid = computed(() => /^\d{9,10}$/.test(this.uidInput()));

  visibleRoster = computed(() => {
    const q = this.search().trim().toLowerCase();
    const el = this.elementFilter();
    return this.roster()
      .filter(c => (!el || c.element === el) && (!q || c.name.es.toLowerCase().includes(q) || c.name.en.toLowerCase().includes(q)))
      .sort((a, b) => b.rarity - a.rarity || a.name.es.localeCompare(b.name.es, 'es'));
  });
  unownedRoster = computed(() =>
    this.roster().filter(c => !this.account.has(c.id)).sort((a, b) => a.name.es.localeCompare(b.name.es, 'es')));

  private ctx = computed<EngineContext | null>(() => {
    const meta = this.meta();
    return meta && this.roster().length ? { meta, roster: this.rosterMap(), owned: this.account.owned() } : null;
  });
  scored = computed<ScoredTeam[]>(() => { const c = this.ctx(); return c ? scoreAllTeams(c) : []; });
  currentScore = computed(() => accountScore(this.scored()));

  private ranking = computed<PullCandidateResult[]>(() => { const c = this.ctx(); return c ? rankPulls(pullCandidates(c), c) : []; });
  /** Banner characters plus the ones flagged NEW (a more reliable signal than the banners the model read). */
  private featured = computed(() => new Set([...(this.meta()?.banners ?? []), ...(this.meta()?.newCharacters ?? [])]));
  bannerPulls = computed(() => this.ranking().filter(r => this.featured().has(r.id)));
  topPulls = computed(() => {
    const featured = this.featured();
    return this.ranking().filter(r => !featured.has(r.id) && r.inMeta).slice(0, 6);
  });
  selectedResult = computed<PullCandidateResult | null>(() => {
    const id = this.selectedPull(), c = this.ctx();
    return id !== null && c ? this.ranking().find(r => r.id === id) ?? evaluatePull(id, c) : null;
  });

  constructor() {
    this.titleService.setTitle('Mi cuenta · Genshin Impact · Javier Morón');
    this.uidInput.set(this.account.uid() ?? '');
    this.api.roster().then(r => this.roster.set(r), () => this.rosterError.set('No se pudo cargar la lista de personajes.'));
    // Show the last meta this browser saw (of any age) right away; the backend is only asked when it is stale.
    this.meta.set(this.api.readLastMeta());
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopTimer();
    this.abort?.abort();
  }

  select(tab: Tab): void {
    this.tab.set(tab);
    if (tab !== 'account') this.ensureMeta();
  }

  /** No network at all while the browser copy is fresh: the AI is only ever reached when it is not. */
  private ensureMeta(): void {
    const current = this.meta();
    if (this.metaLoading() || (current && metaIsFresh(current))) return;
    void this.loadMeta();
  }

  /**
   * Asks the backend for the meta and, while it reports `updating`, polls until the new one is ready.
   * The backend answers instantly from its stored snapshot, so this is cheap and free of AI calls unless
   * that snapshot is older than 12 h (then exactly one background update starts, shared by every visitor).
   */
  async loadMeta(): Promise<void> {
    if (this.metaLoading()) return;
    this.metaPhase.set('connecting');
    this.metaError.set(null);
    this.metaNotice.set(null);
    this.elapsed.set(0);
    this.stopTimer();
    this.timer = setInterval(() => this.elapsed.update(s => s + 1), 1000);
    try {
      for (let poll = 0; poll < MAX_META_POLLS && !this.destroyed; poll++) {
        const state = await this.api.metaState();
        if (state.meta) this.meta.set(state.meta); // an older copy is shown while the new one is generated
        if (state.status === 'updating') {
          this.metaPhase.set('updating');
          this.elapsed.set(state.elapsed ?? 0); // the server's clock: the same for every visitor
          await new Promise(resolve => setTimeout(resolve, META_POLL_MS));
          continue;
        }
        if (state.status === 'stale') this.metaNotice.set(state.message ?? 'No se pudo actualizar el meta.');
        if (state.status === 'unavailable') this.metaError.set(state.message ?? 'El meta no está disponible ahora mismo.');
        return;
      }
      if (!this.destroyed) this.metaError.set('La actualización está tardando más de lo normal. Vuelve a intentarlo en unos minutos.');
    } catch (e) {
      // Keep whatever meta is already on screen; only report the failure.
      this.metaError.set(e instanceof Error ? e.message : 'No se pudo obtener el meta.');
    } finally {
      this.metaPhase.set('idle');
      this.stopTimer();
    }
  }

  async importUid(): Promise<void> {
    if (!this.uidValid() || this.importing()) return;
    this.importing.set(true);
    this.notice.set(null);
    try {
      const profile = await this.api.profile(this.uidInput());
      this.account.importProfile(profile);
      this.notice.set(profile.characters.length
        ? { kind: 'ok', text: `Se importaron ${profile.characters.length} personajes de tu vitrina. Marca a mano los demás.` }
        : { kind: 'warn', text: 'Tu vitrina está oculta o vacía. Activa «Mostrar detalles de personajes» en el juego (Perfil → Vitrina) o marca tus personajes a mano.' });
    } catch (e) {
      this.notice.set({ kind: 'error', text: e instanceof Error ? e.message : 'No se pudo leer la cuenta.' });
    } finally {
      this.importing.set(false);
    }
  }

  async send(text = this.draft()): Promise<void> {
    const question = text.trim();
    const ctx = this.ctx();
    if (!question || this.sending() || !ctx) return;

    this.draft.set('');
    this.chatError.set(null);
    const history: ChatMessage[] = [...this.messages(), { role: 'user', content: question }];
    this.messages.set([...history, { role: 'assistant', content: '' }]);
    this.sending.set(true);
    const abort = (this.abort = new AbortController());
    try {
      for await (const chunk of this.chat.stream(history, buildChatContext(ctx), abort.signal)) {
        this.messages.update(list => {
          const last = list[list.length - 1];
          return [...list.slice(0, -1), { ...last, content: last.content + chunk }];
        });
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        this.chatError.set(e instanceof Error ? e.message : 'No se pudo completar la respuesta.');
      }
    } finally {
      // An answer that never produced text leaves no empty bubble behind.
      this.messages.update(list => list.at(-1)?.role === 'assistant' && !list.at(-1)!.content ? list.slice(0, -1) : list);
      this.sending.set(false);
      this.abort = null;
    }
  }

  stop(): void {
    this.abort?.abort();
  }

  clearChat(): void {
    this.messages.set([]);
    this.chatError.set(null);
  }

  forget(): void {
    this.account.forget();
    this.uidInput.set('');
    this.notice.set(null);
  }

  selectPull(id: number | null): void {
    this.selectedPull.set(id);
  }

  char(id: number): RosterCharacter {
    // Meta ids are validated against the roster by the backend; this is only a guard.
    return this.rosterMap().get(id) ?? { id, key: String(id), name: { en: '?', es: '?', pt: '?' }, element: 'Geo', weapon: 'Sword', rarity: 4, icon: '', sideIcon: '' };
  }

  color(el: Element): string { return ELEMENT_COLOR[el]; }
  min100(n: number): number { return Math.max(0, Math.min(100, n)); }
  barPct(r: PullCandidateResult): number {
    if (!r.inMeta) return 0;
    return r.improvementPct === null ? 100 : Math.max(0, Math.min(100, r.improvementPct));
  }
  pct(r: PullCandidateResult): string {
    if (!r.inMeta) return 'Sin datos del meta';
    if (r.improvementPct === null) return 'Nuevo equipo';
    if (r.improvementPct === 0) return 'Sin cambio';
    return `${r.improvementPct > 0 ? '+' : ''}${r.improvementPct}%`;
  }
  /** Green for a gain, red for a loss, neutral when nothing changes (text colors live in the styles, per theme). */
  pctClass(r: PullCandidateResult): string {
    if (!r.inMeta) return 'txt-zero';
    return r.improvementPct === null || r.improvementPct > 0 ? 'txt-pos' : r.improvementPct < 0 ? 'txt-neg' : 'txt-zero';
  }
  ownedInfo(id: number): string {
    const o = this.account.owned().get(id);
    if (!o || o.level == null) return '';
    return `Nv. ${o.level} · C${o.cons ?? 0}`;
  }
  formatDate(ms: number): string {
    return new Date(ms).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });
  }
  asValue(e: Event): string { return (e.target as HTMLInputElement).value; }
  asNumber(e: Event): number | null { const v = (e.target as HTMLSelectElement).value; return v ? Number(v) : null; }

  private stopTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
