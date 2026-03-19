import { HelpBlock, HelpPage, HelpStep } from './help.models';

export const HELP_HOME_PAGE_ID = 'help-home';

type PageKind = 'overview' | 'task' | 'troubleshooting' | 'role';

interface HelpPageSpec {
  path: string[];
  title: string;
  kind: PageKind;
  parentPath?: string[];
  keywords?: string[];
}

interface SectionContext {
  name: string;
  openingHint: string;
  tripBased?: boolean;
}

const SECTION_CONTEXT: Record<string, SectionContext> = {
  public: {
    name: 'public pages',
    openingHint: 'Start on the public Plantour pages. You do not need to sign in to use these pages.'
  },
  access: {
    name: 'sign in and account access',
    openingHint: 'Open the Sign In page and choose the option that matches how you want to enter Plantour.'
  },
  'getting-started': {
    name: 'landing, plans, and checkout',
    openingHint: 'Begin from the Plantour landing page or the plan-selection flow, then choose the option that matches what you want to do next.'
  },
  dashboard: {
    name: 'dashboard',
    openingHint: 'Open the Dashboard first. It is the easiest place to see the current trip and decide what to work on next.',
    tripBased: true
  },
  profile: {
    name: 'profile',
    openingHint: 'Open your profile from the main menu before changing account, login, or plan details.'
  },
  trips: {
    name: 'trips',
    openingHint: 'Open the Trips page from the main Trip menu.',
    tripBased: true
  },
  travelers: {
    name: 'travelers',
    openingHint: 'Open the Travelers list from the Dictionary menu.'
  },
  'trip-participants': {
    name: 'trip participants',
    openingHint: 'Open the current trip first, then open the Participants list for that trip.',
    tripBased: true
  },
  items: {
    name: 'items dictionary',
    openingHint: 'Open the Items list from the Dictionary menu.'
  },
  'trip-items': {
    name: 'trip own items',
    openingHint: 'Open the current trip, then open the Trip items list.',
    tripBased: true
  },
  'shared-items': {
    name: 'shared trip items',
    openingHint: 'Open the current trip, then go to Shared items.',
    tripBased: true
  },
  todos: {
    name: 'to-do dictionary',
    openingHint: 'Open the Todos list from the Dictionary menu.'
  },
  'trip-todos': {
    name: 'trip own to-dos',
    openingHint: 'Open the current trip, then open the Trip todos list.',
    tripBased: true
  },
  'shared-todos': {
    name: 'shared trip to-dos',
    openingHint: 'Open the current trip, then go to Shared todos.',
    tripBased: true
  },
  bags: {
    name: 'bags and packing',
    openingHint: 'Open the Bags list or the Trip bags list, depending on whether you want saved bags or bags for one trip.',
    tripBased: true
  },
  templates: {
    name: 'templates',
    openingHint: 'Open the Template items list when you want to reuse a ready-made starting point.'
  },
  ai: {
    name: 'AI recommendations',
    openingHint: 'Open the AI prompts list when you want Plantour to suggest items for a trip.',
    tripBased: true
  },
  comments: {
    name: 'comments and coordination',
    openingHint: 'Open the current trip, then go to Comments.',
    tripBased: true
  },
  reports: {
    name: 'reports and downloads',
    openingHint: 'Open the trip page you are working in, then use the download action that matches the document you need.',
    tripBased: true
  },
  billing: {
    name: 'billing and plan changes',
    openingHint: 'Open the plan-selection flow or the Profile page before changing billing-related settings.'
  },
  'temporary-users': {
    name: 'temporary user access',
    openingHint: 'Begin from guest access or from your profile if you are already using a temporary account.'
  },
  'by-role': {
    name: 'role-based help',
    openingHint: 'Choose the page that matches your role so the steps fit the way you use Plantour.'
  },
  tasks: {
    name: 'task-based guides',
    openingHint: 'Use these pages when you know the result you want, but you are not sure which screen to start from.',
    tripBased: true
  },
  'common-problems': {
    name: 'common problems',
    openingHint: 'Open the page that matches the problem you are seeing, then follow the checks in order.'
  }
};

const overview = (path: string[], title: string, parentPath?: string[], keywords?: string[]): HelpPageSpec => ({
  path,
  title,
  kind: 'overview',
  parentPath,
  keywords
});

const task = (path: string[], title: string, parentPath?: string[], keywords?: string[]): HelpPageSpec => ({
  path,
  title,
  kind: 'task',
  parentPath,
  keywords
});

const trouble = (path: string[], title: string, parentPath?: string[], keywords?: string[]): HelpPageSpec => ({
  path,
  title,
  kind: 'troubleshooting',
  parentPath,
  keywords
});

const role = (path: string[], title: string, parentPath?: string[], keywords?: string[]): HelpPageSpec => ({
  path,
  title,
  kind: 'role',
  parentPath,
  keywords
});

