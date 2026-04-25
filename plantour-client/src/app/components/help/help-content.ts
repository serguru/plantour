import { GENERATED_QUESTION_SOURCE_ENTRIES, GENERATED_SECTION_MANIFEST_ENTRIES } from './generated-help-sources';
import sectionFolderOrder from './sections/sections-order.json';
export const HELP_HOME_PAGE_ID = 'help';

export type HelpPageKind = 'home' | 'section' | 'answer' | 'search';
export type HelpListTag = 'ul' | 'ol';
export type HelpAnswerComponentKey = 'get-started-guest-access' | 'workflows-plan-offers';

export interface HelpYoutubeLink {
  url: string;
  caption: string;
  description?: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  linkClass?: string;
  showIcon?: boolean;
}

export interface HelpAnswerListSection {
  title?: string;
  beforeHtml?: string;
  listTag?: HelpListTag;
  items?: string[];
  afterHtml?: string;
  youtubeLink?: HelpYoutubeLink;
}

export interface HelpAnswerParagraphSection {
  title?: string;
  beforeHtml?: string;
  paragraphs?: string[];
  afterHtml?: string;
  youtubeLink?: HelpYoutubeLink;
}

export type HelpAnswerSource =
  | {
      kind: 'list';
      sections: HelpAnswerListSection[];
    }
  | {
      kind: 'paragraph';
      sections: HelpAnswerParagraphSection[];
    }
  | {
      kind: 'component';
      componentKey: HelpAnswerComponentKey;
    };

export interface HelpQuestionDefinition {
  pageId: string;
  sectionPageId: string;
  sectionId: string;
  slug: string;
  question: string;
  path: string[];
  summary: string;
  description: string;
  keywords: string[];
  answer: HelpAnswerSource;
  searchText: string;
}

export interface HelpSectionDefinition {
  id: string;
  pageId: string;
  title: string;
  summary: string;
  description: string;
  keywords: string[];
  questions: HelpQuestionDefinition[];
}

export interface HelpPage {
  id: string;
  kind: HelpPageKind;
  path: string[];
  title: string;
  summary: string;
  description: string;
  keywords: string[];
  parentId?: string;
  sectionId?: string;
  questionSlug?: string;
  searchable: boolean;
  allowIndexing: boolean;
  includeInSitemap: boolean;
  searchText: string;
}

export interface HelpBreadcrumb {
  label: string;
  url: string;
  pageId: string;
}

interface HelpQuestionSource {
  slug: string;
  question: string;
  answer: HelpAnswerSource;
}

interface HelpSectionSource {
  id: string;
  title: string;
  summary: string;
  questions: HelpQuestionSource[];
}

interface HelpSectionManifest {
  id: string;
  title: string;
  summary: string;
  questions: string[];
}

const SHARED_KEYWORDS = [
  'plantour',
  'help',
  'faq',
  'packing',
  'trip',
  'trips',
  'items',
  'bags',
  'templates',
  'sharing',
  'ai',
  'travelers',
  'todos'
];

const HELP_KEYWORD_STOP_WORDS = new Set([
  'a',
  'about',
  'all',
  'am',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'can',
  'do',
  'for',
  'from',
  'get',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'my',
  'need',
  'of',
  'on',
  'or',
  'our',
  'so',
  'start',
  'that',
  'the',
  'their',
  'them',
  'there',
  'these',
  'this',
  'to',
  'use',
  'using',
  'what',
  'when',
  'why',
  'with',
  'your'
]);

const HELP_KEYWORD_KEEP_SHORT = new Set(['ai', 'qa']);
const HELP_GENERATED_KEYWORD_LIMIT = 12;

export function stripHelpHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<li>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function getHelpAnswerPlainText(answer: HelpAnswerSource): string {
  if (answer.kind === 'component') {
    return '';
  }

  if (answer.kind === 'list') {
    return answer.sections
      .flatMap((section) => {
        const parts: string[] = [section.title ?? '', section.beforeHtml ?? '', ...(section.items ?? []), section.afterHtml ?? ''];
        if (section.youtubeLink) {
          parts.push(section.youtubeLink.caption, section.youtubeLink.description ?? '');
        }
        return parts;
      })
      .map((value) => stripHelpHtml(value))
      .filter((value) => value.length > 0)
      .join(' ');
  }

  return answer.sections
    .flatMap((section) => {
      const parts: string[] = [section.title ?? '', section.beforeHtml ?? '', ...(section.paragraphs ?? []), section.afterHtml ?? ''];
      if (section.youtubeLink) {
        parts.push(section.youtubeLink.caption, section.youtubeLink.description ?? '');
      }
      return parts;
    })
    .map((value) => stripHelpHtml(value))
    .filter((value) => value.length > 0)
    .join(' ');
}

function flattenAnswerText(answer: HelpAnswerSource): string {
  return getHelpAnswerPlainText(answer);
}

