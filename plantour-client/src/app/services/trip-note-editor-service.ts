import { Inject, Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable, shareReplay } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { LoadingService } from './loading-service';

export class DropboxAuthorizationCancelledError extends Error {
  constructor(message = 'Dropbox authorization was cancelled.') {
    super(message);
    this.name = 'DropboxAuthorizationCancelledError';
  }
}

export interface TripNoteEditorConfig {
  tinyMceApiKey: string;
  dropboxEnabled: boolean;
  dropboxConnected: boolean;
  dropboxDisplayName?: string | null;
}

export interface TripNoteEditorDropboxConnectUrl {
  authorizationUrl: string;
  redirectUri: string;
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
  private connectDropboxPromise: Promise<TripNoteEditorConfig> | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly zone: NgZone,
    private readonly loadingService: LoadingService,
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

  createDropboxConnectUrl(frontendOrigin: string): Observable<TripNoteEditorDropboxConnectUrl> {
    return this.http.post<TripNoteEditorDropboxConnectUrl>(`${this.apiUrl}/dropbox/connect-url`, { frontendOrigin });
  }

  disconnectDropbox(): Observable<void> {
    this.configRequest$ = undefined;
    return this.http.delete<void>(`${this.apiUrl}/dropbox/connection`);
  }

  browseDropbox(path?: string | null): Observable<TripNoteEditorDropboxBrowser> {
    return this.http.post<TripNoteEditorDropboxBrowser>(`${this.apiUrl}/dropbox/browse`, { path: path ?? null });
  }

  resolveDropboxImages(paths: string[]): Observable<TripNoteEditorResolvedDropboxImagesResponse> {
    return this.http.post<TripNoteEditorResolvedDropboxImagesResponse>(`${this.apiUrl}/dropbox/resolve-images`, { paths });
  }

  async connectDropbox(): Promise<TripNoteEditorConfig> {
    if (this.connectDropboxPromise) {
      return this.connectDropboxPromise;
    }

    this.loadingService.start();
    this.connectDropboxPromise = this.connectDropboxInternal().finally(() => {
      this.loadingService.stop();
      this.connectDropboxPromise = null;
    });

    return this.connectDropboxPromise;
  }

  private async connectDropboxInternal(): Promise<TripNoteEditorConfig> {
    if (typeof window === 'undefined') {
      throw new Error('Dropbox authorization requires a browser.');
    }

    const popupName = `plantour-dropbox-auth-${Date.now()}`;
    const popup = window.open('', popupName, 'popup=yes,width=720,height=760');
    if (!popup) {
      throw new Error('Dropbox authorization popup was blocked.');
    }

    popup.focus();

    const connectUrl = await firstValueFrom(this.createDropboxConnectUrl(window.location.origin));
    const popupWait = this.waitForDropboxPopup(popup, connectUrl.redirectUri);
    popup.location.href = connectUrl.authorizationUrl;
    await popupWait;
    const config = await this.waitForDropboxConnectionState(true);
    this.configRequest$ = undefined;
    return config;
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

  private async waitForDropboxPopup(popup: Window, redirectUri: string): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    const apiOrigin = new URL(this.environment.api.baseUrl).origin;
    const redirectOrigin = new URL(redirectUri).origin;
    const acceptedOrigins = new Set([apiOrigin, redirectOrigin]);

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      let authTimeout: number | null = null;
      let closeInterval: number | null = null;
      let closeCheckInFlight = false;
      let popupClosedAt: number | null = null;

      const cleanup = () => {
        window.removeEventListener('message', handleMessage);
        if (authTimeout !== null) {
          window.clearTimeout(authTimeout);
        }
        if (closeInterval !== null) {
          window.clearInterval(closeInterval);
        }
      };

      const resolveOnce = () => {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();
        this.zone.run(() => resolve());
      };

      const rejectOnce = (error: Error) => {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();
        this.zone.run(() => reject(error));
      };

      const handleMessage = (event: MessageEvent) => {
        const data = event.data as { source?: string; provider?: string; success?: boolean; message?: string } | null;
        if (!acceptedOrigins.has(event.origin) || data?.source !== 'plantour-trip-note-editor' || data?.provider !== 'dropbox') {
          return;
        }

        try {
          popup.close();
        } catch {
          // Ignore if the browser refuses parent-side close.
        }

        if (data.success) {
          resolveOnce();
          return;
        }

        rejectOnce(new Error(data.message || 'Dropbox authorization failed.'));
      };

      window.addEventListener('message', handleMessage);

      closeInterval = window.setInterval(async () => {
        if (settled || closeCheckInFlight) {
          return;
        }

        if (!popup.closed) {
          popupClosedAt = null;
          return;
        }

        popupClosedAt ??= Date.now();

        if (Date.now() - popupClosedAt < 1200) {
          return;
        }

        closeCheckInFlight = true;

        try {
          if (await this.tryWaitForDropboxConnectionState(true)) {
            resolveOnce();
            return;
          }

          rejectOnce(new DropboxAuthorizationCancelledError());
        } catch {
          rejectOnce(new DropboxAuthorizationCancelledError());
        } finally {
          closeCheckInFlight = false;
        }
      }, 300);

      authTimeout = window.setTimeout(() => {
        rejectOnce(new Error('Dropbox authorization did not complete. Please finish the popup flow and try again.'));
      }, 180000);
    });
  }

  private async waitForDropboxConnectionState(connected: boolean): Promise<TripNoteEditorConfig> {
    const config = await this.tryWaitForDropboxConnectionState(connected);
    if (!config) {
      throw new Error(connected ? 'Dropbox connection could not be confirmed.' : 'Dropbox disconnection could not be confirmed.');
    }

    return config;
  }

  private async tryWaitForDropboxConnectionState(connected: boolean): Promise<TripNoteEditorConfig | null> {
    for (let attempt = 0; attempt < 10; attempt++) {
      this.configRequest$ = undefined;
      const config = await firstValueFrom(this.getConfig(true));
      if (config.dropboxConnected === connected) {
        return config;
      }

      await this.delay(400);
    }

    return null;
  }

  private async delay(milliseconds: number): Promise<void> {
    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), milliseconds);
    });
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