const HELP_PAGE_SPECS: HelpPageSpec[] = [
  task(['how-plantour-works'], 'What Plantour helps you do', []),
  task(['choose-how-to-start'], 'Choose the best way to start', []),
  task(['roles-and-access'], 'Admins, participants, and temporary users', []),

  overview(['public'], 'Public pages overview', []),
  overview(['public', 'packing-list-generator'], 'Public packing list generator', ['public']),
  task(['public', 'packing-list-generator', 'choose-between-public-templates-and-guest-access'], 'Choose between public templates and guest access', ['public', 'packing-list-generator'], ['Try no account needed', 'public templates', 'guest access']),
  task(['public', 'packing-list-generator', 'how-to-browse-templates'], 'Browse public templates', ['public', 'packing-list-generator']),
  task(['public', 'packing-list-generator', 'how-to-search-and-filter'], 'Search and filter public templates', ['public', 'packing-list-generator']),
  task(['public', 'packing-list-generator', 'template-details'], 'Open a template and read its item list', ['public', 'packing-list-generator']),
  task(['public', 'packing-list-generator', 'how-to-start-from-a-public-template'], 'Use a public template to begin planning', ['public', 'packing-list-generator']),
  overview(['public', 'guest-access'], 'Try Plantour with guest access', ['public']),

  task(['public', 'guest-access', 'start-guest-access-and-open-the-las-vegas-demo-trip'], 'Start guest access and open the Las Vegas demo trip', ['public', 'guest-access'], ['Try packing your items for the trip', 'Weekend in Las Vegas', 'Las Vegas', 'temporary account', 'demo trip']),
  
  task(['public', 'guest-access', 'what-guest-access-includes'], 'What guest access includes', ['public', 'guest-access']),
  task(['public', 'guest-access', 'limits-of-guest-access'], 'Limits of guest access', ['public', 'guest-access']),

  overview(['access'], 'Sign in and access overview', []),
  overview(['access', 'admin-sign-in'], 'Sign in as an admin', ['access']),
  task(['access', 'admin-sign-in', 'how-email-link-sign-in-works'], 'How the email sign-in link works', ['access', 'admin-sign-in']),
  trouble(['access', 'admin-sign-in', 'what-to-do-if-the-email-does-not-arrive'], 'Email link did not arrive', ['access', 'admin-sign-in']),
  trouble(['access', 'admin-sign-in', 'what-to-do-if-the-link-expired'], 'Email link expired', ['access', 'admin-sign-in']),
  overview(['access', 'participant-sign-in'], 'Sign in as a participant', ['access']),
  task(['access', 'participant-sign-in', 'how-to-use-an-access-code'], 'Use an access code', ['access', 'participant-sign-in']),
  overview(['access', 'social-sign-in'], 'Sign in with Google or Facebook', ['access']),
  task(['access', 'social-sign-in', 'google'], 'Sign in with Google', ['access', 'social-sign-in']),
  task(['access', 'social-sign-in', 'facebook'], 'Sign in with Facebook', ['access', 'social-sign-in']),
  overview(['access', 'temporary-user'], 'Use Plantour as a temporary user', ['access']),
  task(['access', 'temporary-user', 'how-to-start-a-temporary-account'], 'Start guest access', ['access', 'temporary-user']),
  task(['access', 'temporary-user', 'how-to-keep-your-data'], 'Keep your data when moving from guest access to a regular account', ['access', 'temporary-user']),
  task(['access', 'sign-out'], 'Sign out safely', ['access']),

  overview(['getting-started'], 'Getting started overview', []),
  task(['getting-started', 'landing-page'], 'Understand the landing page', ['getting-started']),
  task(['getting-started', 'choose-a-plan'], 'Compare Starter, Family, and Expedition', ['getting-started']),
  task(['getting-started', 'start-free'], 'Start with the free plan', ['getting-started']),
  task(['getting-started', 'start-paid-plan'], 'Start a paid plan', ['getting-started']),
  overview(['getting-started', 'checkout'], 'Checkout overview', ['getting-started']),
  task(['getting-started', 'checkout', 'enter-your-email'], 'Enter your email during checkout', ['getting-started', 'checkout']),
  task(['getting-started', 'checkout', 'what-happens-after-payment'], 'What happens after payment', ['getting-started', 'checkout']),
  trouble(['getting-started', 'checkout', 'what-to-do-if-payment-fails'], 'Payment failed', ['getting-started', 'checkout']),
  task(['getting-started', 'checkout', 'temporary-user-checkout'], 'Upgrade after using guest access', ['getting-started', 'checkout']),

  overview(['dashboard'], 'Dashboard overview', []),
  task(['dashboard', 'how-to-choose-a-current-trip'], 'Choose the trip you are working on', ['dashboard']),
  task(['dashboard', 'trip-info'], 'Trip info block', ['dashboard']),
  task(['dashboard', 'user-trip-info'], 'Your trip info block', ['dashboard']),
  task(['dashboard', 'all-users-trip-info'], 'All users trip info block', ['dashboard']),
  task(['dashboard', 'how-to-use-the-dashboard-to-decide-what-to-do-next'], 'Use the dashboard as your starting point', ['dashboard']),

  overview(['profile'], 'Profile overview', []),
  task(['profile', 'personal-information'], 'Update your personal information', ['profile']),
  task(['profile', 'social-login'], 'Connect or review social sign-in methods', ['profile']),
  task(['profile', 'participant-code'], 'Find or use a participant code', ['profile']),
  task(['profile', 'temporary-account-email'], 'Replace a guest email with your real email', ['profile']),
  task(['profile', 'billing-plan-and-subscription'], 'Open billing, plan, and subscription tools', ['profile']),
  task(['profile', 'scheduled-plan-change'], 'Understand a scheduled plan downgrade', ['profile']),

  overview(['trips'], 'Trips overview', []),
  task(['trips', 'how-to-create-a-trip'], 'Create a trip', ['trips']),
  task(['trips', 'how-to-open-an-existing-trip'], 'Open an existing trip', ['trips']),
  task(['trips', 'how-to-edit-a-trip'], 'Edit a trip', ['trips']),
  task(['trips', 'how-to-view-a-trip'], 'View trip details', ['trips']),
  task(['trips', 'how-to-select-the-right-trip-before-working'], 'Make sure you are in the right trip', ['trips']),
  task(['trips', 'how-to-download-a-trip-pdf'], 'Download a trip PDF', ['trips']),

  overview(['travelers'], 'Travelers overview', []),
  task(['travelers', 'personal-travelers-list'], 'Your travelers list', ['travelers']),
  task(['travelers', 'how-to-add-a-traveler'], 'Add a traveler', ['travelers']),
  task(['travelers', 'how-to-edit-a-traveler'], 'Edit a traveler', ['travelers']),
  task(['travelers', 'how-to-view-a-traveler'], 'View traveler details', ['travelers']),
  task(['travelers', 'how-travelers-connect-to-trips'], 'How travelers connect to trips', ['travelers']),

  overview(['trip-participants'], 'Trip participants overview', []),
  task(['trip-participants', 'how-to-add-a-person-to-a-trip'], 'Add a person to a trip', ['trip-participants']),
  task(['trip-participants', 'how-to-edit-a-trip-participant'], 'Edit a trip participant', ['trip-participants']),
  task(['trip-participants', 'how-to-view-a-trip-participant'], 'View a trip participant', ['trip-participants']),
  role(['trip-participants', 'admin-view'], 'What admins can do with trip participants', ['trip-participants']),
  role(['trip-participants', 'participant-view'], 'What participants can do with trip participants', ['trip-participants']),

  overview(['items'], 'Items overview', []),
  task(['items', 'your-items-dictionary'], 'What the items dictionary is for', ['items']),
  task(['items', 'how-to-add-an-item'], 'Add an item to your dictionary', ['items']),
  task(['items', 'how-to-edit-an-item'], 'Edit an item in your dictionary', ['items']),
  task(['items', 'how-to-keep-items-organized'], 'Keep items easy to find later', ['items']),

  overview(['trip-items'], 'Trip own items overview', []),
  task(['trip-items', 'how-to-add-an-item-directly-to-a-trip'], 'Add an item directly to a trip', ['trip-items']),
  task(['trip-items', 'how-to-edit-a-trip-item'], 'Edit a trip item', ['trip-items']),
  task(['trip-items', 'how-to-add-items-from-your-dictionary'], 'Add items from your dictionary', ['trip-items']),
  task(['trip-items', 'how-to-read-item-status'], 'Understand packed and assignment status', ['trip-items']),
  task(['trip-items', 'how-to-show-or-hide-assignment-details'], 'Show or hide assignment details', ['trip-items']),

  overview(['shared-items'], 'Shared trip items overview', []),
  task(['shared-items', 'how-to-add-a-shared-item'], 'Add a shared item', ['shared-items']),
  task(['shared-items', 'how-to-edit-a-shared-item'], 'Edit a shared item', ['shared-items']),
  task(['shared-items', 'how-to-view-a-shared-item'], 'View shared item details', ['shared-items']),
  task(['shared-items', 'how-to-assign-a-shared-item'], 'Assign a shared item to someone', ['shared-items']),
  task(['shared-items', 'how-to-accept-an-item-assignment'], 'Accept an item assignment', ['shared-items']),
  task(['shared-items', 'how-to-reject-an-item-assignment'], 'Reject an item assignment', ['shared-items']),
  task(['shared-items', 'how-to-finish-an-item-assignment'], 'Mark an item assignment as finished', ['shared-items']),
  task(['shared-items', 'how-admins-track-shared-item-progress'], 'Track shared item progress as an admin', ['shared-items']),

  overview(['todos'], 'To-do overview', []),
  task(['todos', 'your-todo-dictionary'], 'What your to-do dictionary is for', ['todos']),
  task(['todos', 'how-to-add-a-todo'], 'Add a to-do', ['todos']),
  task(['todos', 'how-to-edit-a-todo'], 'Edit a to-do', ['todos']),
  task(['todos', 'how-to-keep-todos-organized'], 'Keep your to-dos easy to manage', ['todos']),

  overview(['trip-todos'], 'Trip own to-dos overview', []),
  task(['trip-todos', 'how-to-add-a-trip-todo'], 'Add a to-do directly to a trip', ['trip-todos']),
  task(['trip-todos', 'how-to-edit-a-trip-todo'], 'Edit a trip to-do', ['trip-todos']),
  task(['trip-todos', 'how-to-add-todos-from-your-dictionary'], 'Add to-dos from your dictionary', ['trip-todos']),
  task(['trip-todos', 'how-to-read-todo-status'], 'Understand trip to-do status', ['trip-todos']),
  task(['trip-todos', 'how-to-show-or-hide-assignment-details'], 'Show or hide assignment details', ['trip-todos']),

  overview(['shared-todos'], 'Shared trip to-dos overview', []),
  task(['shared-todos', 'how-to-add-a-shared-todo'], 'Add a shared to-do', ['shared-todos']),
  task(['shared-todos', 'how-to-edit-a-shared-todo'], 'Edit a shared to-do', ['shared-todos']),
  task(['shared-todos', 'how-to-view-a-shared-todo'], 'View shared to-do details', ['shared-todos']),
  task(['shared-todos', 'how-to-assign-a-shared-todo'], 'Assign a shared to-do', ['shared-todos']),
  task(['shared-todos', 'how-to-accept-a-todo-assignment'], 'Accept a to-do assignment', ['shared-todos']),
  task(['shared-todos', 'how-to-reject-a-todo-assignment'], 'Reject a to-do assignment', ['shared-todos']),
  task(['shared-todos', 'how-to-finish-a-todo-assignment'], 'Mark a to-do assignment as finished', ['shared-todos']),
  task(['shared-todos', 'how-admins-track-shared-todo-progress'], 'Track shared to-do progress as an admin', ['shared-todos']),

  overview(['bags'], 'Bags and packing overview', []),
  task(['bags', 'your-bags-list'], 'Your bags list', ['bags']),
  task(['bags', 'how-to-add-a-bag'], 'Add a bag', ['bags']),
  task(['bags', 'how-to-edit-a-bag'], 'Edit a bag', ['bags']),
  task(['bags', 'how-bags-work-with-trip-items'], 'How bags work with trip items', ['bags']),
  overview(['bags', 'trip-bags'], 'Trip bags overview', ['bags']),
  task(['bags', 'trip-bags', 'how-to-add-a-bag-to-a-trip'], 'Add a bag to a trip', ['bags', 'trip-bags']),
  task(['bags', 'trip-bags', 'how-to-edit-a-trip-bag'], 'Edit a trip bag', ['bags', 'trip-bags']),
  task(['bags', 'trip-bags', 'how-to-add-a-bag-from-your-bags-list'], 'Add bags from your saved list', ['bags', 'trip-bags']),
  task(['bags', 'trip-bags', 'how-to-pack-items-into-bags'], 'Pack items into bags', ['bags', 'trip-bags']),
  task(['bags', 'trip-bags', 'how-to-see-what-is-not-packed-yet'], 'See what is still not packed', ['bags', 'trip-bags']),
  task(['bags', 'trip-bags', 'how-to-download-packing-lists'], 'Download packing lists', ['bags', 'trip-bags']),

  overview(['templates'], 'Templates overview', []),
  task(['templates', 'how-to-browse-your-templates'], 'Browse your templates', ['templates']),
  task(['templates', 'how-to-use-a-template'], 'Use a template to start faster', ['templates']),
  task(['templates', 'how-templates-help-repeat-trips'], 'Reuse templates for similar trips', ['templates']),

  overview(['ai'], 'AI recommendations overview', []),
  task(['ai', 'how-to-describe-your-trip'], 'Describe your trip so Plantour can help', ['ai']),
  task(['ai', 'how-to-get-item-suggestions'], 'Get item suggestions from AI', ['ai']),
  task(['ai', 'how-to-review-ai-suggestions'], 'Review AI suggestions before adding them', ['ai']),
  task(['ai', 'how-to-add-ai-items-to-your-items-dictionary'], 'Add AI items to your items dictionary', ['ai']),
  task(['ai', 'how-to-add-ai-items-to-trip-own-items'], 'Add AI items to your trip own items', ['ai']),
  task(['ai', 'how-to-add-ai-items-to-trip-shared-items'], 'Add AI items to your trip shared items', ['ai']),
  task(['ai', 'how-to-sort-filter-and-search-ai-results'], 'Sort, filter, and search AI results', ['ai']),
  task(['ai', 'when-ai-results-need-manual-checking'], 'When you should double-check AI results', ['ai']),

  overview(['comments'], 'Trip comments overview', []),
  task(['comments', 'how-to-add-a-trip-comment'], 'Add a trip comment', ['comments']),
  task(['comments', 'how-to-use-comments-for-coordination'], 'Keep trip communication clear', ['comments']),

  overview(['reports'], 'Reports and downloads overview', []),
  task(['reports', 'trip-pdf'], 'Download the trip PDF', ['reports']),
  task(['reports', 'packing-lists'], 'Download packing lists for bags', ['reports']),
  task(['reports', 'when-to-use-each-download'], 'Choose the right download for your task', ['reports']),

  overview(['billing'], 'Billing overview', []),
  task(['billing', 'how-to-upgrade-your-plan'], 'Upgrade your plan', ['billing']),
  task(['billing', 'how-to-downgrade-your-plan'], 'Downgrade your plan', ['billing']),
  task(['billing', 'when-a-downgrade-takes-effect'], 'When a downgrade takes effect', ['billing']),
  task(['billing', 'how-to-open-the-customer-portal'], 'Open the billing portal', ['billing']),
  trouble(['billing', 'what-to-do-if-you-already-have-an-active-plan'], 'Already have an active plan', ['billing']),

  overview(['temporary-users'], 'Temporary user overview', []),
  task(['temporary-users', 'first-five-minutes'], 'Your first five minutes with a temporary account', ['temporary-users'], ['Weekend in Las Vegas', 'Trip button', 'compass icon', 'Items', 'plus button', 'Robin.Miles']),
  task(['temporary-users', 'why-use-guest-access-first'], 'Why guest access can be useful', ['temporary-users']),
  task(['temporary-users', 'what-you-can-do-as-a-temporary-user'], 'What temporary users can do', ['temporary-users']),
  task(['temporary-users', 'what-you-cannot-do-as-a-temporary-user'], 'What temporary users cannot do', ['temporary-users']),
  task(['temporary-users', 'how-to-move-to-a-regular-account'], 'Move from temporary access to a regular account', ['temporary-users']),
  task(['temporary-users', 'what-happens-if-you-sign-out'], 'What happens if you sign out', ['temporary-users']),

  overview(['by-role'], 'Choose help by role', []),
  role(['by-role', 'admin'], 'Help for admins', ['by-role']),
  role(['by-role', 'admin', 'first-trip-setup'], 'First trip setup for admins', ['by-role', 'admin']),
  role(['by-role', 'admin', 'manage-people-and-assignments'], 'Manage people and assignments', ['by-role', 'admin']),
  role(['by-role', 'admin', 'manage-billing-and-plan'], 'Manage billing and plan as an admin', ['by-role', 'admin']),
  role(['by-role', 'participant'], 'Help for participants', ['by-role']),
  role(['by-role', 'participant', 'join-a-trip-and-start-working'], 'Join a trip and start working', ['by-role', 'participant']),
  role(['by-role', 'participant', 'accept-and-finish-assignments'], 'Accept and finish assignments', ['by-role', 'participant']),
  role(['by-role', 'participant', 'pack-your-items'], 'Pack your items', ['by-role', 'participant']),
  role(['by-role', 'temporary-user'], 'Help for temporary users', ['by-role']),
  role(['by-role', 'temporary-user', 'try-plantour-before-signing-up'], 'Try Plantour before signing up', ['by-role', 'temporary-user']),

  overview(['tasks'], 'Task-based guides overview', []),
  task(['tasks', 'create-your-first-trip'], 'Create your first trip', ['tasks']),

  task(['tasks', 'first-steps'], 'Simple first steps', ['tasks'], ['trip', 'items', 'bags', 'packing', 'pdf packing list', 'first steps']),
  
  task(['tasks', 'add-people-to-a-trip'], 'Add people to a trip', ['tasks']),
  task(['tasks', 'build-a-packing-list'], 'Build a packing list', ['tasks']),
  task(['tasks', 'build-a-todo-list'], 'Build a to-do list', ['tasks']),
  task(['tasks', 'assign-shared-responsibilities'], 'Assign shared responsibilities', ['tasks']),
  task(['tasks', 'pack-items-into-bags'], 'Pack items into bags', ['tasks']),
  task(['tasks', 'use-a-template'], 'Start from a template', ['tasks']),
  task(['tasks', 'use-ai-recommendations'], 'Start from AI recommendations', ['tasks']),
  task(['tasks', 'download-trip-documents'], 'Download trip documents', ['tasks']),
  task(['tasks', 'move-from-guest-access-to-paid-use'], 'Move from guest access to paid use', ['tasks']),

  overview(['common-problems'], 'Common problems overview', []),
  trouble(['common-problems', 'cannot-sign-in'], 'Cannot sign in', ['common-problems']),
  trouble(['common-problems', 'email-link-did-not-arrive'], 'Sign-in email did not arrive', ['common-problems']),
  trouble(['common-problems', 'access-code-does-not-work'], 'Access code does not work', ['common-problems']),
  trouble(['common-problems', 'cannot-open-checkout'], 'Cannot open checkout', ['common-problems']),
  trouble(['common-problems', 'already-have-an-active-plan'], 'Already have an active plan', ['common-problems']),
  trouble(['common-problems', 'cannot-find-my-trip'], 'Cannot find my trip', ['common-problems']),
  trouble(['common-problems', 'cannot-add-more-items-or-people'], 'Reached a plan limit', ['common-problems']),
  trouble(['common-problems', 'guest-account-concerns'], 'Questions about guest access', ['common-problems'])
];

