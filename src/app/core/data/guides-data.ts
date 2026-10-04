export interface GuideGame {
  /** URL segment: /guides/<series.slug>/<slug> */
  slug: string;
  title: string;
  sub?: string;
  icon?: string;
  /**
   * 'iframe': self-contained static HTML under `public/guides/<series>/`,
   * embedded in the app shell via <iframe> (needs `src`).
   * 'app': a native Angular page (needs `route`), for guides that need
   * services/backend calls and don't fit in an isolated HTML file.
   */
  kind: 'iframe' | 'app';
  src?: string;
  route?: string;
}

export interface GuideSeries {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  games: GuideGame[];
}

/**
 * Guides are grouped by series (franchise). Each game gets its own URL
 * (`/guides/<series>/<game>`) and shows up in the landing's accordion.
 *
 * To add an iframe guide: drop the .html in `public/guides/<series>/` and add
 * a game below. Never put an `index.html` with the series' name there (see
 * CLAUDE.md gotcha).
 */
export const GUIDE_SERIES: GuideSeries[] = [
  {
    slug: 'kingdom-hearts',
    title: 'Kingdom Hearts',
    subtitle: 'Guías jugables en español, un juego por sección.',
    icon: '🗝️',
    games: [
      {
        slug: 'birth-by-sleep',
        title: 'Birth by Sleep',
        sub: 'Fusión de comandos y habilidades',
        icon: '⚔️',
        kind: 'iframe',
        src: '/guides/kingdom-hearts/birth-by-sleep.html',
      },
      {
        slug: 'dream-drop-distance',
        title: 'Dream Drop Distance',
        sub: 'Creación de Lucientes',
        icon: '💤',
        kind: 'iframe',
        src: '/guides/kingdom-hearts/dream-drop-distance.html',
      },
    ],
  },
  {
    slug: 'genshin-impact',
    title: 'Genshin Impact',
    subtitle: 'Importa tu cuenta por UID y compara con el meta actual.',
    icon: '🌬️',
    games: [
      {
        slug: 'mi-cuenta',
        title: 'Mi cuenta',
        sub: 'Mejores equipos y a quién sacar, con IA',
        icon: '✨',
        kind: 'app',
        route: '/guides/genshin-impact/mi-cuenta',
      },
    ],
  },
];

export function findSeries(slug: string | null | undefined): GuideSeries | null {
  return GUIDE_SERIES.find(s => s.slug === slug) ?? null;
}

export function findGame(
  seriesSlug: string | null | undefined,
  gameSlug: string | null | undefined
): { series: GuideSeries; game: GuideGame } | null {
  const series = findSeries(seriesSlug);
  const game = series?.games.find(g => g.slug === gameSlug);
  return series && game ? { series, game } : null;
}
