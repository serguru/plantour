import { Injectable, computed, inject, signal } from '@angular/core';
import { Index } from 'flexsearch';
import { catchError, of, timeout } from 'rxjs';
import { HELP_PAGES, getHelpBreadcrumbs, getHelpPageUrl } from '../components/help/help-content';
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

    const ids = this.index.search(trimmedQuery, { limit: SEARCH_RESULT_LIMIT }) as string[];

    return ids
      .map((id) => this.documentsById.get(id))
      .filter((document): document is SearchDocument => !!document)
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
    const staticDocuments: SearchDocument[] = [
      {
        id: 'page/home',
        title: 'Plantour Packing Lists & Travel Planning App',
        summary: 'Plan trips, build packing lists, coordinate group travel, and get AI-powered packing suggestions with Plantour.',
        description: 'Plantour landing page for packing lists, trip planning, group coordination, and AI packing recommendations.',
        url: '/',
        breadcrumbText: 'Home',
        keywords: ['plantour', 'packing', 'travel planning', 'landing', 'packing lists', 'ai'],
        searchText: 'Plantour packing lists travel planning group coordination AI packing recommendations',
        sourceLabel: 'Page'
      },
      {
        id: 'page/contact',
        title: 'Contact',
        summary: 'Contact Plantour support for questions, bug reports, feature requests, feedback, or partnerships.',
        description: 'Contact page for Plantour support and business inquiries.',
        url: '/contact',
        breadcrumbText: 'Home / Contact',
        keywords: ['contact', 'support', 'feedback', 'bug report', 'feature request'],
        searchText: 'Contact Plantour support questions bug reports feature requests feedback partnerships',
        sourceLabel: 'Page'
      },
      {
        id: 'page/privacy',
        title: 'Privacy Policy',
        summary: 'Learn what Plantour collects, how the data is used, and how deletion requests work.',
        description: 'Plantour privacy policy covering collection, usage, payments, retention, and deletion requests.',
        url: '/privacy',
        breadcrumbText: 'Home / Privacy Policy',
        keywords: ['privacy', 'policy', 'data', 'retention', 'deletion'],
        searchText: 'Plantour privacy policy data collection usage payments retention deletion requests',
        sourceLabel: 'Page'
      },
      {
        id: 'page/terms',
        title: 'Terms of Usage',
        summary: 'Read Plantour terms covering accounts, trial access, billing, acceptable use, and limitations.',
        description: 'Plantour terms of usage for eligibility, accounts, billing, acceptable use, and limitations.',
        url: '/terms',
        breadcrumbText: 'Home / Terms of Usage',
        keywords: ['terms', 'usage', 'billing', 'trial', 'accounts'],
        searchText: 'Plantour terms of usage eligibility accounts trial access billing acceptable use limitations',
        sourceLabel: 'Page'
      },
      {
        id: 'page/public-templates',
        title: 'Plantour Packing Templates by Activity, Age & Temperature',
        summary: 'Browse public packing templates filtered by activity, age range, temperature, and category.',
        description: 'Public Plantour packing templates page with activity, age, temperature, and category filters.',
        url: '/packing-list-generator/templates',
        breadcrumbText: 'Home / Public Templates',
        keywords: ['public templates', 'packing templates', 'activity', 'age range', 'temperature'],
        searchText: 'Plantour public packing templates activity age temperature category packing list generator',
        sourceLabel: 'Public templates'
      }
    ];

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

    return [...staticDocuments, ...helpDocuments];
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