const pathId = (path: string[] | undefined): string => {
  if (!path || path.length === 0) {
    return HELP_HOME_PAGE_ID;
  }

  return path.join('/');
};

const childSpecMap = new Map<string, HelpPageSpec[]>();
for (const spec of HELP_PAGE_SPECS) {
  const parentId = pathId(spec.parentPath);
  const existing = childSpecMap.get(parentId) ?? [];
  existing.push(spec);
  childSpecMap.set(parentId, existing);
}

function getSectionContext(spec: HelpPageSpec): SectionContext {
  return SECTION_CONTEXT[spec.path[0]] ?? {
    name: 'this Plantour page',
    openingHint: 'Open the matching Plantour page, then follow the steps below one by one.'
  };
}

function humanAction(title: string): string {
  const lower = title.toLowerCase();
  if (lower.startsWith('how to ')) {
    return lower.slice(7);
  }
  return lower;
}

function buildOverviewSummary(spec: HelpPageSpec): string {
  return `${spec.title} in Plantour, explained in simple language with short steps and clear next actions.`;
}

function buildTaskSummary(spec: HelpPageSpec): string {
  return `Step-by-step help for ${humanAction(spec.title)} in Plantour.`;
}

function buildTroubleshootingSummary(spec: HelpPageSpec): string {
  return `Simple checks to try when ${humanAction(spec.title)} in Plantour.`;
}

function buildRoleSummary(spec: HelpPageSpec): string {
  return `${spec.title}, with practical guidance for the way you use Plantour.`;
}

function buildDescription(spec: HelpPageSpec): string {
  return `${spec.title} in Plantour. Friendly step-by-step guidance designed for users who want clear, non-technical help.`;
}

function buildChooseHowToStartPage(): Partial<HelpPage> {
  return {
    summary: 'Pick the quickest starting path for Plantour: public templates, guest access with demo data, or a regular account.',
    description: 'Learn the fastest ways to start Plantour, including public templates and a temporary account with a ready-made demo trip.',
    relatedPageIds: [HELP_HOME_PAGE_ID, 'public/guest-access', 'temporary-users'],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'choose-start-intro',
        paragraphs: [
          'If you want to get started quickly, the first minute matters most. This page helps you choose the shortest path to a useful first result.',
          'You do not need to commit right away. You can browse public templates, try guest access with ready-made demo data, or create a regular account if you already know you want to keep your work.'
        ]
      },
      {
        kind: 'cards',
        id: 'choose-start-options',
        title: 'Three strong ways to begin',
        intro: 'Each option below is useful. Pick the one that asks the least from you right now.',
        cards: [
          {
            title: 'Try the Las Vegas demo trip first',
            body: 'Use the landing page button labeled Try packing your items for the trip. Plantour creates a temporary account and opens ready-made sample data so you can try the real workflow immediately.',
            link: { pageId: 'public/guest-access/start-guest-access-and-open-the-las-vegas-demo-trip' }
          },
          {
            title: 'Browse public templates first',
            body: 'If you want to see useful packing ideas before signing in, open public templates and compare lists by activity, age, and temperature.',
            link: { pageId: 'public/packing-list-generator/choose-between-public-templates-and-guest-access' }
          },
          {
            title: 'Create a regular account now',
            body: 'Choose this path when you already know you want to keep your data, share work with others, or manage trips long term.',
            link: { pageId: 'access' }
          }
        ]
      },
      {
        kind: 'steps',
        id: 'choose-start-logic',
        title: 'A practical decision rule',
        steps: [
          {
            title: 'Choose guest access if you want the fastest start',
            body: 'Guest access is best when you want to try Plantour quickly. It gives you a temporary account and a ready-made active trip called Weekend in Las Vegas so you can test real actions immediately.'
          },
          {
            title: 'Choose public templates if you want ideas first',
            body: 'Templates are better when you are still deciding whether Plantour has the kind of packing help you need. You can inspect real lists before entering the app workflow.'
          },
          {
            title: 'Choose a regular account if you are ready to keep your work',
            body: 'If you already want saved trips, sharing, or long-term use, it is reasonable to sign in directly and skip the temporary step.'
          }
        ]
      }
    ]
  };
}

function buildPublicOverviewPage(): Partial<HelpPage> {
  return {
    summary: 'Public visitors can start with templates or jump straight into a temporary account with prefilled demo data.',
    relatedPageIds: [HELP_HOME_PAGE_ID, 'choose-how-to-start', 'public/guest-access'],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'public-overview-intro',
        paragraphs: [
          'The public side of Plantour helps you explore the app before signing in with a regular account.',
          'There are two quick ways to begin here. One is public templates for browsing. The other is guest access for hands-on testing with ready-made sample trips.'
        ]
      },
      {
        kind: 'cards',
        id: 'public-overview-paths',
        title: 'Best entry paths for public visitors',
        cards: [
          {
            title: 'Guest access with demo data',
            body: 'Best for visitors who want to click around the real app immediately. This path leads to the Weekend in Las Vegas sample trip and lets them add real items.',
            link: { pageId: 'public/guest-access/start-guest-access-and-open-the-las-vegas-demo-trip' }
          },
          {
            title: 'Public templates before sign-in',
            body: 'Best for visitors who want to inspect template quality first. They can search, filter, and open template details without creating an account.',
            link: { pageId: 'public/packing-list-generator/choose-between-public-templates-and-guest-access' }
          }
        ]
      },
      {
        kind: 'callout',
        id: 'public-overview-callout',
        tone: 'tip',
        title: 'Start with one real action',
        body: 'Try one meaningful action quickly, such as opening the Weekend in Las Vegas trip and adding a first item. That is usually more helpful than reading long explanations.'
      }
    ]
  };
}

function buildGuestAccessOverviewPage(): Partial<HelpPage> {
  return {
    summary: 'Guest access is the fastest way to try Plantour with a temporary account and ready-made demo trips.',
    relatedPageIds: ['choose-how-to-start', 'temporary-users', 'public/guest-access/start-guest-access-and-open-the-las-vegas-demo-trip'],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'guest-access-intro',
        paragraphs: [
          'Guest access lets you try Plantour without setting everything up from scratch first.',
          'You start in a temporary account with sample trips and sample items already prepared, so the next step is simple: open a trip and try one action.'
        ]
      },
      {
        kind: 'cards',
        id: 'guest-access-paths',
        title: 'Best pages for the first session',
        cards: [
          {
            title: 'Start guest access and open the demo trip',
            body: 'Follow the exact path from the landing page button to the ready-made Weekend in Las Vegas trip.',
            link: { pageId: 'public/guest-access/start-guest-access-and-open-the-las-vegas-demo-trip' }
          },
          {
            title: 'First five minutes as a temporary user',
            body: 'Use a short guided checklist after the account opens so you can complete one or two useful actions quickly.',
            link: { pageId: 'temporary-users/first-five-minutes' }
          },
          {
            title: 'Keep your data later',
            body: 'When you are ready to stay, move from the temporary account to a regular account without losing the work you created.',
            link: { pageId: 'access/temporary-user/how-to-keep-your-data' }
          }
        ]
      },
      {
        kind: 'list',
        id: 'guest-access-seeded-data',
        title: 'What the temporary account already includes',
        items: [
          { text: 'An active trip named Weekend in Las Vegas so you can test current-trip actions immediately.' },
          { text: 'A past trip named Week in Europe so you can compare a finished trip with an active one.' },
          { text: 'Ready-made bags Backpack and Daypack and sample items such as Passport, Cash, Hotel Reservation, Sunscreen, and Phone Charger.' }
        ]
      }
    ]
  };
}

