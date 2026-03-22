import { Injectable, computed, inject, signal } from '@angular/core';
import { Index } from 'flexsearch';
import { catchError, of, timeout } from 'rxjs';
import { HELP_PAGES, HELP_SECTIONS, getHelpBreadcrumbs, getHelpPageUrl } from '../components/help/help-content';
import { GENERATED_PUBLIC_PAGE_DOCUMENTS } from './generated-public-page-documents';
import { PublicTemplateThingDto, PublicTemplatesService } from './public-templates-service';

const SEARCH_RESULT_LIMIT = 20;

export interface SearchDocument {
  id: string;
  title: string;
  summary: string;
  description: string;
  url: string;
  breadcrumbText: string;
  keywords: string[];
  searchText: string;
  sourceLabel: string;
}

export interface SearchResult {
  document: SearchDocument;
  titleHtml: string;
  breadcrumbHtml: string;
  summaryHtml: string;
  urlHtml: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly publicTemplatesService = inject(PublicTemplatesService);

  private readonly index = new Index({
    tokenize: 'forward',
    resolution: 9
  });

  private readonly documentsById = new Map<string, SearchDocument>();
  private readonly dynamicSourcesLoaded = signal(false);
  private readonly dynamicSourcesLoading = signal(false);
  private readonly indexRevisionInternal = signal(0);

  readonly indexRevision = this.indexRevisionInternal.asReadonly();
  readonly isDynamicSourcesLoading = computed(() => this.dynamicSourcesLoading());

  constructor() {
    this.addDocuments(this.buildStaticDocuments());
  }

  ensureDynamicSourcesLoaded(): void {
    if (this.dynamicSourcesLoaded() || this.dynamicSourcesLoading()) {
      return;
    }

    this.dynamicSourcesLoading.set(true);

    this.publicTemplatesService.getTemplateThings().pipe(
      timeout({ first: 4000 }),
      catchError(() => of([] as PublicTemplateThingDto[]))
    ).subscribe({
      next: (templates) => {
        this.addDocuments(this.buildPublicTemplateDocuments(templates));
      },
      complete: () => {
        this.dynamicSourcesLoading.set(false);
        this.dynamicSourcesLoaded.set(true);
      },
      error: () => {
        this.dynamicSourcesLoading.set(false);
        this.dynamicSourcesLoaded.set(true);
      }
    });
  }

  search(query: string, highlightMatches = true): SearchResult[] {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const exactMatches = this.collectExactMatches(trimmedQuery);
    const rankedMatches = this.collectCandidateDocuments(trimmedQuery, new Set(exactMatches.map((document) => document.id)));

    return [...exactMatches, ...rankedMatches]
      .slice(0, SEARCH_RESULT_LIMIT)
      .map((document) => this.buildSearchResult(document, trimmedQuery, highlightMatches))
      .filter((result): result is SearchResult => !!result);
  }

  private addDocuments(documents: SearchDocument[]): void {
    for (const document of documents) {
      if (this.documentsById.has(document.id)) {
        continue;
      }

      this.documentsById.set(document.id, document);
      this.index.add(document.id, this.buildIndexText(document));
    }

    this.indexRevisionInternal.update((value) => value + 1);
  }

  private buildStaticDocuments(): SearchDocument[] {
    const staticDocuments: SearchDocument[] = GENERATED_PUBLIC_PAGE_DOCUMENTS;
    const helpSectionDocuments: SearchDocument[] = HELP_SECTIONS.map((section) => ({
      id: `help-section/${section.id}`,
      title: section.title,
      summary: section.summary,
      description: section.summary,
      url: '/help',
      breadcrumbText: `Help / ${section.title}`,
      keywords: [...section.keywords, ...section.questions.map((question) => question.question)],
      searchText: [
        section.title,
        section.summary,
        ...section.questions.map((question) => `${question.question} ${question.summary}`)
      ].join(' '),
      sourceLabel: 'Help section'
    }));

    const helpDocuments = HELP_PAGES
      .filter((page) => page.searchable && page.allowIndexing)
      .map<SearchDocument>((page) => ({
        id: `help/${page.id}`,
        title: page.title,
        summary: page.summary,
        description: page.description,
        url: getHelpPageUrl(page),
        breadcrumbText: getHelpBreadcrumbs(page.id).map((breadcrumb) => breadcrumb.label).join(' / '),
        keywords: page.keywords,
        searchText: page.searchText,
        sourceLabel: 'Help'
      }));

    return [...staticDocuments, ...helpSectionDocuments, ...helpDocuments];
  }

