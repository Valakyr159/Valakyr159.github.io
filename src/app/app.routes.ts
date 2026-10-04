import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Javier Morón · Portfolio',
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./pages/projects/projects.component').then(m => m.ProjectsComponent),
    title: 'Proyectos · Javier Morón',
  },
  {
    path: 'chatbot',
    loadComponent: () =>
      import('./pages/chatbot/chatbot.component').then(m => m.ChatbotComponent),
    title: 'Chatbot RAG · Javier Morón',
  },
  {
    path: 'guides',
    loadComponent: () =>
      import('./pages/guides-landing/guides-landing.component').then(m => m.GuidesLandingComponent),
    title: 'Guías · Javier Morón',
  },
  {
    // Old single-level URLs (e.g. /guides/kingdom-hearts) land on the series, expanded.
    path: 'guides/:series',
    // 'full' is required: redirects default to prefix matching and would swallow /guides/:series/:game.
    pathMatch: 'full',
    redirectTo: ({ params }) => `/guides?open=${encodeURIComponent(params['series'])}`,
  },
  {
    // Native Angular guide (kind: 'app' in guides-data). Must come before the generic viewer route.
    path: 'guides/genshin-impact/mi-cuenta',
    loadComponent: () =>
      import('./pages/genshin/genshin.component').then(m => m.GenshinComponent),
  },
  {
    path: 'guides/:series/:game',
    loadComponent: () =>
      import('./pages/guide-viewer/guide-viewer.component').then(m => m.GuideViewerComponent),
    // No static `title`: the viewer sets it per game (a route title would override it).
  },
  {
    path: '**',
    redirectTo: '',
  },
];
