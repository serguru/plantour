import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { REQUEST } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntitiesHeader } from '../entities/entities-header-component/entities-header-component';
import { HelpSearchService } from '../../services/help-search-service';
import { SeoService } from '../../services/seo-service';
import { HELP_HOME_PAGE_ID, HELP_SEARCH_PAGE_ID, getHelpPageUrl, getHelpBreadcrumbs } from './help-content';

@Component({
  selector: 'app-help-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EntitiesHeader],
  templateUrl: './help-search-results-component.html',
  styleUrl: './help-component.scss'
})
export class HelpSearchResultsComponent {
  componentId = 'help';

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly helpSearchService = inject(HelpSearchService);
  private readonly seoService = inject(SeoService);
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });

  readonly searchQuery = signal('');
  readonly breadcrumbs = computed(() => getHelpBreadcrumbs(HELP_SEARCH_PAGE_ID));
  readonly searchResults = computed(() => this.helpSearchService.search(this.searchQuery(), true));

  constructor() {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.searchQuery.set(params.get('q')?.trim() ?? '');
    });

    effect(() => {
      const query = this.searchQuery();
      const canonicalUrl = this.buildAbsoluteUrl(getHelpPageUrl(HELP_SEARCH_PAGE_ID));
      const description = query
        ? `Search results for ${query} in the Plantour help center.`
        : 'Search the Plantour help center for matching questions and answers.';

      this.seoService.setSeo({
        title: query ? `Search Help: ${query} | Plantour` : 'Search Plantour Help | Plantour',
        description,
        canonicalUrl,
        ogType: 'website',
        robots: 'noindex,follow',
        jsonLd: this.buildJsonLd(canonicalUrl, description)
      });
    });
  }

  async submitSearch(event: Event): Promise<void> {
    event.preventDefault();

    const query = this.searchQuery().trim();
    await this.router.navigate(['/help/search'], {
      queryParams: query ? { q: query } : {}
    });
  }

  pageUrl(pageId: string): string {
    return getHelpPageUrl(pageId);
  }

  homeUrl(): string {
    return getHelpPageUrl(HELP_HOME_PAGE_ID);
  }

  private buildAbsoluteUrl(path: string): string {
    const protocol = this.request?.headers?.get('x-forwarded-proto') ?? undefined;
    const host = this.request?.headers?.get('x-forwarded-host') ?? this.request?.headers?.get('host') ?? undefined;
    if (protocol && host) {
      return `${protocol}://${host}${path}`;
    }

    try {
      return new URL(path, this.document.baseURI).toString();
    } catch {
      return path;
    }
  }

  private buildJsonLd(canonicalUrl: string, description: string): Record<string, unknown> {
    const homeUrl = this.buildAbsoluteUrl(getHelpPageUrl(HELP_HOME_PAGE_ID));
    const results = this.searchResults().map((result, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: result.page.title,
      url: this.buildAbsoluteUrl(this.pageUrl(result.page.id))
    }));

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: this.breadcrumbs().map((breadcrumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: breadcrumb.label,
            item: this.buildAbsoluteUrl(breadcrumb.url)
          }))
        },
        {
          '@type': 'SearchResultsPage',
          '@id': canonicalUrl,
          url: canonicalUrl,
          name: 'Search Plantour Help',
          description,
          isPartOf: {
            '@type': 'WebSite',
            '@id': homeUrl,
            url: homeUrl,
            name: 'Plantour'
          },
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: results
          }
        }
      ]
    };
  }
}