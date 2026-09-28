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
    path: 'guides/:slug',
    loadComponent: () =>
      import('./pages/guide-viewer/guide-viewer.component').then(m => m.GuideViewerComponent),
    title: 'Guía · Javier Morón',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
