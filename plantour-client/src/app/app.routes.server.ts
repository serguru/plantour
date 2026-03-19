import { RenderMode, ServerRoute } from '@angular/ssr';


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
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
