import { HelpPage } from './help.models';

export const HELP_HOME_PAGE_ID = 'help-home';
export const HELP_FUTURE_PAGES_PAGE_ID = 'pages';

export interface HelpFaqQuestion {
  pageId: string;
  question: string;
  path: string[];
  answer: string[];
  keywords: string[];
}

export interface HelpFaqSection {
  id: string;
  title: string;
  summary: string;
  questions: HelpFaqQuestion[];
}

interface HelpFaqQuestionSource {
  slug: string;
  question: string;
  answer: string[];
  keywords: string[];
}

interface HelpFaqSectionSource {
  id: string;
  title: string;
  summary: string;
  questions: HelpFaqQuestionSource[];
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

const FAQ_SECTION_SOURCES: HelpFaqSectionSource[] = [
  {
    id: 'get-started',
    title: 'Get started',
    summary: 'Help at your first steps',
    questions: [
      {
        slug: 'no-account',
        question: 'Can I try Plantour without the account creation?',
        answer: [
        ],
        keywords: ['temporary user', 'guest', 'demo', 'no account']
      },
      {
        slug: 'first-steps',
        question: 'What are my first steps with Plantour?',
        answer: [
        ],
        keywords: ['prefilled data', 'demo data', 'sample data', 'test data', 'first steps', 'packing list']
      },
      {
        slug: 'switch-account',
        question: 'How can I switch my account from temporary to regular?',
        answer: [
          'If you wish to keep your test data naviagate to your profile and enter your real email',
          'If you wish to start a new regular free account from scratch sign out from your temporary account and then go to sign in',
          'If you wish to start with a paid plan sign out from your temporary account, click the toolbar "Dashboard" button and then select a paid plan'
        ],
        keywords: ['first step', 'demo', 'start', 'workflow']
      }
    ]
  }, {
    id: 'why-plantour',
    title: 'Why Plantour',
    summary: 'The values ​​the customer receives from Plantur',
    questions: [
      {
        slug: 'need-to-use',
        question: 'Why do I need to use Plantour',
        answer: [
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
        ],
        keywords: ['trip', 'items', 'AI', 'comment', 'shared', 'group']
      },
      {
        slug: 'entities',
        question: 'What are the main entities that Plniur operates with?',
        answer: [
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
          'Trip report',
          'Dictionary',
          'Dashboard',
          'Account',
          'Plan'
        ],
        keywords: ['prefilled data', 'demo data', 'sample data', 'test data', 'first steps', 'packing list']
      },
      {
        slug: 'workflow',
        question: "What are Plantour's core workflows?",
        answer: [
          'Create a trip -> Add friends -> Send them invitations by email',
          'Search item templates -> Add items and bags to a trip -> Pack items -> Print packing lists',
          'Ask AI for item recommendations -> Include selected items into a trip',
          'Create a list of shared items and todos -> Assign them to trip participants -> Monitor packing of items and completion of todos',
          'Send a trip comment -> Get answers from the trip participants',

        ],
        keywords: ['workflow', 'assignment', 'shared item', 'shared todo']
      }
    ]
  }, {
    id: 'instructions',
    title: 'How do I ...',
    summary: 'Step-by-step instructions on how to use Plantur features',
    questions: [
      {
        slug: 'dictionary-entities',
        question: '... add, update or delete dictionary entities',
        answer: [
          'Dictionary entities are travelers, items, todos and bags which are not associated with a trip. They cab be accessed by the menu items ubnder the toolbar button Dictionary with the "copy" icon.',
          'Any dictionary entity can be added, updated or deleted without afffecting any trip data',
          'Dictionary items can be added from the templates and AI recommendations',
          'To add an entity go to the entities list, click Add plus button, fill a form and click Submit',
          'To update an entity go to the entities list, select the entity, click Update pencil button, fill a form and click Submit',
          'To delete and entity select it in the list, click Delete button trash can and confirm deletion'
        ],
        keywords: ['trip', 'items', 'AI', 'comment', 'shared', 'group']
      },
      {
        slug: 'entities',
        question: 'What are the main entities that Plniur operates with?',
        answer: [
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
        ],
        keywords: ['prefilled data', 'demo data', 'sample data', 'test data', 'first steps', 'packing list']
      },
      {
        slug: 'workflow',
        question: "What are Plantour's core workflows?",
        answer: [
          'Create a trip -> Add friends -> Send them invitations by email',
          'Search item templates -> Add items and bags to a trip -> Pack items -> Print packing lists',
          'Ask AI for item recommendations -> Include selected items into a trip',
          'Create a list of shared items and todos -> Assign them to trip participants -> Monitor packing of items and completion of todos',
          'Send a trip comment -> Get answers from the trip participants',

        ],
        keywords: ['workflow', 'assignment', 'shared item', 'shared todo']
      }
    ]
  }


];

export const HELP_FAQ_SECTIONS: HelpFaqSection[] = FAQ_SECTION_SOURCES.map((section) => ({
  id: section.id,
  title: section.title,
  summary: section.summary,
  questions: section.questions.map((question) => ({
    pageId: `${HELP_FUTURE_PAGES_PAGE_ID}/${section.id}/${question.slug}`,
    question: question.question,
    path: [section.id, question.slug],
    answer: question.answer,
    keywords: question.keywords
  }))
}));

const faqAnswerPages: HelpPage[] = HELP_FAQ_SECTIONS.flatMap((section) =>
  section.questions.map((question) => ({
    id: question.pageId,
    path: question.path,
    title: question.question,
    summary: question.answer[0],
    description: question.answer.join(' '),
    parentId: HELP_FUTURE_PAGES_PAGE_ID,
    keywords: [...SHARED_KEYWORDS, section.title.toLowerCase(), ...question.keywords],
    relatedPageIds: [HELP_FUTURE_PAGES_PAGE_ID],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'answer',
        paragraphs: question.answer
      }
    ]
  }))
);

export const HELP_PAGES: HelpPage[] = [
  {
    id: HELP_HOME_PAGE_ID,
    path: ['home'],
    title: 'Plantour Help',
    summary: 'Browse short FAQ answers about getting started, Plantour features, and shared packing workflows.',
    description: 'Plantour FAQ with short answers and separate answer pages for each question.',
    keywords: SHARED_KEYWORDS,
    relatedPageIds: [HELP_FUTURE_PAGES_PAGE_ID],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'home-intro',
        paragraphs: [
          'Use the sections below to open a short answer page.',
          'Each question has its own URL and works with server-side rendering.'
        ]
      }
    ]
  },
  {
    id: HELP_FUTURE_PAGES_PAGE_ID,
    path: [],
    title: 'Plantour FAQ',
    summary: 'Open a section, choose a question, and read the answer on its own page.',
    description: 'Plantour FAQ page with expandable sections and separate answer pages.',
    parentId: HELP_HOME_PAGE_ID,
    keywords: [...SHARED_KEYWORDS, 'questions', 'answers', 'faq'],
    relatedPageIds: [HELP_HOME_PAGE_ID],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'faq-intro',
        paragraphs: []
      }
    ]
  },
  ...faqAnswerPages
];