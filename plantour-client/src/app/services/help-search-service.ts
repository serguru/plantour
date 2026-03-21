import { Injectable } from '@angular/core';
import { Index } from 'flexsearch';
import { HELP_PAGES, HELP_PAGE_MAP, getHelpBreadcrumbs } from '../components/help/help-content';
import { HelpPage, HelpSearchResult } from './help-service';

const SEARCH_RESULT_LIMIT = 8;

@Injectable({ providedIn: 'root' })
export class HelpSearchService {
  private readonly index = new Index({
    tokenize: 'forward',
    resolution: 9
  });

  private readonly pageById = HELP_PAGE_MAP;
  private readonly pageSearchText = new Map<string, string>();

  constructor() {
    for (const page of HELP_PAGES.filter((candidate) => candidate.searchable)) {
      const indexText = this.buildIndexText(page);
      this.pageSearchText.set(page.id, indexText);
      this.index.add(page.id, indexText);
    }
  }

  search(query: string, highlightMatches = true): HelpSearchResult[] {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const ids = this.index.search(trimmedQuery, { limit: SEARCH_RESULT_LIMIT }) as string[];

    return ids
      .map((id) => this.pageById.get(id))
      .filter((page): page is HelpPage => !!page)
      .map((page) => this.buildSearchResult(page, trimmedQuery, highlightMatches))
      .filter((result): result is HelpSearchResult => !!result);
  }

  private buildIndexText(page: HelpPage): string {
    return [
      page.title,
      page.title,
      page.summary,
      page.description,
      page.keywords.join(' '),
      page.searchText
    ].join(' ');
  }

  private buildBreadcrumbText(page: HelpPage): string {
    return getHelpBreadcrumbs(page.id)
      .map((breadcrumb) => breadcrumb.label)
      .join(' / ');
  }

  private buildSearchResult(page: HelpPage, query: string, highlightMatches: boolean): HelpSearchResult | null {
    const breadcrumbText = this.buildBreadcrumbText(page);
    const haystack = [
      page.title,
      breadcrumbText,
      page.summary,
      page.description,
      this.pageSearchText.get(page.id) ?? ''
    ].join(' ');

    if (!this.containsLiteralMatch(haystack, query)) {
      return null;
    }

    const summarySource = this.pickSummarySource(page, query);

    return {
      page,
      breadcrumbText,
      titleHtml: this.formatText(page.title, query, highlightMatches),
      breadcrumbHtml: this.formatText(breadcrumbText, query, highlightMatches),
      summaryHtml: this.formatText(summarySource, query, highlightMatches)
    };
  }

  private pickSummarySource(page: HelpPage, query: string): string {
    const candidates = [
      page.summary,
      page.description,
      page.searchText
    ];

    const matchSource = candidates.find((candidate) => this.containsLiteralMatch(candidate, query));
    if (!matchSource) {
      return page.summary;
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
}