function normalizeKeywordSource(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isKeywordToken(value: string): boolean {
  if (!value) {
    return false;
  }

  if (HELP_KEYWORD_KEEP_SHORT.has(value)) {
    return true;
  }

  return value.length >= 3 && !HELP_KEYWORD_STOP_WORDS.has(value);
}

function collectKeywordScores(parts: string[]): Map<string, number> {
  const scores = new Map<string, number>();

  for (const part of parts) {
    const tokens = normalizeKeywordSource(part)
      .split(' ')
      .filter((token) => isKeywordToken(token));

    for (const token of tokens) {
      scores.set(token, (scores.get(token) ?? 0) + 1);
    }

    for (let index = 0; index < tokens.length - 1; index += 1) {
      const phrase = `${tokens[index]} ${tokens[index + 1]}`;
      scores.set(phrase, (scores.get(phrase) ?? 0) + 2);
    }
  }

  return scores;
}

function generateQuestionKeywords(sectionId: string, question: string, summary: string, answerText: string): string[] {
  const scores = collectKeywordScores([sectionId, question, summary, answerText]);

  return Array.from(scores.entries())
    .filter(([keyword]) => !SHARED_KEYWORDS.includes(keyword) && keyword !== sectionId)
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0]);
    })
    .slice(0, HELP_GENERATED_KEYWORD_LIMIT)
    .map(([keyword]) => keyword);
}

