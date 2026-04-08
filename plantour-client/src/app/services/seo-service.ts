import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  robots?: string;
  image?: string;
  imageAlt?: string;
  jsonLd?: Record<string, unknown> | null;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private static readonly defaultImagePath = '/android-chrome-512x512.png';

  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request = inject(REQUEST, { optional: true });

  setSeo(config: SeoConfig): void {
    this.titleService.setTitle(config.title);

    this.meta.updateTag(
      { name: 'description', content: config.description },
      "name='description'",
    );

    this.meta.updateTag(
      { name: 'robots', content: config.robots ?? 'index,follow' },
      "name='robots'",
    );

    const canonicalUrl = this.normalizeCanonicalUrl(config.canonicalUrl);
    if (canonicalUrl) {
      this.setCanonical(canonicalUrl);
    }

    const ogType = config.ogType ?? 'website';
    const imageUrl = this.toAbsoluteUrl(config.image ?? SeoService.defaultImagePath, canonicalUrl);
    if (canonicalUrl) {
      this.meta.updateTag({ property: 'og:url', content: canonicalUrl }, "property='og:url'");
      this.meta.updateTag({ name: 'twitter:url', content: canonicalUrl }, "name='twitter:url'");
    }

    this.meta.updateTag({ property: 'og:site_name', content: 'Plantour' }, "property='og:site_name'");
    this.meta.updateTag({ property: 'og:type', content: ogType }, "property='og:type'");
    this.meta.updateTag({ property: 'og:title', content: config.title }, "property='og:title'");
    this.meta.updateTag(
      { property: 'og:description', content: config.description },
      "property='og:description'",
    );
    this.meta.updateTag({ property: 'og:image', content: imageUrl }, "property='og:image'");
    this.meta.updateTag(
      { property: 'og:image:alt', content: config.imageAlt ?? config.title },
      "property='og:image:alt'",
    );

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' }, "name='twitter:card'");
    this.meta.updateTag({ name: 'twitter:title', content: config.title }, "name='twitter:title'");
    this.meta.updateTag(
      { name: 'twitter:description', content: config.description },
      "name='twitter:description'",
    );
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl }, "name='twitter:image'");
    this.meta.updateTag(
      { name: 'twitter:image:alt', content: config.imageAlt ?? config.title },
      "name='twitter:image:alt'",
    );

    this.setJsonLd(config.jsonLd ?? null);
  }

  private toAbsoluteUrl(url: string, canonicalUrl?: string): string {
    if (!url) {
      return url;
    }

    try {
      return new URL(url).toString();
    } catch {
      const baseUrl = canonicalUrl ?? this.requestOrigin() ?? this.document.baseURI ?? this.document.location?.origin;
      if (!baseUrl) {
        return url;
      }

      try {
        return new URL(url, baseUrl).toString();
      } catch {
        return url;
      }
    }
  }

  private requestOrigin(): string | null {
    const protocol = this.firstForwardedValue(this.request?.headers?.get('x-forwarded-proto'));
    const host = this.firstForwardedValue(
      this.request?.headers?.get('x-forwarded-host') ?? this.request?.headers?.get('host'),
    );
    if (protocol && host) {
      return `${protocol}://${host}`;
    }

    if (!this.request?.url) {
      return null;
    }

    try {
      return new URL(this.request.url).origin;
    } catch {
      return null;
    }
  }

  private normalizeCanonicalUrl(url: string | undefined): string | undefined {
    if (!url) {
      return undefined;
    }

    const absolute = this.toAbsoluteUrl(url);

    try {
      const canonical = new URL(absolute);
      const requestOrigin = this.requestOrigin();

      if (requestOrigin) {
        try {
          const origin = new URL(requestOrigin);
          canonical.protocol = origin.protocol;
          canonical.host = origin.host;
        } catch {
          // Keep canonical origin as-is when request origin is invalid.
        }
      }

      canonical.hash = '';
      canonical.pathname = this.normalizePathname(canonical.pathname);

      return canonical.toString();
    } catch {
      return absolute;
    }
  }

  private normalizePathname(pathname: string): string {
    const normalized = pathname.replace(/\/+/g, '/');
    if (!normalized || normalized === '/') {
      return '/';
    }

    return normalized.replace(/\/+$/, '');
  }

  private firstForwardedValue(value: string | null | undefined): string | undefined {
    if (!value) {
      return undefined;
    }

    const first = value.split(',')[0]?.trim();
    return first || undefined;
  }

  private setCanonical(url: string): void {
    const head = this.document.head;
    if (!head) {
      return;
    }

    let linkEl = head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = this.document.createElement('link');
      linkEl.setAttribute('rel', 'canonical');
      head.appendChild(linkEl);
    }
    linkEl.setAttribute('href', url);
  }

  private setJsonLd(jsonLd: Record<string, unknown> | null): void {
    const head = this.document.head;
    if (!head) {
      return;
    }

    const scriptId = 'seo-jsonld';
    let scriptEl = head.querySelector(`#${scriptId}`) as HTMLScriptElement | null;

    if (!jsonLd) {
      if (scriptEl) {
        scriptEl.remove();
      }
      return;
    }

    if (!scriptEl) {
      scriptEl = this.document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      head.appendChild(scriptEl);
    }

    // Setting textContent is safe for JSON-LD; it must not be HTML.
    scriptEl.textContent = JSON.stringify(jsonLd);

    // In the browser, ensure the DOM updates immediately.
    if (isPlatformBrowser(this.platformId)) {
      // no-op; kept intentionally to document intent.
    }
  }
}