  private collectExactMatches(query: string): SearchDocument[] {
    const normalizedQuery = this.normalizeSearchValue(query);

    return Array.from(this.documentsById.values())
      .filter((document) => this.isExactLookupMatch(document, normalizedQuery))
      .sort((left, right) => this.compareExactMatches(left, right, normalizedQuery));
  }

  private collectCandidateDocuments(query: string, excludedIds: Set<string>): SearchDocument[] {
    const indexedIds = this.index.search(query, { limit: SEARCH_RESULT_LIMIT }) as string[];
    const combinedScores = new Map<string, number>();

    indexedIds.forEach((id, index) => {
      if (excludedIds.has(id)) {
        return;
      }

      combinedScores.set(id, 1000 - index);
    });

    for (const document of this.documentsById.values()) {
      if (excludedIds.has(document.id)) {
        continue;
      }

      const matchScore = this.scoreLiteralMatch(document, query);
      if (matchScore > 0) {
        combinedScores.set(document.id, (combinedScores.get(document.id) ?? 0) + matchScore);
      }
    }

    return Array.from(combinedScores.entries())
      .sort((left, right) => {
        if (right[1] !== left[1]) {
          return right[1] - left[1];
        }

        return left[0].localeCompare(right[0]);
      })
      .slice(0, SEARCH_RESULT_LIMIT)
      .map(([id]) => this.documentsById.get(id))
      .filter((document): document is SearchDocument => !!document);
  }

  private isExactLookupMatch(document: SearchDocument, normalizedQuery: string): boolean {
    if (!normalizedQuery) {
      return false;
    }

    const normalizedTitle = this.normalizeSearchValue(document.title);
    if (normalizedTitle === normalizedQuery) {
      return true;
    }

    const normalizedBreadcrumb = this.normalizeSearchValue(document.breadcrumbText);
    if (normalizedBreadcrumb === normalizedQuery) {
      return true;
    }

    const breadcrumbTail = normalizedBreadcrumb.split(' ').slice(-normalizedQuery.split(' ').length).join(' ');
    return breadcrumbTail === normalizedQuery;
  }

  private compareExactMatches(left: SearchDocument, right: SearchDocument, normalizedQuery: string): number {
    const leftTitle = this.normalizeSearchValue(left.title);
    const rightTitle = this.normalizeSearchValue(right.title);
    const leftTitleExact = leftTitle === normalizedQuery;
    const rightTitleExact = rightTitle === normalizedQuery;

    if (leftTitleExact !== rightTitleExact) {
      return leftTitleExact ? -1 : 1;
    }

    return left.title.localeCompare(right.title);
  }

  private scoreLiteralMatch(document: SearchDocument, query: string): number {
    const normalizedQuery = query.toLocaleLowerCase();
    const normalizedTitle = document.title.toLocaleLowerCase();
    const normalizedBreadcrumb = document.breadcrumbText.toLocaleLowerCase();
    let score = 0;

    if (normalizedTitle === normalizedQuery) {
      score += 10000;
    } else if (normalizedTitle.startsWith(normalizedQuery)) {
      score += 6000;
    }

    if (normalizedBreadcrumb === normalizedQuery || normalizedBreadcrumb.endsWith(` / ${normalizedQuery}`)) {
      score += 5000;
    }

    score += this.matchScoreForField(document.title, normalizedQuery, 600);
    score += this.matchScoreForField(document.breadcrumbText, normalizedQuery, 500);
    score += this.matchScoreForField(document.keywords.join(' '), normalizedQuery, 450);
    score += this.matchScoreForField(document.summary, normalizedQuery, 350);
    score += this.matchScoreForField(document.description, normalizedQuery, 250);
    score += this.matchScoreForField(document.searchText, normalizedQuery, 150);

    return score;
  }

  private matchScoreForField(value: string, normalizedQuery: string, weight: number): number {
    const normalizedValue = value.toLocaleLowerCase();
    const index = normalizedValue.indexOf(normalizedQuery);
    if (index < 0) {
      return 0;
    }

    return Math.max(1, weight - Math.min(index, weight - 1));
  }