function buildPublicTemplatesDecisionPage(): Partial<HelpPage> {
  return {
    summary: 'Use public templates when you want ideas first, and switch to guest access when you want to test the real app flow.',
    relatedPageIds: ['public/packing-list-generator', 'public/guest-access'],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'public-templates-decision-intro',
        paragraphs: [
          'Public templates and guest access help in different ways. Templates help you review packing ideas. Guest access lets you try the app workflow with a real sample trip.',
          'This page helps you choose the right next step.'
        ]
      },
      {
        kind: 'steps',
        id: 'public-templates-decision-steps',
        title: 'When to choose each path',
        steps: [
          {
            title: 'Stay in public templates when you are still comparing ideas',
            body: 'Use search and filters on the templates page, then open a template detail page to inspect the categories and item list.'
          },
          {
            title: 'Switch to guest access when you want to test the real workflow',
            body: 'Use the Try no account needed button on the public templates page or template detail page to enter a temporary account and work with a real trip.'
          },
          {
            title: 'Use a regular account only when you are ready to keep your work',
            body: 'If you want saved data, sharing, or long-term use, create an account instead of staying in guest access.'
          }
        ]
      }
    ]
  };
}

function buildStartGuestAccessDemoTripPage(): Partial<HelpPage> {
  return {
    summary: 'Use the landing page button, open Weekend in Las Vegas, then add an item through Trip to Items so you can complete your first task quickly.',
    description: 'Specific first-step guidance for public users: start guest access, open the ready-made Las Vegas trip, and add a first trip item.',
    relatedPageIds: ['choose-how-to-start', 'public/guest-access', 'temporary-users/first-five-minutes'],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'guest-demo-intro',
        paragraphs: [
          'This is the fastest path for a public user who wants to try Plantour quickly. The goal is not to explain every feature. The goal is to help you complete one real task in the app.',
          'The fastest path is: start guest access, open the ready-made Weekend in Las Vegas trip, then add a first item to that trip.'
        ]
      },
      {
        kind: 'steps',
        id: 'guest-demo-steps',
        title: 'Exact first steps',
        steps: [
          {
            title: 'Start from the public landing page',
            body: 'On the landing page, click the button labeled Try packing your items for the trip. This starts guest access without asking for a regular account first.'
          },
          {
            title: 'Let Plantour create the temporary account',
            body: 'Plantour signs you in automatically with a temporary account and opens the app with prefilled sample data. You do not need to create a password for this first test.'
          },
          {
            title: 'Open the Trip menu with the compass icon',
            body: 'In the toolbar, click Trip. The Trip button uses the compass icon. In that menu, choose Trips to open the list of trips available in the temporary account.'
          },
          {
            title: 'Open Weekend in Las Vegas',
            body: 'In the trips list, select Weekend in Las Vegas. This ready-made active trip is the easiest place for a first walkthrough.'
          },
          {
            title: 'Go to Trip, then Items',
            body: 'Use the same toolbar Trip menu again and choose Items. This opens the trip items screen for the currently selected trip.'
          },
          {
            title: 'Click the plus button and add one simple item',
            body: 'Click + and create one easy test item, such as Sunglasses, Toothbrush, or Wallet. Save it, then confirm it appears in the trip items list.'
          }
        ]
      },
      {
        kind: 'list',
        id: 'guest-demo-what-you-see',
        title: 'What you should already see',
        intro: 'The temporary account includes sample data so you can start right away.',
        items: [
          { text: 'A current active trip named Weekend in Las Vegas.' },
          { text: 'A past example trip named Week in Europe for comparison.' },
          { text: 'Sample bags Backpack and Daypack.' },
          { text: 'Example items such as Passport, Cash, Hotel Reservation, Sunscreen, and Phone Charger.' }
        ]
      },
      {
        kind: 'callout',
        id: 'guest-demo-tip',
        tone: 'tip',
        title: 'Start with one small action',
        body: 'For the first session, adding one item is enough. After that, you can explore Bags, Todos, or public templates if you want to continue.'
      }
    ]
  };
}

function buildTemporaryUsersOverviewPage(): Partial<HelpPage> {
  return {
    summary: 'Temporary users need a guided first session with seeded data, fast wins, and a clear path to keep their work later.',
    relatedPageIds: ['public/guest-access', 'temporary-users/first-five-minutes', 'access/temporary-user/how-to-keep-your-data'],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'temporary-overview-intro',
        paragraphs: [
          'Temporary access lets you explore Plantour before deciding whether to create a regular account.',
          'The temporary account includes ready-made trips, ready-made items, and a clear first action so you can start using the app immediately.'
        ]
      },
      {
        kind: 'cards',
        id: 'temporary-overview-cards',
        title: 'Best pages for temporary users',
        cards: [
          {
            title: 'Your first five minutes',
            body: 'Follow a short sequence that helps you learn the app through a few simple actions.',
            link: { pageId: 'temporary-users/first-five-minutes' }
          },
          {
            title: 'Start from the public landing page',
            body: 'See the exact landing page button and ready-made trip that make the first session easy to follow.',
            link: { pageId: 'public/guest-access/start-guest-access-and-open-the-las-vegas-demo-trip' }
          },
          {
            title: 'Keep your data later',
            body: 'When the user is ready to stay, move from the temporary account toward a regular account without throwing work away.',
            link: { pageId: 'access/temporary-user/how-to-keep-your-data' }
          }
        ]
      }
    ]
  };
}

function buildTemporaryUsersFirstFiveMinutesPage(): Partial<HelpPage> {
  return {
    summary: 'A quick checklist for the first five minutes: confirm the temporary account, open Weekend in Las Vegas, add one item, then inspect bags and the finished Europe sample.',
    description: 'Specific first-session instructions for temporary users, using the ready-made demo account and exact menu labels from Plantour.',
    relatedPageIds: ['temporary-users', 'public/guest-access/start-guest-access-and-open-the-las-vegas-demo-trip', 'trip-items/how-to-add-an-item-directly-to-a-trip'],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'temporary-first-five-intro',
        paragraphs: [
          'A new temporary user should not have to guess what to do first. This page gives you a guided path through one or two simple actions.',
          'This short walkthrough uses the exact sample data in the temporary account so every step matches what you see on screen.'
        ]
      },
      {
        kind: 'steps',
        id: 'temporary-first-five-steps',
        title: 'First five minutes checklist',
        steps: [
          {
            title: 'Notice that you are already inside a temporary account',
            body: 'Plantour signs you in to a temporary account automatically. The generated email can look like Robin.Miles followed by numbers. That is normal for guest access.'
          },
          {
            title: 'Open Trip with the compass icon, then choose Trips',
            body: 'This shows the list of demo trips in the temporary account. You should see an active trip named Weekend in Las Vegas and a past trip named Week in Europe.'
          },
          {
            title: 'Choose Weekend in Las Vegas',
            body: 'Use this active trip for hands-on testing. It is the best first place to add or change something because it represents a trip that is still in progress.'
          },
          {
            title: 'Open Trip, then Items, then click +',
            body: 'This is the fastest route to a useful first action. Add one simple item, save it, and make sure it appears in the list with the other trip items.'
          },
          {
            title: 'Open Trip, then Bags, and inspect Backpack and Daypack',
            body: 'This shows how Plantour connects items with bags. Even without editing anything yet, you can see that packing is more than a flat checklist.'
          },
          {
            title: 'Go back to Trips and open Week in Europe',
            body: 'This past trip helps you compare an already-finished example with the active Las Vegas trip. It shows how Plantour can display both planning in progress and finished results.'
          }
        ]
      },
      {
        kind: 'cards',
        id: 'temporary-first-five-next-actions',
        title: 'Best next actions after the first win',
        cards: [
          {
            title: 'Add another trip item',
            body: 'Keep the momentum going with one or two more essential items instead of trying every feature at once.',
            link: { pageId: 'trip-items/how-to-add-an-item-directly-to-a-trip' }
          },
          {
            title: 'See what guest access includes',
            body: 'Review what the temporary account includes and which parts of Plantour you can already test.',
            link: { pageId: 'public/guest-access/what-guest-access-includes' }
          },
          {
            title: 'Keep your work later',
            body: 'When you are ready, move toward a regular account without losing the work you created.',
            link: { pageId: 'access/temporary-user/how-to-keep-your-data' }
          }
        ]
      }
    ]
  };
}

function buildVerySimpleFirstStepsPage(): Partial<HelpPage> {
  return {
    summary: 'The shortest practical Plantour flow: open a trip, add an item, place it into a bag, mark packing progress, and download a PDF packing list.',
    description: 'A simple first-run sequence for new users who want one clear success path through Plantour without exploring every feature first.',
    relatedPageIds: ['choose-how-to-start', 'temporary-users/first-five-minutes', 'bags/trip-bags/how-to-download-packing-lists'],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'simple-first-steps-intro',
        paragraphs: [
          'This is the shortest useful walkthrough in Plantour. It is designed for the first session, when the user only needs one clear path and one clear result. Follow this exact sequence: Trip, then Items, then Bags, then packing, then the PDF packing list. Do not try to learn the full app first.'
        ]
      },
      {
        kind: 'steps',
        id: 'simple-first-steps-sequence',
        title: 'Five simple steps',
        steps: [
          {
            title: 'Open Trip, then Trips, and choose the trip you will work on',
            body: 'Use the toolbar button labeled "Trip" with a compass icon. Select "Trips" and click the trip you want to test. If you work as a temporary guest user, click "Weekend in Las Vegas". Or create a new trip by clicking the "+" button and adding a trip name and dates. The selected trip should be highlighted.'
          },
          {
            title: 'Open Trip, then Items, then click + to add one item',
            body: 'Create one simple item such as Sunglasses, Toothbrush, or Charger. Save it and confirm it appears in the trip items list.'
          },
          {
            title: 'Open Trip, then Bags, and make sure you have a bag to use',
            body: 'If a bag already exists, open it. In guest access you should already see Backpack and Daypack. If needed, add a new bag before continuing.'
          },
          {
            title: 'Pack the item in a bag',
            body: 'Open "Trip," then "Items". Select the item you want to pack. A drop-down list of bags will appear on the right. If you do not see it, click the three-dot button in the form header on the right and select "Show Bags". A drop-down list of bags should appear. Select a bag.'
          },
          {
            title: 'Download the PDF packing list',
            body: 'Open "Trip", then "Bags". Select a bag. Click the three-dot button in the form header on the right. Select "Download packing list PDF" and confirm download. You can now print the downloaded packing list and place it in your bag for use during the trip.'
          }
        ]
      },
      {
        kind: 'cards',
        id: 'simple-first-steps-deeper-links',
        title: 'Open the detailed help for each step',
        cards: [
          {
            title: 'Open a trip',
            body: 'Detailed help for choosing and opening the correct trip before you start editing anything.',
            link: { pageId: 'trips/how-to-open-an-existing-trip' }
          },
          {
            title: 'Add a trip item',
            body: 'Detailed help for adding an item directly to the selected trip.',
            link: { pageId: 'trip-items/how-to-add-an-item-directly-to-a-trip' }
          },
          {
            title: 'Pack items into bags',
            body: 'Detailed help for turning trip items into a real packing workflow with bags.',
            link: { pageId: 'bags/trip-bags/how-to-pack-items-into-bags' }
          },
          {
            title: 'Download the packing list PDF',
            body: 'Detailed help for generating the bag packing list as a PDF document.',
            link: { pageId: 'bags/trip-bags/how-to-download-packing-lists' }
          }
        ]
      }
    ]
  };
}

