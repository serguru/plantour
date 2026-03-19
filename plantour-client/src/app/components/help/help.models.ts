export interface HelpLink {
  pageId: string;
  label?: string;
  description?: string;
}

export interface HelpStep {
  title: string;
  body: string;
}

export interface HelpCard {
  title: string;
  body: string;
  link?: HelpLink;
}

export interface HelpListItem {
  text: string;
  pageId?: string;
}

export type HelpBlock =
  | {
      kind: 'paragraphs';
      id: string;
      title?: string;
      paragraphs: string[];
    }
  | {
      kind: 'steps';
      id: string;
      title: string;
      intro?: string;
      steps: HelpStep[];
    }
  | {
      kind: 'cards';
      id: string;
      title: string;
      intro?: string;
      cards: HelpCard[];
    }
  | {
      kind: 'list';
      id: string;
      title: string;
      intro?: string;
      items: HelpListItem[];
    }
  | {
      kind: 'callout';
      id: string;
      tone: 'info' | 'tip';
      title: string;
      body: string;
    };

export interface HelpPage {
  id: string;
  path: string[];
  title: string;
  summary: string;
  description: string;
  parentId?: string;
  keywords: string[];
  relatedPageIds?: string[];
  blocks: HelpBlock[];
}

export interface HelpBreadcrumb {
  label: string;
  url: string;
  pageId: string;
}

export interface HelpSearchResult {
  page: HelpPage;
  breadcrumbText: string;
  titleHtml: string;
  breadcrumbHtml: string;
  summaryHtml: string;
}