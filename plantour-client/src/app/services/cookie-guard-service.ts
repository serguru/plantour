import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MessagesService } from './messages-service';

@Injectable({
  providedIn: 'root'
})
export class CookieGuardService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly messagesService = inject(MessagesService);

  private monitoringTimer: number | null = null;
  private readonly shownAttemptMessages = new Set<string>();
  private readonly shownCleanupMessages = new Set<string>();

  private internalCookieWrite = false;

  init(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.installDocumentCookieGuard();
    this.installCookieStoreGuard();
    this.killAllDetectedCookies();
    this.startCookieMonitoring();
  }

  private installDocumentCookieGuard(): void {
    const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    if (!descriptor?.get || !descriptor.set) {
      return;
    }

    const originalGet = descriptor.get;
    const originalSet = descriptor.set;

    Object.defineProperty(Document.prototype, 'cookie', {
      configurable: true,
      enumerable: descriptor.enumerable,
      get: function getCookie(this: Document): string {
        return originalGet.call(this);
      },
      set: (value: string) => {
        if (this.internalCookieWrite) {
          originalSet.call(document, value);
          return;
        }

        const attemptedValue = String(value ?? '');
        this.showBlockedAttemptError('document.cookie', attemptedValue, new Error().stack);
        throw new Error('Cookie write blocked by client cookie guard.');
      }
    });
  }

  private installCookieStoreGuard(): void {
    const win = window as Window & {
      cookieStore?: {
        set?: (...args: unknown[]) => Promise<unknown>;
      };
    };

    if (!win.cookieStore || typeof win.cookieStore.set !== 'function') {
      return;
    }

    win.cookieStore.set = async (...args: unknown[]): Promise<never> => {
      const attemptedValue = JSON.stringify(args[0] ?? '');
      this.showBlockedAttemptError('cookieStore.set', attemptedValue, new Error().stack);
      throw new Error('Cookie write blocked by client cookie guard.');
    };
  }

  private startCookieMonitoring(): void {
    if (this.monitoringTimer) {
      return;
    }

    this.monitoringTimer = window.setInterval(() => {
      this.killAllDetectedCookies();
    }, 1500);
  }

  private killAllDetectedCookies(): void {
    const cookieNames = this.getCookieNames();
    for (const cookieName of cookieNames) {
      const wasRemoved = this.removeCookieByName(cookieName);
      if (!wasRemoved) {
        this.showCookieCleanupFailedError(cookieName);
      }
    }
  }

  private getCookieNames(): string[] {
    const raw = document.cookie;
    if (!raw) {
      return [];
    }

    return raw
      .split(';')
      .map((item) => item.split('=')[0]?.trim())
      .filter((item): item is string => !!item);
  }

  private removeCookieByName(name: string): boolean {
    const encodedName = encodeURIComponent(name);
    const hostname = window.location.hostname;
    const domainCandidates = this.getDomainCandidates(hostname);
    const pathCandidates = this.getPathCandidates(window.location.pathname);

    this.internalCookieWrite = true;
    try {
      for (const domain of domainCandidates) {
        for (const path of pathCandidates) {
          const domainPart = domain ? `; domain=${domain}` : '';
          const base = `${encodedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=${path}${domainPart}`;

          document.cookie = `${base}; samesite=lax`;
          if (window.location.protocol === 'https:') {
            document.cookie = `${base}; samesite=none; secure`;
          }
        }
      }
    } finally {
      this.internalCookieWrite = false;
    }

    return !this.getCookieNames().includes(name);
  }

  private getDomainCandidates(hostname: string): string[] {
    const parts = hostname.split('.').filter(Boolean);
    const domains = ['', hostname, `.${hostname}`];

    for (let i = 0; i < parts.length - 1; i += 1) {
      const domain = parts.slice(i).join('.');
      domains.push(domain, `.${domain}`);
    }

    return Array.from(new Set(domains));
  }

  private getPathCandidates(pathname: string): string[] {
    const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const parts = normalized.split('/').filter(Boolean);
    const paths = ['/'];

    let currentPath = '';
    for (const part of parts) {
      currentPath += `/${part}`;
      paths.push(currentPath);
    }

    return Array.from(new Set(paths));
  }

  private showBlockedAttemptError(channel: string, attemptedValue: string, stack: string | undefined): void {
    const cookieName = this.extractCookieName(attemptedValue);
    const source = this.extractSource(stack);
    const key = `${channel}|${cookieName}|${source}`;

    if (this.shownAttemptMessages.has(key)) {
      return;
    }

    this.shownAttemptMessages.add(key);
    this.messagesService.showError(
      'Cookie write blocked',
      `${source} attempted to write cookie ${cookieName}.`
    );
  }

  private showCookieCleanupFailedError(cookieName: string): void {
    if (this.shownCleanupMessages.has(cookieName)) {
      return;
    }

    this.shownCleanupMessages.add(cookieName);
    this.messagesService.showError(
      'Cookie cleanup failed',
      `Detected cookie ${cookieName} could not be deleted by client cookie guard.`
    );
  }

  private extractCookieName(attemptedValue: string): string {
    const firstPair = attemptedValue.split(';')[0] ?? '';
    const name = firstPair.split('=')[0]?.trim();
    return name || '(unknown)';
  }

  private extractSource(stack: string | undefined): string {
    if (!stack) {
      return '(unknown source)';
    }

    const stackLines = stack.split('\n').map((line) => line.trim());
    for (const line of stackLines) {
      if (line.includes('cookie-guard-service')) {
        continue;
      }

      const urlMatch = line.match(/https?:\/\/[^\s)]+/);
      if (urlMatch) {
        return urlMatch[0];
      }

      if (line.startsWith('at ')) {
        return line.replace(/^at\s+/, '');
      }
    }

    return '(unknown source)';
  }
}