function getCustomPage(spec: HelpPageSpec): Partial<HelpPage> | null {
  switch (pathId(spec.path)) {
    case 'choose-how-to-start':
      return buildChooseHowToStartPage();
    case 'public':
      return buildPublicOverviewPage();
    case 'public/guest-access':
      return buildGuestAccessOverviewPage();
    case 'public/packing-list-generator/choose-between-public-templates-and-guest-access':
      return buildPublicTemplatesDecisionPage();
    case 'public/guest-access/start-guest-access-and-open-the-las-vegas-demo-trip':
      return buildStartGuestAccessDemoTripPage();
    case 'temporary-users':
      return buildTemporaryUsersOverviewPage();
    case 'temporary-users/first-five-minutes':
      return buildTemporaryUsersFirstFiveMinutesPage();
    case 'tasks/first-steps':
      return buildVerySimpleFirstStepsPage();
    default:
      return null;
  }
}

interface GeneratedTaskContent {
  description: string[];
  steps: HelpStep[];
  result: string[];
}

function matchesPage(pageId: string, ...ids: string[]): boolean {
  return ids.includes(pageId);
}

function startsWithPage(pageId: string, ...prefixes: string[]): boolean {
  return prefixes.some((prefix) => pageId.startsWith(prefix));
}

function getExactOpenInstruction(spec: HelpPageSpec): string {
  const pageId = pathId(spec.path);
  const sectionKey = spec.path[0];

  switch (sectionKey) {
    case 'public':
      if (startsWithPage(pageId, 'public/guest-access')) {
        return 'Start on the public landing page or on the Public Templates page. Use the button labeled Try packing your items for the trip or Try no account needed when you want to enter the app without a regular account.';
      }
      return 'Open More Features, then Public Templates. You can also go directly to the public templates page from the landing flow.';
    case 'access':
      return 'Open More Features, then Sign In. Keep Admin selected for email-link or social sign-in, or switch to Participant when you need to use an access code.';
    case 'getting-started':
      if (startsWithPage(pageId, 'getting-started/checkout')) {
        return 'Start from the landing or plan-selection flow until the Secure checkout page opens.';
      }
      return 'Start on the public landing page. If you are already signed in and need plan actions, open More Features, then Profile.';
    case 'dashboard':
      return 'Click Dashboard in the top toolbar.';
    case 'profile':
    case 'billing':
      return 'Open More Features, then Profile.';
    case 'trips':
    case 'reports':
      return 'Open Trip, then Trips.';
    case 'travelers':
      return 'Open Dictionary, then Travelers.';
    case 'items':
      return 'Open Dictionary, then Items.';
    case 'todos':
      return 'Open Dictionary, then Todos.';
    case 'bags':
      if (startsWithPage(pageId, 'bags/trip-bags')) {
        return 'Open Trip, then Bags.';
      }
      return 'Open Dictionary, then Bags.';
    case 'templates':
      return 'Open Dictionary, then Template items.';
    case 'ai':
      return 'Open Dictionary, then AI prompts.';
    case 'trip-participants':
      return 'Open Trip, then Trips, select the trip you want to work on, then open Trip, then Participants.';
    case 'trip-items':
      return 'Open Trip, then Trips, select the current trip, then open Trip, then Items.';
    case 'shared-items':
      return 'Open Trip, then Trips, select the current trip, then open Trip, then Shared items.';
    case 'trip-todos':
      return 'Open Trip, then Trips, select the current trip, then open Trip, then Todos.';
    case 'shared-todos':
      return 'Open Trip, then Trips, select the current trip, then open Trip, then Shared todos.';
    case 'comments':
      return 'Open Trip, then Trips, select the current trip, then open Trip, then Comments.';
    case 'temporary-users':
      return 'Start from guest access, then stay inside the temporary account until you finish the steps on this page.';
    case 'common-problems':
      return 'Open the same Plantour page where the problem appears before you start checking possible causes.';
    case 'by-role':
      return 'Open the help page that matches your role, then compare the guidance with the screens your role can actually reach.';
    case 'tasks':
      return 'Open the real Plantour screen named in the steps below and work in order instead of jumping between unrelated pages.';
    default:
      return 'Open the matching Plantour page first, then follow the steps below in order.';
  }
}

function getAccessGuidance(spec: HelpPageSpec): string {
  const pageId = pathId(spec.path);

  if (matchesPage(
    pageId,
    'trips/how-to-create-a-trip',
    'trips/how-to-edit-a-trip',
    'travelers/how-to-add-a-traveler',
    'travelers/how-to-edit-a-traveler',
    'trip-participants/how-to-add-a-person-to-a-trip',
    'trip-participants/how-to-edit-a-trip-participant',
    'shared-items/how-to-add-a-shared-item',
    'shared-items/how-to-edit-a-shared-item',
    'shared-todos/how-to-add-a-shared-todo',
    'shared-todos/how-to-edit-a-shared-todo',
    'billing/how-to-upgrade-your-plan',
    'billing/how-to-downgrade-your-plan',
    'billing/how-to-open-the-customer-portal',
    'profile/billing-plan-and-subscription',
    'profile/scheduled-plan-change'
  )) {
    return 'These steps are for admin users. Participants can open some related pages in read-only mode, but they cannot complete the admin-only actions described here.';
  }

  if (startsWithPage(pageId, 'trip-items', 'trip-todos', 'bags/trip-bags')) {
    return 'These screens require a current trip. In the toolbar, the menu entries stay disabled until you select a trip, and Trip Items, Trip Todos, and Trip Bags also require you to be included in that trip.';
  }

  if (startsWithPage(pageId, 'shared-items', 'shared-todos', 'trip-participants', 'comments')) {
    return 'These screens require a current trip to be selected first. Shared-item and shared-todo creation is admin-only, while participants mainly review, accept, reject, or finish assigned work.';
  }

  if (startsWithPage(pageId, 'public/', 'getting-started/', 'access/')) {
    return 'These steps are available from the public side of Plantour, so you do not need to be signed in before you start.';
  }

  if (startsWithPage(pageId, 'profile/temporary-account-email', 'access/temporary-user/')) {
    return 'These steps are written for users who are already inside a temporary account and want to keep that data instead of starting over.';
  }

  return 'The steps below use the real Plantour menu labels, page titles, and screen actions so you can follow them without guessing.';
}

function getPreparationStep(spec: HelpPageSpec): HelpStep {
  const pageId = pathId(spec.path);

  if (startsWithPage(pageId, 'trip-items', 'trip-todos', 'bags/trip-bags', 'shared-items', 'shared-todos', 'trip-participants', 'comments')) {
    return {
      title: 'Confirm the current trip before editing anything',
      body: 'Check the selected trip in Trip, then Trips or in the trip name shown in the toolbar. The instructions on this page apply to that one current trip.'
    };
  }

  if (startsWithPage(pageId, 'access/participant-sign-in')) {
    return {
      title: 'Keep the Participant sign-in option selected',
      body: 'The participant form expects an Access Code, not an email address. If you see the email field instead, switch the selector back to Participant before continuing.'
    };
  }

  if (startsWithPage(pageId, 'access/admin-sign-in', 'access/social-sign-in')) {
    return {
      title: 'Keep the Admin sign-in option selected',
      body: 'The admin form shows the email field and the Google or Facebook buttons. If you only see the Access Code field, switch back to Admin first.'
    };
  }

  return {
    title: 'Check that you are on the expected screen',
    body: 'Compare the page title, menu path, and visible controls with the instructions below before you continue.'
  };
}

