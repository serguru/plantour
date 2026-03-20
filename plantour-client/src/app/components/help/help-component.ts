import { CommonModule, DOCUMENT } from '@angular/common';
import { afterNextRender, Component, computed, effect, inject, signal } from '@angular/core';
import { REQUEST } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { EntitiesHeader, HeaderButtonConfig } from '../entities/entities-header-component/entities-header-component';
import { SeoService } from '../../services/seo-service';
import { HELP_FAQ_SECTIONS, HELP_FUTURE_PAGES_PAGE_ID, HELP_HOME_PAGE_ID, HelpFaqSection, HELP_PAGES } from './help-content';
import { HelpPage } from './help.models';
import { HelpSearchService } from './help-search.service';

const HELP_SEARCH_PANEL_VISIBLE_STORAGE_KEY = 'plantour.help.searchPanelVisible';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EntitiesHeader],
  template: `
    <div class="help-shell">
      <app-entities-header
        entityIcon="pi pi-question-circle"
        title="Help"
        [headerButtons]="headerButtons()"
        [showHelpAction]="false"
        [useEntitiesActions]="false"
      ></app-entities-header>

      @if (searchPanelVisible()) {
        <section class="help-search-panel" aria-label="Help search">
          <div class="help-search-panel__header">
            <label class="help-search-label" for="help-search">Search</label>
            <label class="help-search-checkbox">
              <input
                type="checkbox"
                [ngModel]="highlightFoundOccurrences()"
                (ngModelChange)="highlightFoundOccurrences.set(!!$event)"
              />
              <span>Highlight found occurences</span>
            </label>
          </div>

          <div class="help-search-box">
            <i class="pi pi-search"></i>
            <input
              id="help-search"
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="updateSearchQuery($event)"
              placeholder="Try: guest access, packing list, shared item"
            />
            @if (hasSearchQuery()) {
              <button type="button" class="help-search-clear" (click)="clearSearch()" aria-label="Clear search">
                <i class="pi pi-times"></i>
              </button>
            }
          </div>

          @if (hasSearchQuery()) {
            <div class="help-search-results" aria-live="polite">
              @if (searchResults().length > 0) {
                @for (result of searchResults(); track result.page.id) {
                  <button
                    type="button"
                    class="help-search-result"
                    (click)="openSearchResult(result.page.id)"
                    [attr.aria-label]="result.page.title"
                  >
                    <span class="help-search-result__title" [innerHTML]="result.titleHtml"></span>
                    <span class="help-search-result__crumbs" [innerHTML]="result.breadcrumbHtml"></span>
                    <span class="help-search-result__summary" [innerHTML]="result.summaryHtml"></span>
                  </button>
                }
              } @else {
                <span class="help-search-empty">No help pages match your search yet.</span>
              }
            </div>
          }
        </section>
      }

      <section class="help-faq-page">
        <article class="help-page-content">
          @for (block of currentPage().blocks; track $index) {
            <section class="help-block" [attr.id]="block.id">
              @if (block.kind === 'paragraphs') {
                @if (block.title) {
                  <h2 [innerHTML]="highlightText(block.title)"></h2>
                }
                @for (paragraph of block.paragraphs; track paragraph) {
                  <p [innerHTML]="highlightText(paragraph)"></p>
                }
              }
            </section>
          }
        </article>

        <div class="help-faq-directory">
          @for (section of faqSections; track section.id; let isFirst = $first) {
            <details
              class="help-faq-section"
              [open]="isSectionExpanded(section.id, isFirst)"
              (toggle)="onSectionToggle(section.id, $event)"
            >
              <summary>
                <div class="help-faq-section__heading">
                  <span class="help-faq-section__title">{{ section.title }}</span>
                  <span class="help-faq-section__summary">{{ section.summary }}</span>
                </div>
                <span class="help-faq-section__arrow" aria-hidden="true"></span>
              </summary>

              <ol class="help-faq-question-list">
                @for (question of section.questions; track question.pageId) {
                  <li>
                    <a [routerLink]="pageUrlById(question.pageId)" class="help-faq-question-link">
                      {{ question.question }}
                    </a>
                  </li>
                }
              </ol>
            </details>
          }
        </div>
      </section>
    </div>
  `,
  styleUrl: './help-component.scss'
})
export class HelpComponent {
  componentId = 'help';
  readonly faqSections = HELP_FAQ_SECTIONS;

