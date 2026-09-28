export interface GuideTab {
  id: string;
  label: string;
  sub?: string;
  icon?: string;
  src: string;
}

export interface GuideConfig {
  slug: string;
  title: string;
  subtitle: string;
  tabs: GuideTab[];
}

/**
 * Each guide is a set of self-contained static HTML files under
 * `public/guides/<slug>/`, embedded here via <iframe> so they render inside
 * the app shell (navbar/footer, theme + language toggles stay visible)
 * instead of a full page navigation away from the SPA.
 *
 * To add a new guide: drop the .html file(s) in `public/guides/<slug>/`
 * and add an entry below. No new component needed.
 */
export const GUIDES: Record<string, GuideConfig> = {
  'kingdom-hearts': {
    slug: 'kingdom-hearts',
    title: 'Guía de Kingdom Hearts',
    subtitle: 'Recopilación de guías jugables en español, un juego por sección.',
    tabs: [
      {
        id: 'bbs',
        label: 'Birth by Sleep',
        sub: 'Fusión de comandos y habilidades',
        icon: '⚔️',
        src: '/guides/kingdom-hearts/birth-by-sleep.html',
      },
      {
        id: 'ddd',
        label: 'Dream Drop Distance',
        sub: 'Creación de Lucientes',
        icon: '💤',
        src: '/guides/kingdom-hearts/dream-drop-distance.html',
      },
    ],
  },
};
