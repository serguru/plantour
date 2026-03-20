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
    summary: 'Short answers for your first minutes in Plantour.',
    questions: [
      {
        slug: 'can-i-get-started-without-account-creation',
        question: 'Can I get started without the account creation?',
        answer: [
          'Yes. Use the Start temporary account button.',
          'It creates a temporary user and opens Plantour with demo data.',
          'You can explore the flow before making a regular account.'
        ],
        keywords: ['temporary user', 'guest', 'demo', 'no account']
      },
      {
        slug: 'will-plantour-provide-prefilled-test-data',
        question: 'What are my first steps with Plantour?',
        answer: [
          'Temporary users start with some prefilled demo data, and you can also create trips, bags, and items yourself.',
          'Open Trips, choose a trip, open Items, create or open an item, then open Bags and create or open a bag.',
          'Pack the item into the bag, download a packing list, print it, put it into the bag, and use it during the trip.'
        ],
        keywords: ['prefilled data', 'demo data', 'sample data', 'test data', 'first steps', 'packing list']
      },
      {
        slug: 'where-should-i-start-in-the-demo',
        question: 'Where should I start in the demo?',
        answer: [
          'Start with one trip and one simple action.',
          'Open a trip, review the travelers and items, then add or pack one thing.',
          'That is the fastest way to understand the workflow.'
        ],
        keywords: ['first step', 'demo', 'start', 'workflow']
      },
      {
        slug: 'do-i-need-to-install-anything',
        question: 'Do I need to install anything?',
        answer: [
          'No. Plantour runs in the browser.',
          'Open the app and start using the available pages.',
          'A normal account is only needed when you want to keep your own data.'
        ],
        keywords: ['install', 'browser', 'account', 'setup']
      }
    ]
  },
  {
    id: 'plantour-features',
    title: 'Plantour features',
    summary: 'What Plantour can do and which flows it supports.',
    questions: [
      {
        slug: 'how-can-plantour-help-me',
        question: 'How can Plantour help me?',
        answer: [
          'Plantour helps you plan trips and organize packing work.',
          'You can manage travelers, items, bags, todos, templates, and shared work in one place.',
          'The goal is fewer forgotten things and less travel chaos.'
        ],
        keywords: ['features', 'benefits', 'planning', 'packing']
      },
      {
        slug: 'does-plantour-allow-me-to-create-trips',
        question: 'Does Plantour allow me to create trips?',
        answer: [
          'Yes. Trips are one of the main Plantour features.',
          'A trip can contain participants, items, todos, bags, comments, and shared tasks.',
          'That keeps all trip planning in one structure.'
        ],
        keywords: ['create trip', 'trip planning', 'trip']
      },
      {
        slug: 'does-plantour-support-traveler-groups',
        question: 'Does Plantour support traveler groups?',
        answer: [
          'Plantour supports multiple travelers inside one trip.',
          'You can organize who joins the trip and who is responsible for specific work.',
          'That is useful for family, friends, and shared travel planning.'
        ],
        keywords: ['traveler groups', 'travelers', 'participants', 'family']
      },
      {
        slug: 'can-plantour-suggest-what-to-pack',
        question: 'Can Plantour suggest what to pack?',
        answer: [
          'Yes. Plantour supports AI-based help and reusable templates.',
          'You can start from known packing ideas instead of building every list from zero.',
          'That speeds up planning and reduces missed items.'
        ],
        keywords: ['ai', 'suggestions', 'templates', 'packing ideas']
      }
    ]
  },
  {
    id: 'packing-and-sharing',
    title: 'Packing and sharing',
    summary: 'How Plantour supports bags, assignments, and teamwork.',
    questions: [
      {
        slug: 'can-i-pack-items-into-bags',
        question: 'Can I pack items into bags?',
        answer: [
          'Yes. Plantour supports bags and packed items.',
          'You can see what is still unpacked and what is already placed into a bag.',
          'That gives you a clearer packing result before departure.'
        ],
        keywords: ['bags', 'packing', 'packed items']
      },
      {
        slug: 'can-i-share-packing-work-with-other-people',
        question: 'Can I share packing work with other people?',
        answer: [
          'Yes. Plantour supports shared items and shared todos.',
          'That helps split work across trip participants instead of keeping everything on one person.',
          'Everyone can see the latest plan in the same trip.'
        ],
        keywords: ['share', 'shared items', 'shared todos', 'participants']
      },
      {
        slug: 'can-i-track-what-is-still-missing',
        question: 'Can I track what is still missing?',
        answer: [
          'Yes. Plantour helps you compare planned items with packed items and open tasks.',
          'You can review the current state before the trip starts.',
          'That makes last-minute checks easier.'
        ],
        keywords: ['missing items', 'tracking', 'status', 'checklist']
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