import { Injectable } from '@angular/core';
import { Index } from 'flexsearch';
import { HELP_PAGES } from './help-content';
import { HelpBlock, HelpPage, HelpSearchResult } from './help.models';

const SEARCH_RESULT_LIMIT = 8;

@Injectable({ providedIn: 'root' })
export class HelpSearchService {
  private readonly index = new Index({
    tokenize: 'forward',
    resolution: 9
  });

  private readonly pageById = new Map<string, HelpPage>(HELP_PAGES.map((page) => [page.id, page]));
  private readonly pageSearchText = new Map<string, string>();

  constructor() {
    for (const page of HELP_PAGES) {
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
    const blockText = page.blocks.map((block) => this.stringifyBlock(block)).join(' ');
    return [
      page.title,
      page.title,
      page.summary,
      page.description,
      page.keywords.join(' '),
      blockText
    ].join(' ');
  }

  private stringifyBlock(block: HelpBlock): string {
    if (block.kind === 'paragraphs') {
      return [block.title ?? '', ...block.paragraphs].join(' ');
    }

    if (block.kind === 'steps') {
      return [block.title, block.intro ?? '', ...block.steps.flatMap((step) => [step.title, step.body])].join(' ');
    }

    if (block.kind === 'cards') {
      return [block.title, block.intro ?? '', ...block.cards.flatMap((card) => [card.title, card.body])].join(' ');
    }

    if (block.kind === 'list') {
      return [block.title, block.intro ?? '', ...block.items.map((item) => item.text)].join(' ');
    }

    return [block.title, block.body].join(' ');
  }

  private buildBreadcrumbText(page: HelpPage): string {
    const labels: string[] = [];
    let current: HelpPage | undefined = page;

    while (current) {
      labels.unshift(current.title);
      current = current.parentId ? this.pageById.get(current.parentId) : undefined;
    }

    return labels.join(' / ');
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
      ...page.blocks.map((block) => this.stringifyBlock(block))
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