function getActionInstruction(spec: HelpPageSpec): string {
  const pageId = pathId(spec.path);

  if (matchesPage(pageId, 'trips/how-to-create-a-trip', 'tasks/create-your-first-trip')) {
    return 'Click + in the Trips header. Enter Name, Start date, and End date. Add Status or Notes if they help, then click Submit.';
  }

  if (matchesPage(pageId, 'trips/how-to-open-an-existing-trip', 'dashboard/how-to-choose-a-current-trip', 'trips/how-to-select-the-right-trip-before-working')) {
    return 'In Trips or Dashboard, select the trip you want to work on. Plantour stores that selection as the current trip, and the Trip menu starts opening trip-specific pages for that trip.';
  }

  if (matchesPage(pageId, 'trips/how-to-edit-a-trip')) {
    return 'Select the trip in the Trips list, open Edit, update the name, dates, status, or notes, then click Submit.';
  }

  if (matchesPage(pageId, 'trips/how-to-view-a-trip')) {
    return 'Select the trip and open View. Review the trip name, dates, status, and notes in the read-only form.';
  }

  if (matchesPage(pageId, 'trips/how-to-download-a-trip-pdf', 'reports/trip-pdf')) {
    return 'Select the trip in the Trips list, open the page menu, and choose Download Trip PDF. Plantour starts a browser download for the current trip report.';
  }

  if (matchesPage(pageId, 'travelers/how-to-add-a-traveler')) {
    return 'Click + in Travelers. Enter the traveler email and any available first name, last name, phone, or notes, then click Submit.';
  }

  if (matchesPage(pageId, 'travelers/how-to-edit-a-traveler')) {
    return 'Select the traveler, open Edit, update the saved details, then click Submit.';
  }

  if (matchesPage(pageId, 'travelers/how-to-view-a-traveler')) {
    return 'Select the traveler and open View to review the stored email, name, phone, and notes.';
  }

  if (matchesPage(pageId, 'items/how-to-add-an-item')) {
    return 'Click + in Items. Enter Name and, if useful, Category, Value, Units, and Notes, then click Submit.';
  }

  if (matchesPage(pageId, 'items/how-to-edit-an-item')) {
    return 'Select the item, open Edit, update the saved details, then click Submit.';
  }

  if (matchesPage(pageId, 'todos/how-to-add-a-todo')) {
    return 'Click + in Todos. Enter Name and, if useful, Category and Notes, then click Submit.';
  }

  if (matchesPage(pageId, 'todos/how-to-edit-a-todo')) {
    return 'Select the todo, open Edit, update the saved details, then click Submit.';
  }

  if (matchesPage(pageId, 'bags/how-to-add-a-bag')) {
    return 'Click + in Bags. Enter the bag name, add notes if useful, then click Submit.';
  }

  if (matchesPage(pageId, 'bags/how-to-edit-a-bag')) {
    return 'Select the bag, open Edit, update the name or notes, then click Submit.';
  }

  if (matchesPage(pageId, 'trip-participants/how-to-add-a-person-to-a-trip')) {
    return 'Click + in Trip participants. Choose a traveler from the Traveler selector, review the read-only contact details, adjust Packaging Complete, No-pack Weight, or Notes if needed, then click Submit.';
  }

  if (matchesPage(pageId, 'trip-participants/how-to-edit-a-trip-participant')) {
    return 'Select the participant, open Edit, update Packaging Complete, No-pack Weight, No-pack Unit, or Notes, then click Submit.';
  }

  if (matchesPage(pageId, 'trip-participants/how-to-view-a-trip-participant')) {
    return 'Select the participant and open View to review the traveler details and trip-specific packing information without changing them.';
  }

  if (matchesPage(pageId, 'trip-items/how-to-add-an-item-directly-to-a-trip')) {
    return 'Click + in Trip items. Type a new item name or choose an existing suggestion, then fill Category, Value, Units, Notes, and Bag if needed before you click Submit.';
  }

  if (matchesPage(pageId, 'trip-items/how-to-edit-a-trip-item')) {
    return 'Select the trip item, open Edit, update its details or assigned bag, then click Submit.';
  }

  if (matchesPage(pageId, 'trip-items/how-to-add-items-from-your-dictionary')) {
    return 'Click + in Trip items and start typing in the Name field. When Plantour shows a saved item from your dictionary, select it, review the copied details, then click Submit to add that item to the current trip.';
  }

  if (matchesPage(pageId, 'trip-items/how-to-read-item-status')) {
    return 'Look below each trip item row. The assignment-status text explains whether the item came from shared work and whether it is finished, and the bag text shows where the item is packed.';
  }

  if (matchesPage(pageId, 'trip-items/how-to-show-or-hide-assignment-details')) {
    return 'Open the Trip items page menu and use Show Assignments or Hide Assignments. On the same page you can also use Show Bags or Hide Bags when you want more or less packing detail on each row.';
  }

  if (matchesPage(pageId, 'shared-items/how-to-add-a-shared-item')) {
    return 'As an admin, click + in Trip shared items. Enter or choose the item name, complete any useful details, then click Submit. After saving, you can assign it from the list.';
  }

  if (matchesPage(pageId, 'shared-items/how-to-edit-a-shared-item')) {
    return 'Select the shared item, open Edit, update its details, then click Submit.';
  }

  if (matchesPage(pageId, 'shared-items/how-to-view-a-shared-item')) {
    return 'Select the shared item and open View to inspect its details without changing them.';
  }

  if (matchesPage(pageId, 'shared-items/how-to-assign-a-shared-item')) {
    return 'Stay on the Trip shared items list. On the right side of the row, use Select assignee to choose a trip participant. If the deadline control is visible above the list, set the number of days before assigning so Plantour records a deadline together with the assignment.';
  }

  if (matchesPage(pageId, 'shared-items/how-to-accept-an-item-assignment')) {
    return 'Find the shared item row assigned to you and tick Accepted. The row status changes to show that you accepted the assignment.';
  }

  if (matchesPage(pageId, 'shared-items/how-to-reject-an-item-assignment')) {
    return 'Find the shared item row assigned to you and tick Rejected. Plantour marks the assignment as rejected in the shared-items status text.';
  }

  if (matchesPage(pageId, 'shared-items/how-to-finish-an-item-assignment')) {
    return 'Open Trip, then Items. Accepted shared-item assignments appear there as trip items with assignment text. On the item row, use Finished success or Finished failure to record the outcome.';
  }

  if (matchesPage(pageId, 'shared-items/how-admins-track-shared-item-progress')) {
    return 'Use the Trip shared items page filters such as Assignment Status, Assignee Full Name, Category, or Trip participant. Keep the assignments section visible so the status text under each row stays readable.';
  }

  if (matchesPage(pageId, 'trip-todos/how-to-add-a-trip-todo')) {
    return 'Click + in Trip todos. Type a new todo name or choose an existing suggestion, add Category or Notes if useful, then click Submit.';
  }

  if (matchesPage(pageId, 'trip-todos/how-to-edit-a-trip-todo')) {
    return 'Select the trip todo, open Edit, update the saved details, then click Submit.';
  }

  if (matchesPage(pageId, 'trip-todos/how-to-add-todos-from-your-dictionary')) {
    return 'Click + in Trip todos and start typing in the Name field. Choose a saved todo suggestion from your dictionary, review the copied details, then click Submit.';
  }

  if (matchesPage(pageId, 'trip-todos/how-to-read-todo-status')) {
    return 'Read the text below each trip-todo row. It tells you whether the todo is not shared, assigned, accepted, not finished yet, or finished successfully or unsuccessfully.';
  }

  if (matchesPage(pageId, 'trip-todos/how-to-show-or-hide-assignment-details')) {
    return 'Open the Trip todos page menu and toggle Show Assignments or Hide Assignments. The row details below each todo update immediately.';
  }

  if (matchesPage(pageId, 'shared-todos/how-to-add-a-shared-todo')) {
    return 'As an admin, click + in Trip shared todos. Enter or choose the todo name, add Category or Notes if useful, then click Submit. After saving, you can assign it from the list.';
  }

  if (matchesPage(pageId, 'shared-todos/how-to-edit-a-shared-todo')) {
    return 'Select the shared todo, open Edit, update the saved details, then click Submit.';
  }

  if (matchesPage(pageId, 'shared-todos/how-to-view-a-shared-todo')) {
    return 'Select the shared todo and open View to inspect the data without changing it.';
  }

  if (matchesPage(pageId, 'shared-todos/how-to-assign-a-shared-todo')) {
    return 'Stay on the Trip shared todos list. On the right side of the row, use Select assignee to choose a trip participant. If the deadline control is visible above the list, set the number of days before assigning so Plantour also records a deadline.';
  }

  if (matchesPage(pageId, 'shared-todos/how-to-accept-a-todo-assignment')) {
    return 'Find the shared todo row assigned to you and tick Accepted. Plantour updates the shared-todo status text immediately.';
  }

  if (matchesPage(pageId, 'shared-todos/how-to-reject-a-todo-assignment')) {
    return 'Find the shared todo row assigned to you and tick Rejected. Plantour records the rejection on the shared-todo row.';
  }

  if (matchesPage(pageId, 'shared-todos/how-to-finish-a-todo-assignment')) {
    return 'Open Trip, then Todos. Accepted shared-todo assignments appear there as trip todos with assignment text. On the todo row, use Finished success or Finished failure to record the result.';
  }

  if (matchesPage(pageId, 'shared-todos/how-admins-track-shared-todo-progress')) {
    return 'Use the Trip shared todos page filters such as Assignment Status, Assignee Full Name, Category, or Trip participant. Keep the assignments section visible so the row statuses stay readable.';
  }

  if (matchesPage(pageId, 'bags/trip-bags/how-to-add-a-bag-to-a-trip')) {
    return 'Click + in Trip bags. Select a bag name from the saved list or type a new one, then add Label, Weight, Unit, Packing List Included, or Notes if needed before you click Submit.';
  }

  if (matchesPage(pageId, 'bags/trip-bags/how-to-edit-a-trip-bag')) {
    return 'Select the trip bag, open Edit, update its label, weight, packing-list inclusion, or notes, then click Submit.';
  }

  if (matchesPage(pageId, 'bags/trip-bags/how-to-add-a-bag-from-your-bags-list')) {
    return 'Click + in Trip bags and open the Name selector. Choose a saved bag from your personal Bags list, then click Submit so that saved bag becomes part of the current trip.';
  }

  if (matchesPage(pageId, 'bags/trip-bags/how-to-pack-items-into-bags', 'tasks/pack-items-into-bags')) {
    return 'Open Trip, then Items. If the bag dropdown is hidden, use the page menu to Show Bags. On the item row, use Select bag, or edit the item and choose the Bag field there.';
  }

  if (matchesPage(pageId, 'bags/trip-bags/how-to-see-what-is-not-packed-yet')) {
    return 'Open Trip, then Items and keep bag details visible. Any item row without a selected bag or without bag text still needs to be packed into a bag.';
  }

  if (matchesPage(pageId, 'bags/trip-bags/how-to-download-packing-lists', 'reports/packing-lists')) {
    return 'Select the trip bag on the Trip bags page, open the page menu, and choose Download Packing List PDF. Plantour starts a browser download for that bag list.';
  }

  if (matchesPage(pageId, 'templates/how-to-browse-your-templates')) {
    return 'Use the filters and target selector on Template items to narrow the list by Category, Activity, Template, Temperature Range, Age, or Name.';
  }

  if (matchesPage(pageId, 'templates/how-to-use-a-template', 'tasks/use-a-template')) {
    return 'Choose the target first, such as Items Dictionary, a trip Own list, or a trip Shared list. Then select the template items you want and use the action panel to add the selected entries to that target.';
  }

  if (matchesPage(pageId, 'ai/how-to-describe-your-trip', 'ai/how-to-get-item-suggestions', 'tasks/use-ai-recommendations')) {
    return 'Open AI prompts, choose one of the saved prompts or type the prompt you need, choose the target list, then click Ask AI.';
  }

  if (matchesPage(pageId, 'ai/how-to-review-ai-suggestions')) {
    return 'After Ask AI returns results, review the suggested names, categories, and details in the AI list before you add anything to a real target.';
  }

  if (matchesPage(pageId, 'ai/how-to-add-ai-items-to-your-items-dictionary', 'ai/how-to-add-ai-items-to-trip-own-items', 'ai/how-to-add-ai-items-to-trip-shared-items')) {
    return 'Choose the correct target first, generate the AI results, select the suggestions you want to keep, and use the action panel to add those selected items into the dictionary, trip own items, or trip shared items.';
  }

  if (matchesPage(pageId, 'ai/how-to-sort-filter-and-search-ai-results')) {
    return 'Use the available sort and filter controls on the AI results list before you decide which suggestions to keep.';
  }

  if (matchesPage(pageId, 'comments/how-to-add-a-trip-comment')) {
    return 'Type your message into the field with the placeholder Write a message..., then click Send.';
  }

  if (matchesPage(pageId, 'profile/personal-information')) {
    return 'Update Email, First Name, Last Name, or Phone on the Profile page, then click Update Profile.';
  }

  if (matchesPage(pageId, 'profile/social-login')) {
    return 'The current Profile screen does not show Google or Facebook link or unlink buttons. Use the Sign In page when you want to enter Plantour with Google or Facebook, and use Profile only for account details that are visible there now.';
  }

  if (matchesPage(pageId, 'profile/participant-code')) {
    return 'Open Profile and look in the summary panel. Admins can reveal the Participant code with the eye icon when that code is available for their account.';
  }

  if (matchesPage(pageId, 'profile/temporary-account-email', 'temporary-users/how-to-move-to-a-regular-account', 'access/temporary-user/how-to-keep-your-data')) {
    return 'While signed in to the temporary account, open Profile, replace the temporary email with your real email, and click Update Profile. If Plantour asks you to sign in again, use the new real email after sign-out.';
  }

  if (matchesPage(pageId, 'profile/billing-plan-and-subscription', 'billing/how-to-upgrade-your-plan', 'billing/how-to-downgrade-your-plan')) {
    return 'Open Profile and use Change Plan for plan selection. If you already have a paid account and need billing details, use Manage Billing to open the customer portal.';
  }

  if (matchesPage(pageId, 'profile/scheduled-plan-change', 'billing/when-a-downgrade-takes-effect')) {
    return 'Open Profile and look at the Scheduled downgrade row in the summary panel. If a downgrade is scheduled, Plantour shows the target plan and time, and the Cancel link is available there.';
  }

  if (matchesPage(pageId, 'billing/how-to-open-the-customer-portal')) {
    return 'Open Profile and click Manage Billing. Plantour creates a customer-portal session and redirects you to the billing portal.';
  }

  if (matchesPage(pageId, 'access/admin-sign-in/how-email-link-sign-in-works')) {
    return 'Keep Admin selected, enter your email, and click Sign In. Plantour sends a sign-in email with a time-limited link. Open that email and use the link before it expires.';
  }

  if (matchesPage(pageId, 'access/participant-sign-in/how-to-use-an-access-code')) {
    return 'Switch the Sign In page to Participant, enter the access code from your invitation email, and click Sign In.';
  }

  if (matchesPage(pageId, 'access/social-sign-in/google')) {
    return 'Keep Admin selected on the Sign In page and click Google. Complete the Google dialog, then let Plantour finish the sign-in flow.';
  }

  if (matchesPage(pageId, 'access/social-sign-in/facebook')) {
    return 'Keep Admin selected on the Sign In page and click Facebook. Complete the Facebook dialog, then return to Plantour.';
  }

  if (matchesPage(pageId, 'access/sign-out', 'temporary-users/what-happens-if-you-sign-out')) {
    return 'Open More Features and choose Sign Out. If you are in a temporary account, read the warning carefully before you confirm because you cannot re-enter that same temporary account later.';
  }

  if (matchesPage(pageId, 'getting-started/checkout/enter-your-email')) {
    return 'On Secure checkout, enter a valid email address in the email field and click Proceed. Plantour then loads the checkout frame for the selected plan.';
  }

  if (matchesPage(pageId, 'getting-started/checkout/what-happens-after-payment')) {
    return 'Complete the checkout flow in the embedded payment frame. When payment succeeds, Plantour finishes the upgrade flow and returns you to the app state for your account.';
  }

  if (matchesPage(pageId, 'public/packing-list-generator/how-to-browse-templates')) {
    return 'Scroll the template rows, read the template name, activity, age, temperature, and tags, then click a row labeled View when you want to open one template in detail.';
  }

  if (matchesPage(pageId, 'public/packing-list-generator/how-to-search-and-filter')) {
    return 'Use the left filter selector to choose Search, Activity, Age, Temperature, or another filter key. Then use the search box or value selector on the right and click Clear when you want to reset everything.';
  }

  if (matchesPage(pageId, 'public/packing-list-generator/template-details')) {
    return 'Open a template row, review the Activity, Age, and Temperature line at the top, then read the grouped item categories underneath. Use the Search or category filter on the detail page when you want to narrow the list.';
  }

  if (matchesPage(pageId, 'public/packing-list-generator/how-to-start-from-a-public-template')) {
    return 'Public templates are browse-only while you stay signed out. When you decide the template is useful, click Try no account needed to continue with guest access or Create an account to continue with a regular account.';
  }

  if (matchesPage(pageId, 'dashboard/trip-info', 'dashboard/user-trip-info', 'dashboard/all-users-trip-info', 'dashboard/how-to-use-the-dashboard-to-decide-what-to-do-next')) {
    return 'Use the trip selector at the top of Dashboard, then expand the card named Trip info, User Trip info, or All Users Trip info. Read the counts and status blocks there before choosing your next page.';
  }

  return 'Use the main action on the screen that matches this page title, then save or confirm the change before you move away.';
}

