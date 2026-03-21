import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { REQUEST } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { EntitiesHeader, HeaderButtonConfig } from '../entities/entities-header-component/entities-header-component';
import { SeoService } from '../../services/seo-service';
import {
  HELP_HOME_PAGE_ID,
  HELP_SECTIONS,
  HelpPage,
  HelpSectionDefinition,
  findHelpPageByPath,
  getHelpBreadcrumbs,
  getHelpPageUrl,
  getHelpSection
} from './help-content';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EntitiesHeader],
  templateUrl: './help-component.html',
  styleUrl: './help-component.scss'
})
export class HelpComponent {
  componentId = 'help';
  readonly sections = HELP_SECTIONS;

  private readonly router = inject(Router);
  private readonly seoService = inject(SeoService);
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });

  private readonly currentPath = signal<string[]>([]);

  readonly searchQuery = signal('');
  readonly currentPage = computed<HelpPage>(() => findHelpPageByPath(this.currentPath()) ?? findHelpPageByPath([])!);
  readonly currentSection = computed<HelpSectionDefinition | null>(() => getHelpSection(this.currentPage().sectionId));
  readonly breadcrumbs = computed(() => getHelpBreadcrumbs(this.currentPage().id));
  readonly visibleSections = computed(() => this.currentSection() ? [this.currentSection()!] : this.sections);
  readonly relatedSections = computed(() => {
    const currentSection = this.currentSection();
    if (!currentSection) {
      return [];
    }

    return this.sections.filter((section) => section.id !== currentSection.id);
  });
  readonly headerButtons = computed<HeaderButtonConfig[]>(() => [
    ...(this.currentSection()
      ? [{
          label: 'All sections',
          icon: 'list',
          action: () => {
            void this.router.navigateByUrl(getHelpPageUrl(HELP_HOME_PAGE_ID));
          }
        }]
      : [])
  ]);

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
        title: page.id === HELP_HOME_PAGE_ID ? 'Plantour Help' : `${page.title} | Plantour Help`,
        description: page.description,
        canonicalUrl: this.buildAbsoluteUrl(this.pageUrl(page.id)),
        ogType: 'website',
        jsonLd: this.buildJsonLd(page)
      });
    });
  }

  pageUrlById(pageId: string): string {
    return getHelpPageUrl(pageId);
  }

  pageUrl(pageId: string): string {
    return getHelpPageUrl(pageId);
  }

  sectionUrl(sectionId: string): string {
    return getHelpPageUrl(`${HELP_HOME_PAGE_ID}/${sectionId}`);
  }

  async submitSearch(event: Event): Promise<void> {
    event.preventDefault();

    const query = this.searchQuery().trim();
    await this.router.navigate(['/help/search'], {
      queryParams: query ? { q: query } : {}
    });
  }

  private syncCurrentPathFromUrl(): void {
    const cleanUrl = this.router.url.split('?')[0].split('#')[0];
    const withoutLeadingSlash = cleanUrl.startsWith('/') ? cleanUrl.slice(1) : cleanUrl;
    const segments = withoutLeadingSlash.split('/').filter((segment) => segment.length > 0);
    this.currentPath.set(segments[0] === 'help' ? segments.slice(1) : []);
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

  private buildJsonLd(page: HelpPage): Record<string, unknown> {
    const canonicalUrl = this.buildAbsoluteUrl(this.pageUrl(page.id));
    const homeUrl = this.buildAbsoluteUrl(getHelpPageUrl(HELP_HOME_PAGE_ID));
    const currentSection = this.currentSection();

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
          '@type': 'CollectionPage',
          '@id': canonicalUrl,
          url: canonicalUrl,
          name: page.title,
          description: page.description,
          isPartOf: {
            '@type': 'WebSite',
            '@id': homeUrl,
            url: homeUrl,
            name: 'Plantour'
          },
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: (currentSection ? currentSection.questions : this.sections)
              .map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: 'question' in item ? item.question : item.title,
                url: this.buildAbsoluteUrl('question' in item ? this.pageUrlById(item.pageId) : this.sectionUrl(item.id))
              }))
          }
        }
      ]
    };
  }
}