function createAnswerPageId(sectionId: string, slug: string): string {
  return `${HELP_HOME_PAGE_ID}/${sectionId}/${slug}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asHelpQuestionSource(modulePath: string, value: unknown): HelpQuestionSource {
  if (
    isRecord(value) &&
    typeof value['slug'] === 'string' &&
    typeof value['question'] === 'string' &&
    'answer' in value
  ) {
    return value as unknown as HelpQuestionSource;
  }

  throw new Error(`Invalid help question source at ${modulePath}`);
}

function asHelpSectionManifest(modulePath: string, value: unknown): HelpSectionManifest {
  if (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['title'] === 'string' &&
    typeof value['summary'] === 'string' &&
    Array.isArray(value['questions'])
  ) {
    return value as unknown as HelpSectionManifest;
  }

  throw new Error(`Invalid help section manifest at ${modulePath}`);
}

function formatHelpPath(path: string[]): string {
  return path.length === 0 ? '/help' : `/help/${path.join('/')}`;
}

function firstAnswerLine(answer: HelpAnswerSource): string | null {
  if (answer.kind === 'component') {
    return null;
  }

  if (answer.kind === 'list') {
    for (const section of answer.sections) {
      const firstItem = [section.beforeHtml ?? '', ...(section.items ?? []), section.afterHtml ?? '']
        .map((item) => stripHelpHtml(item))
        .find((item) => item.length > 0);

      if (firstItem) {
        return firstItem;
      }
    }

    return null;
  }

  for (const section of answer.sections) {
    const firstItem = [section.beforeHtml ?? '', ...(section.paragraphs ?? []), section.afterHtml ?? '']
      .map((item) => stripHelpHtml(item))
      .find((item) => item.length > 0);

    if (firstItem) {
      return firstItem;
    }
  }

  return null;
}

const QUESTION_SOURCE_BY_FILE = new Map<string, HelpQuestionSource>(
  GENERATED_QUESTION_SOURCE_ENTRIES.map(([fileName, value]) => [fileName, asHelpQuestionSource(fileName, value)])
);

const SECTION_MANIFEST_BY_FOLDER = new Map<string, HelpSectionManifest>(
  GENERATED_SECTION_MANIFEST_ENTRIES.map(([folderName, value]) => [folderName, asHelpSectionManifest(`${folderName}/section.json`, value)])
);

function getQuestionSource(folderName: string, fileName: string): HelpQuestionSource {
  const source = QUESTION_SOURCE_BY_FILE.get(`${folderName}/${fileName}`);
  if (!source) {
    throw new Error(`Missing help question source for ${folderName}/${fileName}`);
  }

  return source;
}

function getSectionManifest(folderName: string): HelpSectionManifest {
  const manifest = SECTION_MANIFEST_BY_FOLDER.get(folderName);
  if (!manifest) {
    throw new Error(`Missing help section manifest for ${folderName}`);
  }

  return manifest;
}

const SECTION_SOURCES: HelpSectionSource[] = (sectionFolderOrder as string[]).map((folderName) => {
  const manifest = getSectionManifest(folderName);

  return {
    id: manifest.id,
    title: manifest.title,
    summary: manifest.summary,
    questions: manifest.questions.map((fileName) => getQuestionSource(folderName, fileName))
  };
});

export const HELP_SECTIONS: HelpSectionDefinition[] = SECTION_SOURCES.map((section) => {
  return {
    id: section.id,
    pageId: HELP_HOME_PAGE_ID,
    title: section.title,
    summary: section.summary,
    description: section.summary,
    keywords: [...SHARED_KEYWORDS, section.id, section.title.toLowerCase()],
    questions: section.questions.map((question) => {
      const pageId = createAnswerPageId(section.id, question.slug);
      const answerText = flattenAnswerText(question.answer);
      const summary = firstAnswerLine(question.answer) ?? question.question;
      const description = answerText || `${question.question} ${section.summary}`;
      const generatedKeywords = generateQuestionKeywords(section.id, question.question, summary, answerText);

      return {
        pageId,
        sectionPageId: HELP_HOME_PAGE_ID,
        sectionId: section.id,
        slug: question.slug,
        question: question.question,
        path: [section.id, question.slug],
        summary,
        description,
        keywords: [...SHARED_KEYWORDS, section.id, section.title.toLocaleLowerCase(), ...generatedKeywords],
        answer: question.answer,
        searchText: [section.title, section.summary, question.question, summary, description, answerText].join(' ')
      };
    })
  };
});

const HELP_HOME_PAGE: HelpPage = {
  id: HELP_HOME_PAGE_ID,
  kind: 'home',
  path: [],
  title: 'Plantour Help',
  summary: 'Browse Plantour help questions and open dedicated answer pages.',
  description: 'Plantour help center with grouped questions on the main page and dedicated answer pages.',
  keywords: [...SHARED_KEYWORDS, 'questions', 'answers'],
  searchable: true,
  allowIndexing: true,
  includeInSitemap: true,
  searchText: ['Plantour help questions answers sections', ...HELP_SECTIONS.map((section) => `${section.title} ${section.summary}`)].join(' ')
};

const HELP_ANSWER_PAGES: HelpPage[] = HELP_SECTIONS.flatMap((section) =>
  section.questions.map((question) => ({
    id: question.pageId,
    kind: 'answer',
    path: question.path,
    title: question.question,
    summary: question.summary,
    description: question.description,
    keywords: question.keywords,
    parentId: HELP_HOME_PAGE_ID,
    sectionId: section.id,
    questionSlug: question.slug,
    searchable: true,
    allowIndexing: true,
    includeInSitemap: true,
    searchText: question.searchText
  }))
);

export function validateHelpPages(pages: readonly HelpPage[]): void {
  const pageIdsByPath = new Map<string, string>();
  const pathByPageId = new Map<string, string>();

  for (const page of pages) {
    const helpPath = formatHelpPath(page.path);
    const existingPageId = pageIdsByPath.get(helpPath);
    if (existingPageId) {
      throw new Error(`Duplicate help URL path "${helpPath}" for page ids "${existingPageId}" and "${page.id}"`);
    }

    const existingPath = pathByPageId.get(page.id);
    if (existingPath) {
      throw new Error(`Duplicate help page id "${page.id}" for paths "${existingPath}" and "${helpPath}"`);
    }

    pageIdsByPath.set(helpPath, page.id);
    pathByPageId.set(page.id, helpPath);
  }
}

export const HELP_PAGES: HelpPage[] = [
  HELP_HOME_PAGE,
  ...HELP_ANSWER_PAGES
];

validateHelpPages(HELP_PAGES);

export const HELP_PAGE_MAP = new Map<string, HelpPage>(HELP_PAGES.map((page) => [page.id, page]));
export const HELP_SITEMAP_PAGES = HELP_PAGES.filter((page) => page.includeInSitemap && page.allowIndexing);

export function getHelpSection(sectionId: string | null | undefined): HelpSectionDefinition | null {
  if (!sectionId) {
    return null;
  }

  return HELP_SECTIONS.find((section) => section.id === sectionId) ?? null;
}

export function getHelpQuestion(sectionId: string | null | undefined, questionSlug: string | null | undefined): HelpQuestionDefinition | null {
  const section = getHelpSection(sectionId);
  if (!section || !questionSlug) {
    return null;
  }

  return section.questions.find((question) => question.slug === questionSlug) ?? null;
}

export function getHelpQuestionByPageId(pageId: string | null | undefined): HelpQuestionDefinition | null {
  if (!pageId) {
    return null;
  }

  for (const section of HELP_SECTIONS) {
    const question = section.questions.find((candidate) => candidate.pageId === pageId);
    if (question) {
      return question;
    }
  }

  return null;
}

export function getHelpPageUrl(pageOrId: HelpPage | string | null | undefined): string {
  if (!pageOrId) {
    return '/help';
  }

  const page = typeof pageOrId === 'string' ? HELP_PAGE_MAP.get(pageOrId) : pageOrId;
  if (!page) {
    return '/help';
  }

  return page.path.length === 0 ? '/help' : `/help/${page.path.join('/')}`;
}

export function findHelpPageByPath(path: string[]): HelpPage | null {
  const normalizedPath = path.filter((segment) => segment.length > 0);
  return HELP_PAGES.find((page) => page.path.length === normalizedPath.length && page.path.every((segment, index) => segment === normalizedPath[index])) ?? null;
}

export function getHelpBreadcrumbs(pageId: string): HelpBreadcrumb[] {
  const breadcrumbs: HelpBreadcrumb[] = [];
  let current = HELP_PAGE_MAP.get(pageId);

  while (current) {
    breadcrumbs.unshift({
      label: current.title,
      url: getHelpPageUrl(current),
      pageId: current.id
    });

    current = current.parentId ? HELP_PAGE_MAP.get(current.parentId) : undefined;
  }

  return breadcrumbs;
}