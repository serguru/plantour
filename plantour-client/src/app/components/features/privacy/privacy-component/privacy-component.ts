import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../../../services/seo-service';

@Component({
  selector: 'app-privacy-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-component.html',
  styleUrl: './privacy-component.scss',
})
export class PrivacyComponent implements OnInit {
  componentId = 'privacy';
  appName = 'Plantour';
  lastUpdated = 'March 16, 2026';
  supportContact = 'the support channel available in the app';

  private readonly seoService = inject(SeoService);
  private readonly document = inject(DOCUMENT);

  ngOnInit(): void {
    const canonicalUrl = this.toAbsoluteUrl('/privacy');
    const title = `Privacy Policy | ${this.appName}`;
    const description = this.trimDescription(
      `${this.appName} Privacy Policy: what we collect, how we use it, payments, retention, and how to request deletion.`,
    );

    this.seoService.setSeo({
      title,
      description,
      canonicalUrl,
      ogType: 'article',
      jsonLd: this.legalJsonLd({
        canonicalUrl,
        title,
        description,
        pageName: 'Privacy Policy',
      }),
    });
  }

  private trimDescription(value: string, maxLen = 160): string {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLen) {
      return normalized;
    }
    return `${normalized.slice(0, maxLen - 1).trimEnd()}…`;
  }

  private toAbsoluteUrl(path: string): string {
    try {
      return new URL(path, this.document.baseURI).toString();
    } catch {
      return path;
    }
  }

  private toIsoDate(value: string): string | undefined {
    try {
      const dt = new Date(value);
      if (Number.isNaN(dt.getTime())) {
        return undefined;
      }
      return dt.toISOString().slice(0, 10);
    } catch {
      return undefined;
    }
  }

  private legalJsonLd(input: {
    canonicalUrl: string;
    title: string;
    description: string;
    pageName: string;
  }): Record<string, unknown> {
    const homeUrl = this.toAbsoluteUrl('/');
    const modified = this.toIsoDate(this.lastUpdated);

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: homeUrl },
            { '@type': 'ListItem', position: 2, name: input.pageName, item: input.canonicalUrl },
          ],
        },
        {
          '@type': 'WebPage',
          '@id': input.canonicalUrl,
          url: input.canonicalUrl,
          name: input.title,
          description: input.description,
          dateModified: modified,
          isPartOf: {
            '@type': 'WebSite',
            '@id': homeUrl,
            url: homeUrl,
            name: this.appName,
          },
        },
      ],
    };
  }
}
