import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'discover/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'help',
    renderMode: RenderMode.Server
  },
  {
    path: 'sign-up',
    renderMode: RenderMode.Server
  },
  {
    path: '',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
