import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { REQUEST } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { SeoService } from '../../services/seo-service';
import { HELP_HOME_PAGE_ID, HELP_PAGES } from './help-content';
import { HelpBlock, HelpBreadcrumb, HelpPage } from './help.models';
import { HelpSearchService } from './help-search.service';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './help-component.html',
  styleUrl: './help-component.scss'
})
export class HelpComponent {
  componentId = 'help';

  private readonly router = inject(Router);
  private readonly seoService = inject(SeoService);
  private readonly helpSearchService = inject(HelpSearchService);
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });

  private readonly pageMap = new Map<string, HelpPage>(HELP_PAGES.map((page) => [page.id, page]));
  private readonly currentPath = signal<string[]>([]);

  readonly searchQuery = signal('');

  readonly currentPage = computed(() => {
    const joinedPath = this.currentPath().join('/');
    const page = HELP_PAGES.find((item) => item.path.join('/') === joinedPath);
    return page ?? this.pageMap.get(HELP_HOME_PAGE_ID) ?? HELP_PAGES[0];
  });

  readonly breadcrumbs = computed<HelpBreadcrumb[]>(() => {
    const trail: HelpBreadcrumb[] = [];
    let page: HelpPage | undefined = this.currentPage();

    while (page) {
      trail.unshift({
        label: page.title,
        url: this.pageUrl(page),
        pageId: page.id
      });
      page = page.parentId ? this.pageMap.get(page.parentId) : undefined;
    }

    return trail;
  });

  readonly childPages = computed(() => HELP_PAGES.filter((page) => page.parentId === this.currentPage().id));

  readonly sectionLinks = computed(() =>
    this.currentPage().blocks
      .filter((block) => !!block.title)
      .map((block) => ({
        id: block.id,
        title: block.title!
      }))
  );

  readonly relatedPages = computed(() =>
    (this.currentPage().relatedPageIds ?? [])
      .map((pageId) => this.pageMap.get(pageId))
      .filter((page): page is HelpPage => !!page)
  );

  readonly searchResults = computed(() => this.helpSearchService.search(this.searchQuery()));

  readonly hasSearchQuery = computed(() => this.searchQuery().trim().length > 0);

  constructor() {
    this.syncCurrentPathFromUrl();

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.syncCurrentPathFromUrl();
    });

    effect(() => {
      const page = this.currentPage();
      this.seoService.setSeo({
        title: `${page.title} | Plantour Help`,
        description: page.description,
        canonicalUrl: this.buildAbsoluteUrl(this.pageUrl(page)),
        ogType: 'article',
        jsonLd: this.buildJsonLd(page)
      });
    });
  }

  pageUrl(page: HelpPage): string {
    return page.path.length === 0 ? '/help' : `/help/${page.path.join('/')}`;
  }

  pageUrlById(pageId: string): string {
    const page = this.pageMap.get(pageId);
    return page ? this.pageUrl(page) : '/help';
  }

  blockAnchor(block: HelpBlock): string {
    return block.id;
  }

  backLink(): string {
    const page = this.currentPage();
    if (!page.parentId) {
      return '/help';
    }

    const parent = this.pageMap.get(page.parentId);
    return parent ? this.pageUrl(parent) : '/help';
  }

  backLabel(): string {
    const page = this.currentPage();
    if (!page.parentId) {
      return 'Back to Help';
    }

    const parent = this.pageMap.get(page.parentId);
    return parent ? `Back to ${parent.title}` : 'Back to Help';
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  async openSearchResult(pageId: string): Promise<void> {
    this.searchQuery.set('');
    const page = this.pageMap.get(pageId);
    if (!page) {
      return;
    }

    await this.router.navigateByUrl(this.pageUrl(page));
  }

  trackByPageId(_: number, page: HelpPage): string {
    return page.id;
  }

  trackByBlockId(_: number, block: HelpBlock): string {
    return block.id;
  }

  private syncCurrentPathFromUrl(): void {
    const cleanUrl = this.router.url.split('?')[0].split('#')[0];
    const withoutLeadingSlash = cleanUrl.startsWith('/') ? cleanUrl.slice(1) : cleanUrl;
    const segments = withoutLeadingSlash.split('/').filter((segment) => segment.length > 0);
    this.currentPath.set(segments[0] === 'help' ? segments.slice(1) : []);
  }

  private buildAbsoluteUrl(path: string): string {
    if (this.request?.url) {
      const protocol = this.request.headers?.get('x-forwarded-proto') ?? undefined;
      const host = this.request.headers?.get('x-forwarded-host') ?? this.request.headers?.get('host') ?? undefined;

      if (protocol && host) {
        return `${protocol}://${host}${path}`;
      }
    }

    if (typeof this.document?.location?.origin === 'string' && this.document.location.origin) {
      return `${this.document.location.origin}${path}`;
    }

    return path;
  }

  private buildJsonLd(page: HelpPage): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: this.breadcrumbs().map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.label,
        item: this.buildAbsoluteUrl(breadcrumb.url)
      }))
    };
  }
}