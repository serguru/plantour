import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable, shareReplay } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export interface TripNoteEditorConfig {
  tinyMceApiKey: string;
  dropboxEnabled: boolean;
  dropboxConnected: boolean;
  dropboxDisplayName?: string | null;
}

export interface TripNoteEditorDropboxConnectUrl {
  authorizationUrl: string;
}

export interface TripNoteEditorDropboxBrowserEntry {
  id: string;
  name: string;
  path: string;
  isFolder: boolean;
  previewUrl?: string | null;
}

export interface TripNoteEditorDropboxBrowser {
  currentPath: string;
  parentPath?: string | null;
  entries: TripNoteEditorDropboxBrowserEntry[];
}

export interface TripNoteEditorResolvedDropboxImage {
  path: string;
  url: string;
}

interface TripNoteEditorResolvedDropboxImagesResponse {
  images: TripNoteEditorResolvedDropboxImage[];
}

@Injectable({
  providedIn: 'root',
})
export class TripNoteEditorService {
  private readonly apiUrl: string;
  private configRequest$?: Observable<TripNoteEditorConfig>;

  constructor(
    private readonly http: HttpClient,
    @Inject(ENVIRONMENT) private readonly environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/trip-note-editor`;
  }

  getConfig(forceRefresh = false): Observable<TripNoteEditorConfig> {
    if (!this.configRequest$ || forceRefresh) {
      this.configRequest$ = this.http
        .get<TripNoteEditorConfig>(`${this.apiUrl}/config`)
        .pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }

    return this.configRequest$;
  }

  resetClientState(): void {
    this.configRequest$ = undefined;
  }

  createDropboxConnectUrl(frontendOrigin: string, frontendPath: string): Observable<TripNoteEditorDropboxConnectUrl> {
    return this.http.post<TripNoteEditorDropboxConnectUrl>(`${this.apiUrl}/dropbox/connect-url`, {
      frontendOrigin,
      frontendPath,
    });
  }

  disconnectDropbox(): Observable<void> {
    this.resetClientState();
    return this.http.delete<void>(`${this.apiUrl}/dropbox/connection`);
  }

  browseDropbox(path?: string | null): Observable<TripNoteEditorDropboxBrowser> {
    return this.http.post<TripNoteEditorDropboxBrowser>(`${this.apiUrl}/dropbox/browse`, { path: path ?? null });
  }

  resolveDropboxImages(paths: string[]): Observable<TripNoteEditorResolvedDropboxImagesResponse> {
    return this.http.post<TripNoteEditorResolvedDropboxImagesResponse>(`${this.apiUrl}/dropbox/resolve-images`, { paths });
  }

  async prepareDropboxConnect(frontendOrigin: string, frontendPath: string): Promise<TripNoteEditorDropboxConnectUrl> {
    return await firstValueFrom(this.createDropboxConnectUrl(frontendOrigin, frontendPath));
  }

  async hydrateStoredHtml(html: string | null | undefined): Promise<string> {
    if (!html || typeof DOMParser === 'undefined') {
      return html ?? '';
    }

    const document = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    const root = document.body.firstElementChild as HTMLDivElement | null;
    if (!root) {
      return html;
    }

    const images = Array.from(root.querySelectorAll<HTMLImageElement>('img[data-plantour-provider="dropbox"][data-dropbox-path]'));
    const paths = [...new Set(images.map((image) => image.dataset['dropboxPath']?.trim()).filter((path): path is string => !!path))];
    if (paths.length === 0) {
      return root.innerHTML;
    }

    try {
      const response = await firstValueFrom(this.resolveDropboxImages(paths));
      const resolved = new Map(response.images.map((image) => [image.path, image.url]));
      for (const image of images) {
        const path = image.dataset['dropboxPath']?.trim();
        const url = path ? resolved.get(path) : null;
        if (url) {
          image.setAttribute('src', url);
          image.setAttribute('referrerpolicy', 'no-referrer');
        }
      }
    } catch {
      return root.innerHTML;
    }

    return root.innerHTML;
  }

  canonicalizeStoredHtml(html: string | null | undefined): string {
    if (!html || typeof DOMParser === 'undefined') {
      return html ?? '';
    }

    const document = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    const root = document.body.firstElementChild as HTMLDivElement | null;
    if (!root) {
      return html;
    }

    for (const image of Array.from(root.querySelectorAll<HTMLImageElement>('img[data-plantour-provider="dropbox"][data-dropbox-path]'))) {
      image.removeAttribute('src');
      image.removeAttribute('srcset');
      image.setAttribute('data-plantour-provider', 'dropbox');
    }

    return root.innerHTML;
  }

  buildDropboxImageHtml(entry: TripNoteEditorDropboxBrowserEntry): string {
    const alt = this.escapeHtml(this.stripFileExtension(entry.name) || 'Trip note image');
    const path = this.escapeHtml(entry.path);
    const previewUrl = this.escapeHtml(entry.previewUrl ?? '');
    return `<img src="${previewUrl}" alt="${alt}" data-plantour-provider="dropbox" data-dropbox-path="${path}" />`;
  }

  private stripFileExtension(value: string): string {
    return value.replace(/\.[^.]+$/, '');
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}