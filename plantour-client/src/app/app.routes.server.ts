import { RenderMode, ServerRoute } from '@angular/ssr';


export const serverRoutes: ServerRoute[] = [
  {
    path: 'contact',
    renderMode: RenderMode.Server
  },
  {
    path: 'privacy',
    renderMode: RenderMode.Server
  },
  {
    path: 'terms',
    renderMode: RenderMode.Server
  },
  {
    path: 'refund',
    renderMode: RenderMode.Server
  },
  {
    path: 'help',
    renderMode: RenderMode.Server
  },
  {
    path: 'help/**',
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