function getResultParagraphs(spec: HelpPageSpec): string[] {
  const pageId = pathId(spec.path);

  if (matchesPage(pageId, 'trips/how-to-create-a-trip', 'tasks/create-your-first-trip')) {
    return [
      'You end with a new trip in the Trips list.',
      'Once that trip is selected as the current trip, the Trip menu can open Participants, Items, Todos, Bags, Shared items, Shared todos, and Comments for that specific trip.'
    ];
  }

  if (matchesPage(pageId, 'trips/how-to-open-an-existing-trip', 'dashboard/how-to-choose-a-current-trip', 'trips/how-to-select-the-right-trip-before-working')) {
    return [
      'You end with the correct current trip selected.',
      'That selection controls which trip the Trip menu pages work with, so later edits happen in the intended trip instead of the wrong one.'
    ];
  }

  if (matchesPage(pageId, 'trips/how-to-download-a-trip-pdf', 'reports/trip-pdf')) {
    return [
      'Your browser downloads the current trip report as a PDF file.',
      'You can keep that file for review, printing, or sharing outside the app.'
    ];
  }

  if (startsWithPage(pageId, 'travelers/how-to-add', 'travelers/how-to-edit', 'travelers/how-to-view')) {
    return [
      'The traveler record is saved or reviewed in the Travelers list.',
      'Admins can later add that traveler to a specific trip from Trip participants.'
    ];
  }

  if (startsWithPage(pageId, 'items/how-to-add', 'items/how-to-edit')) {
    return [
      'The saved item appears in your Items dictionary.',
      'You can reuse it later when you create trip items or when template and AI workflows need a dictionary target.'
    ];
  }

  if (startsWithPage(pageId, 'todos/how-to-add', 'todos/how-to-edit')) {
    return [
      'The saved todo appears in your Todos dictionary.',
      'You can reuse it later when you add todos to a real trip.'
    ];
  }

  if (startsWithPage(pageId, 'bags/how-to-add', 'bags/how-to-edit')) {
    return [
      'The bag stays in your personal Bags list.',
      'You can reuse that saved bag later when you add bags to a trip.'
    ];
  }

  if (startsWithPage(pageId, 'trip-participants/')) {
    return [
      'The participant list for the current trip is updated or confirmed.',
      'That traveler can now appear in assignment, coordination, and packing workflows for this trip.'
    ];
  }

  if (startsWithPage(pageId, 'trip-items/')) {
    return [
      'The current trip now contains the item or updated item state you worked on.',
      'That item can be packed into bags, tracked through assignment status, and included in trip packing workflows.'
    ];
  }

  if (startsWithPage(pageId, 'trip-todos/')) {
    return [
      'The current trip now contains the todo or updated todo state you worked on.',
      'That todo can be tracked through its assignment and finish status inside the trip.'
    ];
  }

  if (startsWithPage(pageId, 'shared-items/')) {
    return [
      'The shared-item row for the current trip now reflects the new assignment, response, or progress state.',
      'Participants later finish accepted shared-item work from Trip Items, while admins keep tracking progress from Trip shared items.'
    ];
  }

  if (startsWithPage(pageId, 'shared-todos/')) {
    return [
      'The shared-todo row for the current trip now reflects the new assignment, response, or progress state.',
      'Participants later finish accepted shared-todo work from Trip Todos, while admins keep tracking progress from Trip shared todos.'
    ];
  }

  if (startsWithPage(pageId, 'bags/trip-bags/')) {
    return [
      'The current trip now contains the bag setup you worked on.',
      'That bag can hold packed items and can be exported as a packing-list PDF when needed.'
    ];
  }

  if (matchesPage(pageId, 'templates/how-to-use-a-template', 'tasks/use-a-template')) {
    return [
      'Selected template items are copied into the target you chose.',
      'That lets you turn a reusable template into real trip data or real dictionary data without typing every line again.'
    ];
  }

  if (startsWithPage(pageId, 'ai/')) {
    return [
      'You end with AI suggestions that are either reviewed in place or added into the target you selected.',
      'The suggestions only become real working data after you add them to the dictionary or to a trip target.'
    ];
  }

  if (startsWithPage(pageId, 'comments/')) {
    return [
      'Your comment appears in the Trip comments list for the current trip.',
      'That gives the trip team a shared place to see coordination notes in context.'
    ];
  }

  if (startsWithPage(pageId, 'profile/')) {
    return [
      'Your Profile page now reflects the saved account details or billing state you checked.',
      'For temporary-account email replacement, Plantour can ask you to sign in again with the real email after the account is updated.'
    ];
  }

  if (startsWithPage(pageId, 'billing/')) {
    return [
      'You end in the correct plan-management or billing flow for the current account.',
      'Plan changes are handled from Profile, and billing-portal actions continue outside the main app screen.'
    ];
  }

  if (startsWithPage(pageId, 'access/', 'getting-started/checkout')) {
    return [
      'You either complete the sign-in or checkout step successfully, or you know exactly which screen and which input to check next.',
      'That removes guesswork from the first-entry flow into Plantour.'
    ];
  }

  if (startsWithPage(pageId, 'public/packing-list-generator/')) {
    return [
      'You finish with a clearer template choice and a better idea of whether you should continue with guest access or a regular account.',
      'Public templates help you inspect the content first, but real trip work starts after you move into the signed-in or guest-access app flow.'
    ];
  }

  if (startsWithPage(pageId, 'dashboard/')) {
    return [
      'You finish with a clearer understanding of the selected trip status on Dashboard.',
      'That makes it easier to decide whether to open Trips, Participants, Items, Todos, Bags, or Shared work next.'
    ];
  }

  return [
    'You should end on the correct Plantour screen with the action completed or clearly verified.',
    'If the result still looks wrong, return to the previous step and compare the current page title, current trip, and selected record before trying again.'
  ];
}

function buildTaskContent(spec: HelpPageSpec): GeneratedTaskContent {
  return {
    description: [
      `Use this page when you want to ${humanAction(spec.title)} without guessing which menu or action to use.`,
      getAccessGuidance(spec)
    ],
    steps: [
      {
        title: 'Open the correct page',
        body: getExactOpenInstruction(spec)
      },
      getPreparationStep(spec),
      {
        title: 'Use the real screen action',
        body: getActionInstruction(spec)
      },
      {
        title: 'Check the saved result before you leave the page',
        body: 'Look for the updated row, changed status text, selected trip, or started download before you move on to another screen.'
      }
    ],
    result: getResultParagraphs(spec)
  };
}

