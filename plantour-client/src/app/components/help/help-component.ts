import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { REQUEST } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { EntitiesHeader, HeaderButtonConfig } from '../entities/entities-header-component/entities-header-component';
import { SeoService } from '../../services/seo-service';
import { ENVIRONMENT } from '../../../environment.token';
import {
  HELP_HOME_PAGE_ID,
  HELP_SECTIONS,
  HelpPage,
  findHelpPageByPath,
  getHelpPageUrl
} from './help-content';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterLink, EntitiesHeader],
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
  private readonly environment = inject(ENVIRONMENT);

  readonly currentPage = computed<HelpPage>(() => findHelpPageByPath([])!);
  readonly visibleSections = computed(() => this.sections);
  readonly appVersion = this.environment.version;
  readonly expandedSections = signal<Record<string, boolean>>({});
  readonly currentFragment = signal<string | null>(null);
  readonly allVisibleSectionsExpanded = computed(() =>
    this.visibleSections().every((section, index) => this.isSectionExpanded(section.id, index === 0))
  );
  readonly allVisibleSectionsCollapsed = computed(() =>
    this.visibleSections().every((section, index) => !this.isSectionExpanded(section.id, index === 0))
  );
  readonly headerButtons = computed<HeaderButtonConfig[]>(() => [
    {
      label: 'Expand all',
      icon: 'angle-double-down',
      action: () => this.expandAllSections(),
      disabled: this.allVisibleSectionsExpanded()
    },
    {
      label: 'Collapse all',
      icon: 'angle-double-up',
      action: () => this.collapseAllSections(),
      disabled: this.allVisibleSectionsCollapsed()
    }
  ]);

  constructor() {
    this.syncCurrentFragmentFromUrl();
    this.expandedSections.set(this.createExpandedSectionsState());

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.syncCurrentFragmentFromUrl();
      this.expandedSections.set(this.createExpandedSectionsState());
    });

    effect(() => {
      const page = this.currentPage();
      this.seoService.setSeo({
        title: page.id === HELP_HOME_PAGE_ID ? 'Plantour Help Center' : `${page.title} | Plantour Help`,
        description: page.description,
        canonicalUrl: this.buildAbsoluteUrl(this.pageUrl(page.id)),
        ogType: 'website',
        robots: page.allowIndexing ? 'index,follow' : 'noindex,nofollow,noarchive,nosnippet',
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

  expandAllSections(): void {
    this.expandedSections.set(
      Object.fromEntries(this.visibleSections().map((section) => [section.id, true]))
    );
  }

  collapseAllSections(): void {
    this.expandedSections.set(
      Object.fromEntries(this.visibleSections().map((section) => [section.id, false]))
    );
  }

  isSectionExpanded(sectionId: string, isFirst: boolean): boolean {
    const explicitState = this.expandedSections()[sectionId];
    if (explicitState !== undefined) {
      return explicitState;
    }

    return isFirst;
  }

  onSectionToggle(sectionId: string, event: Event): void {
    const details = event.target as HTMLDetailsElement | null;
    if (!details) {
      return;
    }

    this.expandedSections.update((current) => ({
      ...current,
      [sectionId]: details.open
    }));
  }

  private createExpandedSectionsState(): Record<string, boolean> {
    const currentFragment = this.currentFragment();

    return Object.fromEntries(
      this.visibleSections().map((section, index) => [
        section.id,
        currentFragment ? section.id === currentFragment : index === 0
      ])
    );
  }

  private syncCurrentFragmentFromUrl(): void {
    this.currentFragment.set(this.router.parseUrl(this.router.url).fragment ?? null);
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
    const questions = this.sections.flatMap((section) => section.questions);

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Help',
              item: canonicalUrl
            }
          ]
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
            itemListElement: questions
              .map((question, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: question.question,
                url: this.buildAbsoluteUrl(this.pageUrlById(question.pageId))
              }))
          }
        },
        {
          '@type': 'WebPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: page.title,
          description: page.description,
          isPartOf: {
            '@type': 'WebSite',
            '@id': homeUrl,
            url: homeUrl,
            name: 'Plantour'
          }
        }
      ]
    };
  }
}