  private readonly router = inject(Router);
  private readonly seoService = inject(SeoService);
  private readonly helpSearchService = inject(HelpSearchService);
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });

  private readonly pageMap = new Map<string, HelpPage>(HELP_PAGES.map((page) => [page.id, page]));
  private readonly currentPath = signal<string[]>([]);

  readonly searchQuery = signal('');
  readonly searchPanelVisible = signal(false);
  readonly highlightFoundOccurrences = signal(true);
  readonly expandedSections = signal<Record<string, boolean>>(this.createExpandedSectionsState());
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
    }
  ]);

  readonly hasSearchQuery = computed(() => this.searchQuery().trim().length > 0);
  readonly shouldHighlightMatches = computed(() => this.highlightFoundOccurrences() && this.hasSearchQuery());
  readonly searchResults = computed(() =>
    this.helpSearchService.search(this.searchQuery(), this.shouldHighlightMatches())
  );

  constructor() {
    this.syncCurrentPathFromUrl();

    afterNextRender(() => {
      this.restoreSearchPanelVisibility();
    });

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.syncCurrentPathFromUrl();
      this.expandedSections.set(this.createExpandedSectionsState());
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

  currentPage(): HelpPage {
    const joinedPath = this.currentPath().join('/');
    const page = HELP_PAGES.find((item) => item.path.join('/') === joinedPath);
    return page ?? this.pageMap.get(HELP_HOME_PAGE_ID) ?? HELP_PAGES[0];
  }

  isSectionExpanded(sectionId: string, isFirst: boolean): boolean {
    const explicitState = this.expandedSections()[sectionId];
    if (explicitState !== undefined) {
      return explicitState;
    }

    return isFirst || this.currentPage().id === HELP_FUTURE_PAGES_PAGE_ID || sectionId === this.getSectionIdFromPath();
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

  clearSearch(): void {
    this.searchQuery.set('');
  }

  updateSearchQuery(query: string): void {
    this.searchQuery.set(query);

    if (query.trim().length > 0) {
      this.setSearchPanelVisible(true);
    }
  }

  toggleSearchPanel(): void {
    this.setSearchPanelVisible(!this.searchPanelVisible());
  }

  highlightText(text: string | undefined): string {
    const safeText = text ?? '';
    const escapedText = this.escapeHtml(safeText);

    if (!this.shouldHighlightMatches()) {
      return escapedText;
    }

    const escapedQuery = this.escapeRegExp(this.searchQuery().trim());
    if (!escapedQuery) {
      return escapedText;
    }

    return escapedText.replace(new RegExp(`(${escapedQuery})`, 'gi'), '<mark>$1</mark>');
  }
  async openSearchResult(pageId: string): Promise<void> {
    const page = this.pageMap.get(pageId);
    if (!page) {
      return;
    }

    await this.router.navigateByUrl(this.pageUrl(page));
  }

  private syncCurrentPathFromUrl(): void {
    const cleanUrl = this.router.url.split('?')[0].split('#')[0];
    const withoutLeadingSlash = cleanUrl.startsWith('/') ? cleanUrl.slice(1) : cleanUrl;
    const segments = withoutLeadingSlash.split('/').filter((segment) => segment.length > 0);
    this.currentPath.set(segments[0] === 'help' ? segments.slice(1) : []);
  }

  private getSectionIdFromPath(): string | null {
    const currentPath = this.currentPath();
    return currentPath.length >= 2 ? currentPath[0] ?? null : null;
  }

  private createExpandedSectionsState(): Record<string, boolean> {
    const activeSectionId = this.getSectionIdFromPath();

    return Object.fromEntries(
      this.faqSections.map((section, index) => [
        section.id,
        activeSectionId ? section.id === activeSectionId : index === 0 || this.currentPage().id === HELP_FUTURE_PAGES_PAGE_ID
      ])
    );
  }

  private expandAllSections(): void {
    this.expandedSections.set(
      Object.fromEntries(this.faqSections.map((section) => [section.id, true]))
    );
  }

  private collapseAllSections(): void {
    this.expandedSections.set(
      Object.fromEntries(this.faqSections.map((section) => [section.id, false]))
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
      '@type': 'TechArticle',
      headline: page.title,
      description: page.description,
      url: this.buildAbsoluteUrl(this.pageUrl(page))
    };
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
