import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  robots?: string;
  jsonLd?: Record<string, unknown> | null;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

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

    const canonicalUrl = config.canonicalUrl;
    if (canonicalUrl) {
      this.setCanonical(canonicalUrl);
    }

    const ogType = config.ogType ?? 'website';
    if (canonicalUrl) {
      this.meta.updateTag({ property: 'og:url', content: canonicalUrl }, "property='og:url'");
    }

    this.meta.updateTag({ property: 'og:type', content: ogType }, "property='og:type'");
    this.meta.updateTag({ property: 'og:title', content: config.title }, "property='og:title'");
    this.meta.updateTag(
      { property: 'og:description', content: config.description },
      "property='og:description'",
    );

    this.meta.updateTag({ name: 'twitter:card', content: 'summary' }, "name='twitter:card'");
    this.meta.updateTag({ name: 'twitter:title', content: config.title }, "name='twitter:title'");
    this.meta.updateTag(
      { name: 'twitter:description', content: config.description },
      "name='twitter:description'",
    );

    this.setJsonLd(config.jsonLd ?? null);
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
