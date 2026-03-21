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

const HELP_SEARCH_PANEL_VISIBLE_STORAGE_KEY = 'plantour.help.searchPanelVisible';

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
  readonly searchPanelVisible = signal(false);
  readonly currentPage = computed<HelpPage>(() => findHelpPageByPath(this.currentPath()) ?? findHelpPageByPath([])!);
  readonly currentSection = computed<HelpSectionDefinition | null>(() => getHelpSection(this.currentPage().sectionId));
  readonly breadcrumbs = computed(() => getHelpBreadcrumbs(this.currentPage().id));
  readonly visibleSections = computed(() => this.currentSection() ? [this.currentSection()!] : this.sections);
  readonly expandedSections = signal<Record<string, boolean>>({});
  readonly relatedSections = computed(() => {
    const currentSection = this.currentSection();
    if (!currentSection) {
      return [];
    }

    return this.sections.filter((section) => section.id !== currentSection.id);
  });
  readonly headerButtons = computed<HeaderButtonConfig[]>(() => [
    {
      label: this.searchPanelVisible() ? 'Hide search' : 'Show search',
      icon: this.searchPanelVisible() ? 'eye-slash' : 'search',
      action: () => this.toggleSearchPanel()
    },
    {
      label: 'Expand all',
      icon: 'angle-double-down',
      action: () => this.expandAllSections()
    },
    {
      label: 'Collapse all',
      icon: 'angle-double-up',
      action: () => this.collapseAllSections()
    },
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
    this.expandedSections.set(this.createExpandedSectionsState());
    this.restoreSearchPanelVisibility();

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.syncCurrentPathFromUrl();
      this.expandedSections.set(this.createExpandedSectionsState());
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

  async runSearch(): Promise<void> {
    const query = this.searchQuery().trim();
    await this.router.navigate(['/help/search'], {
      queryParams: query ? { q: query } : {}
    });
  }

  toggleSearchPanel(): void {
    this.setSearchPanelVisible(!this.searchPanelVisible());
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

  private syncCurrentPathFromUrl(): void {
    const cleanUrl = this.router.url.split('?')[0].split('#')[0];
    const withoutLeadingSlash = cleanUrl.startsWith('/') ? cleanUrl.slice(1) : cleanUrl;
    const segments = withoutLeadingSlash.split('/').filter((segment) => segment.length > 0);
    this.currentPath.set(segments[0] === 'help' ? segments.slice(1) : []);
  }

  private createExpandedSectionsState(): Record<string, boolean> {
    const currentSection = this.currentSection();

    return Object.fromEntries(
      this.visibleSections().map((section, index) => [
        section.id,
        currentSection ? section.id === currentSection.id : index === 0
      ])
    );
  }

  private setSearchPanelVisible(isVisible: boolean): void {
    this.searchPanelVisible.set(isVisible);
    this.storeBoolean(HELP_SEARCH_PANEL_VISIBLE_STORAGE_KEY, isVisible);
  }

  private restoreSearchPanelVisibility(): void {
    const storedValue = this.readStoredBoolean(HELP_SEARCH_PANEL_VISIBLE_STORAGE_KEY);
    if (storedValue !== null) {
      this.searchPanelVisible.set(storedValue);
    }
  }

  private storeBoolean(storageKey: string, value: boolean): void {
    const storage = this.getLocalStorage();
    if (!storage) {
      return;
    }

    try {
      storage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Ignore storage failures and keep the in-memory state.
    }
  }

  private readStoredBoolean(storageKey: string): boolean | null {
    const storage = this.getLocalStorage();
    if (!storage) {
      return null;
    }

    try {
      const value = storage.getItem(storageKey);
      if (value === null) {
        return null;
      }

      return JSON.parse(value) === true;
    } catch {
      return null;
    }
  }

  private getLocalStorage(): Storage | null {
    try {
      return this.document?.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
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