  private normalizeSearchValue(value: string): string {
    return value
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private buildPublicTemplateDocuments(items: PublicTemplateThingDto[]): SearchDocument[] {
    const groups = new Map<string, PublicTemplateThingDto[]>();

    for (const item of items) {
      if (!groups.has(item.templateId)) {
        groups.set(item.templateId, []);
      }

      groups.get(item.templateId)!.push(item);
    }

    return Array.from(groups.entries()).map(([templateId, templateItems]) => {
      const firstItem = templateItems[0]!;
      const categories = Array.from(new Set(templateItems.map((item) => item.category).filter((category): category is string => !!category)));
      const itemNames = templateItems.map((item) => item.thingName);
      const templateName = firstItem.templateName;
      const activityName = firstItem.activityName;
      const ageRangeName = firstItem.ageRangeName ?? '';
      const temperatureRangeName = firstItem.temperatureRangeName ?? '';
      const url = `/packing-list-generator/templates/${this.slugify(templateName)}~${templateId}`;

      return {
        id: `template/${templateId}`,
        title: templateName,
        summary: `Packing template for ${activityName}${ageRangeName ? `, ${ageRangeName}` : ''}${temperatureRangeName ? `, ${temperatureRangeName}` : ''}.`,
        description: `Detailed packing checklist for ${templateName} with items, categories, and conditions.`,
        url,
        breadcrumbText: 'Home / Public Templates / Template',
        keywords: ['template', 'packing template', activityName, ageRangeName, temperatureRangeName, ...categories].filter((value) => !!value),
        searchText: [templateName, activityName, ageRangeName, temperatureRangeName, ...categories, ...itemNames, ...templateItems.map((item) => item.thingNotes ?? '')].join(' '),
        sourceLabel: 'Public template'
      };
    });
  }

  private buildIndexText(document: SearchDocument): string {
    return [
      document.title,
      document.title,
      document.summary,
      document.description,
      document.breadcrumbText,
      document.keywords.join(' '),
      document.searchText
    ].join(' ');
  }

  private buildSearchResult(document: SearchDocument, query: string, highlightMatches: boolean): SearchResult | null {
    const haystack = [
      document.title,
      document.summary,
      document.description,
      document.breadcrumbText,
      document.searchText
    ].join(' ');

    if (!this.containsLiteralMatch(haystack, query)) {
      return null;
    }

    const summarySource = this.pickSummarySource(document, query);

    return {
      document,
      titleHtml: this.formatText(document.title, query, highlightMatches),
      breadcrumbHtml: this.formatText(`${document.sourceLabel} / ${document.breadcrumbText}`, query, highlightMatches),
      summaryHtml: this.formatText(summarySource, query, highlightMatches),
      urlHtml: this.escapeHtml(document.url)
    };
  }

  private pickSummarySource(document: SearchDocument, query: string): string {
    const candidates = [
      document.summary,
      document.description,
      document.searchText
    ];

    const matchSource = candidates.find((candidate) => this.containsLiteralMatch(candidate, query));
    if (!matchSource) {
      return document.summary;
    }

    return this.buildExcerpt(matchSource, query);
  }

  private containsLiteralMatch(text: string, query: string): boolean {
    return text.toLocaleLowerCase().includes(query.toLocaleLowerCase());
  }

  private buildExcerpt(text: string, query: string): string {
    const matchIndex = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
    if (matchIndex < 0) {
      return text;
    }

    const excerptRadius = 72;
    const start = Math.max(0, matchIndex - excerptRadius);
    const end = Math.min(text.length, matchIndex + query.length + excerptRadius);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < text.length ? '...' : '';

    return `${prefix}${text.slice(start, end).trim()}${suffix}`;
  }

  private formatText(text: string, query: string, highlightMatches: boolean): string {
    const escapedText = this.escapeHtml(text);
    if (!highlightMatches) {
      return escapedText;
    }

    const escapedQuery = this.escapeRegExp(query);
    if (!escapedQuery) {
      return escapedText;
    }

    return escapedText.replace(new RegExp(`(${escapedQuery})`, 'gi'), '<mark>$1</mark>');
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

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 60);
  }
}