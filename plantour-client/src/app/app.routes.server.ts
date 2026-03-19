import { RenderMode, ServerRoute } from '@angular/ssr';

const landingPageRenderMode = RenderMode.Client;

export const serverRoutes: ServerRoute[] = [
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
