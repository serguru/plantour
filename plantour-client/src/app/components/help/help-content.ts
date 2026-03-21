export const HELP_HOME_PAGE_ID = 'help';

export type HelpPageKind = 'home' | 'section' | 'answer' | 'search';
export type HelpListStyle = 'ordered' | 'unordered';
export type HelpAnswerComponentKey = 'get-started-guest-access';

export interface HelpAnswerListSection {
  title?: string;
  listStyle: HelpListStyle;
  items: string[];
}

export type HelpAnswerSource =
  | {
      kind: 'list';
      sections: HelpAnswerListSection[];
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
  keywords: string[];
  answer: HelpAnswerSource;
}

interface HelpSectionSource {
  id: string;
  title: string;
  summary: string;
  questions: HelpQuestionSource[];
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

function unorderedListAnswer(items: string[]): HelpAnswerSource {
  return {
    kind: 'list',
    sections: [
      {
        listStyle: 'unordered',
        items
      }
    ]
  };
}

function flattenAnswerText(answer: HelpAnswerSource): string {
  if (answer.kind === 'component') {
    return '';
  }

  return answer.sections
    .flatMap((section) => [section.title ?? '', ...section.items])
    .filter((value) => value.length > 0)
    .join(' ');
}

function createAnswerPageId(sectionId: string, slug: string): string {
  return `${HELP_HOME_PAGE_ID}/${sectionId}/${slug}`;
}

function firstAnswerLine(answer: HelpAnswerSource): string | null {
  if (answer.kind === 'component') {
    return null;
  }

  for (const section of answer.sections) {
    const firstItem = section.items.find((item) => item.trim().length > 0);
    if (firstItem) {
      return firstItem;
    }
  }

  return null;
}

const SECTION_SOURCES: HelpSectionSource[] = [
  {
    id: 'get-started',
    title: 'Get started',
    summary: 'Help at your first steps',
    questions: [
      {
        slug: 'no-account',
        question: 'Can I try Plantour without the account creation?',
        answer: {
          kind: 'component',
          componentKey: 'get-started-guest-access'
        },
        keywords: ['temporary user', 'guest', 'demo', 'no account']
      },
      {
        slug: 'first-steps',
        question: 'What are my first steps with Plantour?',
        answer: {
          kind: 'list',
          sections: [
            {
              title: 'Temporary users follow (regular users see after) these steps:',
              listStyle: 'ordered',
              items: [
                'Click the "Trip" button with the "compass" icon on the toolbar',
                'Select the "Trips" menu item. A list of trips open.',
                'This list will contain two trips: "Weekend in Las Vegas" and "Week in Europe". Select "Weekend in Las Vegas". It should be highlighted.',
                'Click the "Trip", then select "Items". The "Trip Items" page open.',
                'This list contains pre filled for your testing items',
                'Click "Phone charger"',
                'Make sure the drop-down list with bags is visible on the right. If not, click the three-dot button in the page header and select "Show Bags." A drop-down list with bags will appear.',
                'Click the drop-down menu of bags and select "Backpack." Your "Phone Charger" is now packed into the "Backpack."',
                'Download a packing list for "Backpack". To do this click on the toolbar "Trip" button with the "compass" icon.',
                'Select the "Bags" menu item. A list of trip bags open.',
                'Click on "Backpack". It should be highlighted.',
                'Download a packing list as a PDF file. To do this click the three-dot button in the page header and select "Download packing list PDF". Confirm download.',
                'Print out the downloaded packing list and put it in the "Backpack".',
                'Use the printed packing list when traveling.'
              ]
            },
            {
              title: 'Regular users follow these steps:',
              listStyle: 'ordered',
              items: [
                'Click the "Trip" button with the "compass" icon on the toolbar',
                'Select the "Trips" menu item. A list of trips open.',
                'Create a new trip. To do this, click the "Add" button with the plus icon. The "Add Trip" form will open. Enter the trip name "Las Vegas Weekend" and the dates. Click "Submit." You will return to the trip list. Your new trip will be highlighted. If not, click it. It should be highlighted.',
                'Click the "Trip" button with the "compass" icon on the toolbar, then select "Items". The "Trip Items" page open.',
                'Create a new trip item. To do this, click the "Add" button with the plus icon. The "Add Trip Item" form will open. Enter the trip item name "Phone charger". Click "Submit." You will return to the trip items list. Make sure the "Phone charger" is in the list',
                'Now you will need a bag to pack your "Phone charger" into. To create one click the "Trip" button with the "compass" icon on the toolbar, then select "Bags".  A list of trip bags open.',
                'Click the "Add" button with the plus icon. The "Add Trip Bag" form will open. Enter the bag name "Backpack". Click "Submit." You will return to the trip bags list. Make sure the "Backpack" is in the list',
                'Move to the trip items list. To do this click the "Trip" button with the "compass" icon on the toolbar, then select "Items". The "Trip Items" page open.',
                'Click "Phone charger"',
                'Make sure the drop-down list with bags is visible on the right. If not, click the three-dot button in the page header and select "Show Bags." A drop-down list with bags will appear.',
                'Click the drop-down menu of bags and select "Backpack." Your "Phone Charger" is now packed into the "Backpack."',
                'Download a packing list for "Backpack". To do this click on the toolbar "Trip" button with the "compass" icon.',
                'Select the "Bags" menu item. A list of trip bags open.',
                'Click on "Backpack". It has to be highlighted.',
                'Download a packing list as a PDF file. To do this click the three-dot button in the page header and select "Download packing list PDF". Confirm download.',
                'Print out the downloaded packing list and put it in the "Backpack".',
                'Use the printed packing list when traveling.'
              ]
            }
          ]
        },
        keywords: ['prefilled data', 'demo data', 'sample data', 'test data', 'first steps', 'packing list']
      },
      {
        slug: 'switch-account',
        question: 'How can I switch my account from temporary to regular?',
        answer: unorderedListAnswer([
          'If you wish to keep your test data naviagate to your profile and enter your real email',
          'If you wish to start a new regular free account from scratch sign out from your temporary account, go to sign in and enter your real email or sign in with Google or Facebook',
          'If you wish to start with a paid plan go to your profile and click the "Change plan" button'
        ]),
        keywords: ['first step', 'demo', 'start', 'workflow']
      }
    ]
  },
  {
    id: 'why-plantour',
    title: 'Why Plantour',
    summary: 'The values ​​the customer receives from Plantur',
    questions: [
      {
        slug: 'need-to-use',
        question: 'Why do I need to use Plantour',
        answer: unorderedListAnswer([
          'Centralizing trip information',
          'Preventing forgotten items',
          'Save time by reusing item templates',
          'AI trip items recommendations',
          'Group coordination',
          'Tracking items by bag',
          'Shared responsibility for items and todos',
          'Trip related email notifications',
          'Trip comments',
          'Lower travel stress'
        ]),
        keywords: ['trip', 'items', 'AI', 'comment', 'shared', 'group']
      },
      {
        slug: 'entities',
        question: 'What are the main entities that Plniur operates with?',
        answer: unorderedListAnswer([
          'Trip is a journey or excursion to a specific destination. Can be created by the Admin. Cannot be created by the Participant',
          "Traveler is a person invited by the Admin. The person has to be a Traveler to have access to the Admin's trips",
          'Bag is a container, used for holding or carrying items',
          'Item is any specific piece of gear, clothing, or personal essential packed to meet a particular need or handle a specific situation during your travels',
          'Todo is a task or action that needs to be completed',
          "Shared item is an item intended for shared use by trip participants. It may be included in the shared item list and assigned to a participant for preparation and travel.",
          'Shared todo',
          'Admin',
          'Participant',
          'Packing list',
          'Trip report',
          'Dictionary',
          'Dashboard',
          'Account',
          'Plan'
        ]),
        keywords: ['prefilled data', 'demo data', 'sample data', 'test data', 'first steps', 'packing list']
      },
      {
        slug: 'workflow',
        question: "What are Plantour's core workflows?",
        answer: unorderedListAnswer([
          'Create a trip -> Add friends -> Send them invitations by email',
          'Search item templates -> Add items and bags to a trip -> Pack items -> Print packing lists',
          'Ask AI for item recommendations -> Include selected items into a trip',
          'Create a list of shared items and todos -> Assign them to trip participants -> Monitor packing of items and completion of todos',
          'Send a trip comment -> Get answers from the trip participants'
        ]),
        keywords: ['workflow', 'assignment', 'shared item', 'shared todo']
      }
    ]
  },
  {
    id: 'instructions',
    title: 'How do I ...',
    summary: 'Step-by-step instructions on how to use Plantur features',
    questions: [
      {
        slug: 'dictionary-entities',
        question: '... add, update or delete dictionary entities',
        answer: unorderedListAnswer([
          'Dictionary entities are travelers, items, todos and bags which are not associated with a trip. They cab be accessed by the menu items ubnder the toolbar button Dictionary with the "copy" icon.',
          'Any dictionary entity can be added, updated or deleted without afffecting any trip data',
          'Dictionary items can be added from the templates and AI recommendations',
          'To add an entity go to the entities list, click Add plus button, fill a form and click Submit',
          'To update an entity go to the entities list, select the entity, click Update pencil button, fill a form and click Submit',
          'To delete and entity select it in the list, click Delete button trash can and confirm deletion'
        ]),
        keywords: ['trip', 'items', 'AI', 'comment', 'shared', 'group']
      },
      {
        slug: 'entities',
        question: 'What are the main entities that Plniur operates with?',
        answer: unorderedListAnswer([
          'Trip',
          'Traveler',
          'Bag',
          'Item',
          'Todo',
          'Shared item',
          'Shared todo',
          'Admin',
          'Participant',
          'Packing list',
          'Trip report'
        ]),
        keywords: ['prefilled data', 'demo data', 'sample data', 'test data', 'first steps', 'packing list']
      },
      {
        slug: 'workflow',
        question: "What are Plantour's core workflows?",
        answer: unorderedListAnswer([
          'Create a trip -> Add friends -> Send them invitations by email',
          'Search item templates -> Add items and bags to a trip -> Pack items -> Print packing lists',
          'Ask AI for item recommendations -> Include selected items into a trip',
          'Create a list of shared items and todos -> Assign them to trip participants -> Monitor packing of items and completion of todos',
          'Send a trip comment -> Get answers from the trip participants'
        ]),
        keywords: ['workflow', 'assignment', 'shared item', 'shared todo']
      }
    ]
  }
];

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

      return {
        pageId,
        sectionPageId: HELP_HOME_PAGE_ID,
        sectionId: section.id,
        slug: question.slug,
        question: question.question,
        path: [section.id, question.slug],
        summary,
        description,
        keywords: [...SHARED_KEYWORDS, section.id, ...question.keywords],
        answer: question.answer,
        searchText: [question.question, summary, description, ...question.keywords, answerText].join(' ')
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
  searchText: 'Plantour help questions answers sections'
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

export const HELP_PAGES: HelpPage[] = [
  HELP_HOME_PAGE,
  ...HELP_ANSWER_PAGES
];

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