function normalizeTaskBlocks(spec: HelpPageSpec, blocks: HelpBlock[]): HelpBlock[] {
  const normalized = blocks.map((block, index) => {
    if (index === 0 && block.kind === 'paragraphs' && !block.title) {
      return {
        ...block,
        title: 'Short description'
      };
    }

    if (block.kind === 'steps' && block.title === 'Step by step') {
      return {
        ...block,
        title: 'Detailed steps'
      };
    }

    return block;
  });

  const hasResultBlock = normalized.some((block) => block.kind === 'paragraphs' && block.title === 'Result');
  if (hasResultBlock) {
    return normalized;
  }

  return [
    ...normalized,
    {
      kind: 'paragraphs',
      id: 'task-result',
      title: 'Result',
      paragraphs: getResultParagraphs(spec)
    }
  ];
}

function buildOverviewBlocks(spec: HelpPageSpec): HelpBlock[] {
  const context = getSectionContext(spec);
  const children = (childSpecMap.get(pathId(spec.path)) ?? []).slice(0, 8);

  return [
    {
      kind: 'paragraphs',
      id: 'overview-intro',
      title: `Main tasks on the ${context.name} pages`,
      paragraphs: [
        `This section covers ${context.name} using the real Plantour screens that exist today.`,
        `${context.openingHint} Once you are there, choose the page that matches the job you actually need to finish.`
      ]
    },
    {
      kind: 'steps',
      id: 'overview-open-pages',
      title: `How to work with the ${context.name} pages`,
      steps: [
        {
          title: 'Open the correct menu or page',
          body: getExactOpenInstruction(spec)
        },
        {
          title: context.tripBased ? 'Check the current trip first' : 'Choose the matching detail page',
          body: context.tripBased
            ? 'If these instructions belong to one trip, confirm the current trip before you continue. That avoids reading or editing the wrong trip.'
            : 'Start with the child page that matches your real question, such as adding, editing, viewing, or downloading.'
        },
        {
          title: 'Follow one page at a time',
          body: 'Use a single help page until you see the expected result on screen, then move to the next task only if you still need it.'
        }
      ]
    },
    {
      kind: 'list',
      id: 'overview-topics',
      title: 'Pages in this section',
      intro: 'Open the page that matches the exact action or question you have.',
      items: children.length > 0
        ? children.map((child) => ({ text: child.title, pageId: pathId(child.path) }))
        : [{ text: 'More detailed pages for this section are being connected here.' }]
    },
    {
      kind: 'paragraphs',
      id: 'overview-result',
      title: 'Result',
      paragraphs: [
        `You should leave this section knowing which ${context.name} page to open next and which visible screen action to use there.`,
        'That is the main goal of these help pages: less guessing and faster progress on the real app screen.'
      ]
    }
  ];
}

function buildTaskBlocks(spec: HelpPageSpec): HelpBlock[] {
  const content = buildTaskContent(spec);

  return [
    {
      kind: 'paragraphs',
      id: 'task-description',
      title: 'Short description',
      paragraphs: content.description
    },
    {
      kind: 'steps',
      id: 'task-steps',
      title: 'Detailed steps',
      steps: content.steps
    },
    {
      kind: 'paragraphs',
      id: 'task-result',
      title: 'Result',
      paragraphs: content.result
    }
  ];
}

function buildTroubleshootingBlocks(spec: HelpPageSpec): HelpBlock[] {
  const context = getSectionContext(spec);

  return [
    {
      kind: 'paragraphs',
      id: 'problem-intro',
      title: 'What this problem usually means',
      paragraphs: [
        `Use this page when ${humanAction(spec.title)} and you want to check the most likely causes in a sensible order.`,
        'Most Plantour problems become clearer once you confirm the right page, the right current trip, and the right input before you retry the action.'
      ]
    },
    {
      kind: 'steps',
      id: 'problem-checks',
      title: 'Detailed checks',
      steps: [
        {
          title: 'Confirm where you are',
          body: `${context.openingHint} Then compare the current page title and the action you are trying to perform.`
        },
        {
          title: 'Check the information you entered',
          body: 'Look carefully at email addresses, access codes, selected plans, selected trips, and the item or person you are working with. Small differences often explain the problem.'
        },
        {
          title: 'Try the action once more',
          body: 'Repeat the action slowly after checking the page and your details. If the result changes, that usually means the issue came from the earlier setup and not from Plantour itself.'
        },
        {
          title: 'Move to a related help page if needed',
          body: 'If the problem is really about a specific task, open the matching task page from the sidebar and compare the steps with what you did on screen.'
        }
      ]
    },
    {
      kind: 'paragraphs',
      id: 'problem-result',
      title: 'Result',
      paragraphs: [
        'After these checks, you should either complete the action successfully or narrow the problem down to one exact screen, one exact input, or one exact permission issue.',
        'That is enough to continue with the matching task page instead of guessing across the whole app.'
      ]
    }
  ];
}

function buildRoleBlocks(spec: HelpPageSpec): HelpBlock[] {
  const context = getSectionContext(spec);

  return [
    {
      kind: 'paragraphs',
      id: 'role-intro',
      title: 'Short description',
      paragraphs: [
        `${spec.title} is limited to the parts of Plantour that this role can actually use today.`,
        `${context.openingHint} Then focus on the pages that match your real permissions and responsibilities.`
      ]
    },
    {
      kind: 'steps',
      id: 'role-focus',
      title: 'Detailed steps',
      steps: [
        {
          title: 'Start from the pages your role can reach',
          body: 'Do not rely on help pages for actions your role cannot perform. For example, admins create and manage trips, while participants mainly work inside trips they already belong to.'
        },
        {
          title: 'Use the current trip as your anchor',
          body: 'When your role works inside a trip, confirm the current trip first. That keeps participant work, shared work, and packing actions aligned with the right trip.'
        },
        {
          title: 'Open the matching task page when you need exact clicks',
          body: 'This role page is only the overview. Use the linked task pages when you need exact menu paths, buttons, and result checks.'
        }
      ]
    },
    {
      kind: 'paragraphs',
      id: 'role-result',
      title: 'Result',
      paragraphs: [
        'You should end with a smaller, more accurate set of Plantour pages to use for your role.',
        'That keeps the help practical instead of sending you to screens or actions your role does not control.'
      ]
    }
  ];
}

function buildKeywords(spec: HelpPageSpec): string[] {
  const titleWords = spec.title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);

  return Array.from(new Set([
    ...spec.path,
    ...titleWords,
    ...(spec.keywords ?? []),
    'plantour',
    'help'
  ]));
}

function buildPage(spec: HelpPageSpec): HelpPage {
  let summary = buildTaskSummary(spec);
  let blocks = buildTaskBlocks(spec);

  if (spec.kind === 'overview') {
    summary = buildOverviewSummary(spec);
    blocks = buildOverviewBlocks(spec);
  }

  if (spec.kind === 'troubleshooting') {
    summary = buildTroubleshootingSummary(spec);
    blocks = buildTroubleshootingBlocks(spec);
  }

  if (spec.kind === 'role') {
    summary = buildRoleSummary(spec);
    blocks = buildRoleBlocks(spec);
  }

  const customPage = getCustomPage(spec);
  const rawBlocks = customPage?.blocks ?? blocks;
  const finalBlocks = spec.kind === 'task' ? normalizeTaskBlocks(spec, rawBlocks) : rawBlocks;

  return {
    id: pathId(spec.path),
    path: spec.path,
    title: spec.title,
    summary: customPage?.summary ?? summary,
    description: customPage?.description ?? buildDescription(spec),
    parentId: pathId(spec.parentPath),
    keywords: customPage?.keywords ?? buildKeywords(spec),
    relatedPageIds: customPage?.relatedPageIds ?? (spec.parentPath ? [pathId(spec.parentPath)] : [HELP_HOME_PAGE_ID]),
    blocks: finalBlocks,
  };
}

const staticPages: HelpPage[] = [
  {
    id: HELP_HOME_PAGE_ID,
    path: [],
    title: 'Plantour Help',
    summary: 'Find clear, step-by-step help for planning trips, packing, sharing work, templates, AI suggestions, billing, and guest access.',
    description: 'Plantour Help offers friendly, non-technical guidance with search, breadcrumbs, section links, and short pages for each question.',
    keywords: ['help', 'plantour help', 'start', 'search', 'guide', 'support', 'mobile help'],
    relatedPageIds: ['welcome-to-plantour', 'choose-how-to-start', 'roles-and-access'],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'home-intro',
        paragraphs: [
          'This Help section is made for quick answers. Each page focuses on one question, so you can get help without reading a long manual from start to finish.',
          'Use search when you know what you want to do. If you are new to Plantour, start with Welcome to Plantour, then choose a path that matches your role or your next task.'
        ]
      },
      {
        kind: 'cards',
        id: 'home-start-here',
        title: 'Good places to begin',
        intro: 'Pick the page that fits your situation right now.',
        cards: [
          {
            title: 'Welcome to Plantour',
            body: 'See what Plantour does and learn the easiest first steps.',
            link: { pageId: 'welcome-to-plantour' }
          },
          {
            title: 'Start with the Las Vegas demo trip',
            body: 'Use the temporary-account path with seeded sample data so you can test the real workflow immediately.',
            link: { pageId: 'public/guest-access/start-guest-access-and-open-the-las-vegas-demo-trip' }
          },
          {
            title: 'Choose the best way to start',
            body: 'Decide whether to begin with guest access, sign in, or public templates.',
            link: { pageId: 'choose-how-to-start' }
          },
          {
            title: 'First five minutes for temporary users',
            body: 'Follow the shortest guided sequence to open Weekend in Las Vegas and add the first item.',
            link: { pageId: 'temporary-users/first-five-minutes' }
          },
          {
            title: 'Public templates before sign-in',
            body: 'Explore template quality and decide when to switch from browsing to guest access.',
            link: { pageId: 'public/packing-list-generator/choose-between-public-templates-and-guest-access' }
          }
        ]
      },
      {
        kind: 'callout',
        id: 'home-note',
        tone: 'info',
        title: 'Made for small screens too',
        body: 'Plantour is mobile first, and these Help pages follow the same idea. Use the page tools only when you need them, then collapse them to keep more room for the instructions.'
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
    relatedPageIds: [HELP_HOME_PAGE_ID, 'choose-how-to-start', 'roles-and-access'],
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
      }
    ]
  }
];

export const HELP_PAGES: HelpPage[] = [
  ...staticPages,
  ...HELP_PAGE_SPECS.map(buildPage)
];