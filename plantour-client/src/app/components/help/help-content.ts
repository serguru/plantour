import { HelpPage } from './help.models';

export const HELP_HOME_PAGE_ID = 'help-home';

export const HELP_PAGES: HelpPage[] = [
  {
    id: HELP_HOME_PAGE_ID,
    path: [],
    title: 'Plantour Help',
    summary: 'Find clear, step-by-step help for planning trips, packing, sharing work, and getting started with Plantour.',
    description: 'Plantour Help offers step-by-step guidance for new users. Start with welcome, learn how Plantour works, and use search to find the right topic quickly.',
    keywords: ['help', 'plantour help', 'start', 'getting started', 'guide', 'support'],
    relatedPageIds: ['welcome-to-plantour'],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'home-intro',
        paragraphs: [
          'This Help area is built to be simple to follow. Each page answers one small question, so you do not need to read a long manual to get moving.',
          'Use the search box to find a topic, or begin with Welcome to Plantour if this is your first time here.'
        ]
      },
      {
        kind: 'cards',
        id: 'home-start-here',
        title: 'Start here',
        intro: 'These are the first help pages available in the new system.',
        cards: [
          {
            title: 'Welcome to Plantour',
            body: 'Understand what Plantour does, who it is for, and the easiest way to begin.',
            link: { pageId: 'welcome-to-plantour' }
          }
        ]
      },
      {
        kind: 'callout',
        id: 'home-note',
        tone: 'info',
        title: 'More help pages are being added',
        body: 'The new Help system is being rebuilt from the ground up. The shared layout, search, breadcrumbs, and page structure are ready, and new topics can now be added into the same system.'
      }
    ]
  },
  {
    id: 'welcome-to-plantour',
    path: ['welcome-to-plantour'],
    title: 'Welcome to Plantour',
    summary: 'Plantour helps you plan what to take on a trip, keep people organized, share responsibilities, and see what is still left to do.',
    description: 'Learn what Plantour is, who it is for, and the easiest first steps. This welcome page explains Plantour in simple language for new users.',
    parentId: HELP_HOME_PAGE_ID,
    keywords: [
      'welcome',
      'what is plantour',
      'getting started',
      'packing list',
      'trip planning',
      'travel checklist',
      'group packing',
      'shared items',
      'guest access'
    ],
    relatedPageIds: [HELP_HOME_PAGE_ID],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'welcome-intro',
        paragraphs: [
          'Plantour is a trip planning helper. It gives you one place to keep your trip lists, your things to pack, your bags, your people, and the small jobs that still need to be done.',
          'Instead of trying to remember everything in your head, you can build clear lists, share work with other people, and see what is ready and what still needs attention.',
          'You do not need special experience to use Plantour. The idea is simple: choose a trip, add what matters, and let the app help you stay organized.'
        ]
      },
      {
        kind: 'cards',
        id: 'welcome-what-plantour-helps-with',
        title: 'What Plantour helps with',
        intro: 'Plantour is designed to make common trip problems easier to handle.',
        cards: [
          {
            title: 'Remember what to take',
            body: 'Keep your own item lists, build trip item lists, reuse templates, and get suggestions when you are not sure what to pack.'
          },
          {
            title: 'Keep people coordinated',
            body: 'Add travelers and trip participants, assign shared things and shared jobs, and see who is responsible for what.'
          },
          {
            title: 'See what is already done',
            body: 'Check what is packed, what is still not packed, what was accepted, and what still needs attention before the trip.'
          }
        ]
      },
      {
        kind: 'list',
        id: 'welcome-who-plantour-is-for',
        title: 'Who Plantour is for',
        intro: 'Different people can use Plantour in different ways.',
        items: [
          { text: 'Admins who create trips, manage people, and organize shared work.' },
          { text: 'Participants who join a trip, check their tasks, and pack their own things.' },
          { text: 'Temporary users who want to try Plantour before switching to a regular account.' },
          { text: 'Public visitors who want to explore packing templates before signing in.' }
        ]
      },
      {
        kind: 'steps',
        id: 'welcome-simple-way-to-start',
        title: 'A simple way to start',
        intro: 'If this is your first time, follow these steps in order.',
        steps: [
          {
            title: 'Choose how you want to begin',
            body: 'You can try guest access, sign in, or start from a public packing template. Pick the option that feels easiest to you right now.'
          },
          {
            title: 'Open or create a trip',
            body: 'Once you are inside Plantour, make sure you have a trip selected. The trip is the place where your lists, people, bags, and trip work come together.'
          },
          {
            title: 'Add the first things that matter',
            body: 'Start small. Add a few important items, one or two bags, or the people joining the trip. You do not need to build everything at once.'
          },
          {
            title: 'Use templates or AI when you need help',
            body: 'If you are unsure what to pack, use a public template or ask Plantour for AI suggestions. This is often the fastest way to get a useful starting list.'
          }
        ]
      },
      {
        kind: 'callout',
        id: 'welcome-tip',
        tone: 'tip',
        title: 'Start small',
        body: 'The best first step is not to fill in everything. Begin with one trip and a short list of must-have items. Once that feels comfortable, add travelers, shared work, bags, and more detailed lists.'
      },
      {
        kind: 'cards',
        id: 'welcome-next-pages',
        title: 'What you can do next',
        intro: 'When more help pages are added, this section will link you deeper into the Help system. For now, you can return to Help home and use search from there.',
        cards: [
          {
            title: 'Back to Help home',
            body: 'Return to the main Help page and use the search box to find available topics.',
            link: { pageId: HELP_HOME_PAGE_ID, label: 'Open Help home' }
          }
        ]
      }
    ]
  }
];