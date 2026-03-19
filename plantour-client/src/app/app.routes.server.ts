import { RenderMode, ServerRoute } from '@angular/ssr';

const landingPageRenderMode = RenderMode.Client;

export const serverRoutes: ServerRoute[] = [
  {
    path: 'help',
    renderMode: RenderMode.Server
  },
  {
    path: 'help/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'packing-list-generator/**',
    renderMode: RenderMode.Server
  },
  {
    path: '',
    renderMode: landingPageRenderMode
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
