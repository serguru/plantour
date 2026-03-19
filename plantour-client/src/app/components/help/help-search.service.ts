import { Injectable } from '@angular/core';
import { Index } from 'flexsearch';
import { HELP_PAGES } from './help-content';
import { HelpBlock, HelpPage, HelpSearchResult } from './help.models';

@Injectable({ providedIn: 'root' })
export class HelpSearchService {
  private readonly index = new Index({
    tokenize: 'forward',
    resolution: 9
  });

  private readonly pageById = new Map<string, HelpPage>(HELP_PAGES.map((page) => [page.id, page]));

  constructor() {
    for (const page of HELP_PAGES) {
      this.index.add(page.id, this.buildIndexText(page));
    }
  }

  search(query: string): HelpSearchResult[] {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const ids = this.index.search(trimmedQuery, { limit: 8 }) as string[];

    return ids
      .map((id) => this.pageById.get(id))
      .filter((page): page is HelpPage => !!page)
      .map((page) => ({
        page,
        breadcrumbText: this.buildBreadcrumbText(page)
      }));
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
}