import { HelpBlock, HelpPage } from './help.models';

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
  openArea: string;
  tripBased?: boolean;
}

const SECTION_CONTEXT: Record<string, SectionContext> = {
  public: {
    name: 'public pages',
    openArea: 'Start on the public Plantour pages. You do not need to sign in to use these pages.'
  },
  access: {
    name: 'sign in and account access',
    openArea: 'Open the sign-in area and choose the option that matches how you want to enter Plantour.'
  },
  'getting-started': {
    name: 'landing, plans, and checkout',
    openArea: 'Begin from the Plantour landing page or the plan area, then choose the option that matches what you want to do next.'
  },
  dashboard: {
    name: 'dashboard',
    openArea: 'Open the Dashboard first. It is the easiest place to see the current trip and decide what to work on next.',
    tripBased: true
  },
  profile: {
    name: 'profile',
    openArea: 'Open your profile from the main menu before changing account, login, or plan details.'
  },
  trips: {
    name: 'trips',
    openArea: 'Open the Trips area from the main Trip menu.',
    tripBased: true
  },
  travelers: {
    name: 'travelers',
    openArea: 'Open the Travelers area from the Dictionary menu.'
  },
  'trip-participants': {
    name: 'trip participants',
    openArea: 'Open the current trip first, then go to the Participants area for that trip.',
    tripBased: true
  },
  items: {
    name: 'items dictionary',
    openArea: 'Open the Items area from the Dictionary menu.'
  },
  'trip-items': {
    name: 'trip own items',
    openArea: 'Open the current trip, then go to the trip Items area.',
    tripBased: true
  },
  'shared-items': {
    name: 'shared trip items',
    openArea: 'Open the current trip, then go to Shared items.',
    tripBased: true
  },
  todos: {
    name: 'to-do dictionary',
    openArea: 'Open the Todos area from the Dictionary menu.'
  },
  'trip-todos': {
    name: 'trip own to-dos',
    openArea: 'Open the current trip, then go to the trip Todos area.',
    tripBased: true
  },
  'shared-todos': {
    name: 'shared trip to-dos',
    openArea: 'Open the current trip, then go to Shared todos.',
    tripBased: true
  },
  bags: {
    name: 'bags and packing',
    openArea: 'Open the Bags area or the trip Bags area, depending on whether you want saved bags or trip bags.',
    tripBased: true
  },
  templates: {
    name: 'templates',
    openArea: 'Open the Templates area when you want to reuse a ready-made starting point.'
  },
  ai: {
    name: 'AI recommendations',
    openArea: 'Open the AI prompts area when you want Plantour to suggest items for a trip.',
    tripBased: true
  },
  comments: {
    name: 'comments and coordination',
    openArea: 'Open the current trip, then go to Comments.',
    tripBased: true
  },
  reports: {
    name: 'reports and downloads',
    openArea: 'Open the trip area you are working in, then use the download action that matches the document you need.',
    tripBased: true
  },
  billing: {
    name: 'billing and plan changes',
    openArea: 'Open your plan or profile area before changing billing-related settings.'
  },
  'temporary-users': {
    name: 'temporary user access',
    openArea: 'Begin from guest access or from your profile if you are already using a temporary account.'
  },
  'by-role': {
    name: 'role-based help',
    openArea: 'Choose the page that matches your role so the steps fit the way you use Plantour.'
  },
  tasks: {
    name: 'task-based guides',
    openArea: 'Use these pages when you know the result you want, but you are not sure which screen to start from.',
    tripBased: true
  },
  'common-problems': {
    name: 'common problems',
    openArea: 'Open the page that matches the problem you are seeing, then follow the checks in order.'
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
  task(['tasks', 'very-simple-first-steps'], 'Very simple first steps', ['tasks'], ['trip', 'items', 'bags', 'packing', 'pdf packing list', 'first steps']),
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
    name: 'this Plantour area',
    openArea: 'Open the matching Plantour page, then follow the steps below one by one.'
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
          'If conversion matters, the first minute matters even more. Plantour should feel easy before it feels deep. This page helps a new visitor choose the shortest path to a useful first success.',
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
            body: 'Use the landing-page button labeled Try packing your items for the trip. Plantour creates a temporary account and opens seeded data so you can test the real workflow immediately.',
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
            title: 'Choose guest access if you want the fastest proof',
            body: 'Guest access is best when the goal is to feel the product quickly. It gives you a temporary account and a ready-made active trip called Weekend in Las Vegas so you can test real actions immediately.'
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
          'The public side of Plantour has one job: help a new visitor reach a useful first impression fast. That means showing real value before asking for commitment.',
          'There are two high-conversion entry paths here. One is public templates for browsing. The other is guest access for hands-on testing with ready-made sample trips.'
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
        title: 'Conversion improves when the first success is real',
        body: 'A visitor should be able to do one meaningful action quickly, such as opening the Weekend in Las Vegas trip and adding a first item. That is more convincing than reading long explanations.'
      }
    ]
  };
}

function buildGuestAccessOverviewPage(): Partial<HelpPage> {
  return {
    summary: 'Guest access is the fastest path from curiosity to a real in-app success, with a temporary account and seeded demo trips.',
    relatedPageIds: ['choose-how-to-start', 'temporary-users', 'public/guest-access/start-guest-access-and-open-the-las-vegas-demo-trip'],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'guest-access-intro',
        paragraphs: [
          'Guest access should remove hesitation. Instead of asking a public visitor to set everything up from scratch, Plantour can place them into a temporary account with sample trips and sample items already prepared.',
          'That makes the next step obvious: open the seeded trip, try one action, and decide whether Plantour feels useful.'
        ]
      },
      {
        kind: 'cards',
        id: 'guest-access-paths',
        title: 'Best pages for the first session',
        cards: [
          {
            title: 'Start guest access and open the demo trip',
            body: 'Follow the exact public-to-demo path using the landing-page CTA and the seeded Weekend in Las Vegas trip.',
            link: { pageId: 'public/guest-access/start-guest-access-and-open-the-las-vegas-demo-trip' }
          },
          {
            title: 'First five minutes as a temporary user',
            body: 'Use a short guided checklist after the account opens so the visitor reaches one or two small wins quickly.',
            link: { pageId: 'temporary-users/first-five-minutes' }
          },
          {
            title: 'Keep your data later',
            body: 'When the visitor is ready to stay, move the temporary account toward a regular account without losing the work they created.',
            link: { pageId: 'access/temporary-user/how-to-keep-your-data' }
          }
        ]
      },
      {
        kind: 'list',
        id: 'guest-access-seeded-data',
        title: 'What the temporary account already includes',
        items: [
          { text: 'An active trip named Weekend in Las Vegas so the visitor can test current-trip actions immediately.' },
          { text: 'A past trip named Week in Europe so the visitor can compare a finished trip with an active one.' },
          { text: 'Ready-made bags labeled Bag 1 and Bag 2 and sample items such as Passport, Cash, Hotel Reservation, Sunscreen, and Phone Charger.' }
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
          'Public templates and guest access serve different jobs. Templates answer Is the content useful? Guest access answers Does the workflow feel easy and real?',
          'Both paths matter for conversion, but they should not be confused. This page helps a visitor choose the right next click.'
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
            body: 'If you already trust the value and want saved data, sharing, or a long-term setup, create an account instead of spending too long in trial mode.'
          }
        ]
      }
    ]
  };
}

function buildStartGuestAccessDemoTripPage(): Partial<HelpPage> {
  return {
    summary: 'Use the landing-page guest CTA, open Weekend in Las Vegas, then add an item through Trip to Items so a new visitor reaches a real success fast.',
    description: 'Highly specific first-step guidance for public visitors: start guest access, open the seeded Las Vegas trip, and add a first trip item.',
    relatedPageIds: ['choose-how-to-start', 'public/guest-access', 'temporary-users/first-five-minutes'],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'guest-demo-intro',
        paragraphs: [
          'This is the most important conversion path for a public visitor who wants to feel Plantour quickly. The goal is not to explain every feature. The goal is to produce one small, convincing success in the real app.',
          'The fastest success path is: start guest access, open the seeded Weekend in Las Vegas trip, then add a first item to that trip.'
        ]
      },
      {
        kind: 'steps',
        id: 'guest-demo-steps',
        title: 'Exact first steps',
        steps: [
          {
            title: 'Start from the public landing page',
            body: 'On the landing page, click the button labeled Try packing your items for the trip. This is the public CTA that starts guest access without asking for a normal account first.'
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
            body: 'In the trips list, select Weekend in Las Vegas. This is the seeded active trip intended for a first walkthrough and live testing.'
          },
          {
            title: 'Go to Trip, then Items',
            body: 'Use the same toolbar Trip menu again and choose Items. This opens the trip items screen for the currently selected trip.'
          },
          {
            title: 'Click the plus button and add one simple item',
            body: 'Click + and create one easy test item, such as Sunglasses, Toothbrush, or Wallet. Save it, then confirm it appears in the trip items list. That is the first real success moment.'
          }
        ]
      },
      {
        kind: 'list',
        id: 'guest-demo-what-you-see',
        title: 'What the visitor should already see',
        intro: 'The seeded account is designed to remove blank-screen friction.',
        items: [
          { text: 'A current active trip named Weekend in Las Vegas.' },
          { text: 'A past example trip named Week in Europe for comparison.' },
          { text: 'Sample bags labeled Bag 1 and Bag 2.' },
          { text: 'Example items such as Passport, Cash, Hotel Reservation, Sunscreen, and Phone Charger.' }
        ]
      },
      {
        kind: 'callout',
        id: 'guest-demo-tip',
        tone: 'tip',
        title: 'Do not ask the visitor to do too much first',
        body: 'For the first session, one added item is enough. After that, suggest Bags, Todos, or public templates only if the visitor wants to keep exploring.'
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
          'Temporary access is not only a fallback sign-in method. It is a conversion tool. The experience should help a new user understand Plantour without forcing early commitment.',
          'That means the temporary account should feel alive from the first screen, with ready-made trips, ready-made items, and one obvious next action.'
        ]
      },
      {
        kind: 'cards',
        id: 'temporary-overview-cards',
        title: 'Best pages for temporary users',
        cards: [
          {
            title: 'Your first five minutes',
            body: 'Follow a short sequence that proves the app is useful before asking the user to learn more.',
            link: { pageId: 'temporary-users/first-five-minutes' }
          },
          {
            title: 'Start from the public landing page',
            body: 'See the exact CTA and seeded trip that make the first session feel easy and guided.',
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
    summary: 'A high-conversion checklist for the first five minutes: confirm the temporary account, open Weekend in Las Vegas, add one item, then inspect bags and the finished Europe sample.',
    description: 'Specific first-session instructions for temporary users, using the seeded demo account and exact menu labels from Plantour.',
    relatedPageIds: ['temporary-users', 'public/guest-access/start-guest-access-and-open-the-las-vegas-demo-trip', 'trip-items/how-to-add-an-item-directly-to-a-trip'],
    blocks: [
      {
        kind: 'paragraphs',
        id: 'temporary-first-five-intro',
        paragraphs: [
          'A new temporary user should not have to invent the first task. The product should give them a guided path to one or two visible wins.',
          'This page is the best short walkthrough for that first session. It uses the exact seeded data in the temporary account so every step matches what the user sees on screen.'
        ]
      },
      {
        kind: 'steps',
        id: 'temporary-first-five-steps',
        title: 'First five minutes checklist',
        steps: [
          {
            title: 'Notice that you are already inside a temporary account',
            body: 'Plantour creates a temporary identity for you automatically. The generated email can look like Robin.Miles followed by numbers. That is normal for demo access.'
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
            body: 'This is the fastest route to a real success. Add one simple item, save it, and make sure it appears in the list with the other trip items.'
          },
          {
            title: 'Open Trip, then Bags, and inspect Bag 1 and Bag 2',
            body: 'This shows how Plantour connects items with packing containers. Even without editing anything yet, the visitor can understand that packing is more than a flat checklist.'
          },
          {
            title: 'Go back to Trips and open Week in Europe',
            body: 'This past trip helps the visitor compare an already-finished example with the active Las Vegas trip. It proves that Plantour can show both planning in progress and finished results.'
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
            body: 'Review the value of the temporary account and which parts of Plantour can already be tested.',
            link: { pageId: 'public/guest-access/what-guest-access-includes' }
          },
          {
            title: 'Keep your work later',
            body: 'When the visitor is convinced, move toward a regular account without losing the trial work they created.',
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
          'This is the shortest useful walkthrough in Plantour. It is designed for the first session, when the user only needs one clear path and one clear result.',
          'Follow this exact sequence: Trip, then Items, then Bags, then packing progress, then the PDF packing list. Do not try to learn the full app first.'
        ]
      },
      {
        kind: 'steps',
        id: 'simple-first-steps-sequence',
        title: 'Trip to PDF in five simple steps',
        steps: [
          {
            title: 'Open Trip, then Trips, and choose the trip you will work on',
            body: 'Use the toolbar button named Trip with the compass icon. Choose Trips and open the trip you want to test. If you are in guest access, Weekend in Las Vegas is the easiest starting point.'
          },
          {
            title: 'Open Trip, then Items, then click + to add one item',
            body: 'Create one simple item such as Sunglasses, Toothbrush, or Charger. Save it and confirm it appears in the trip items list.'
          },
          {
            title: 'Open Trip, then Bags, and make sure you have a bag to use',
            body: 'If a bag already exists, open it. In guest access you should already see Bag 1 and Bag 2. If needed, add a new bag before continuing.'
          },
          {
            title: 'Pack the item into a bag and check the packing status',
            body: 'Move or assign the item into the bag, then verify the packing state changes the way you expect. This is the moment where the list becomes a packing workflow instead of just text.'
          },
          {
            title: 'Download the PDF packing list',
            body: 'Stay in the trip Bags area and use the download action for the packing list PDF. That gives you a real end result from the same short walkthrough.'
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
    case 'tasks/very-simple-first-steps':
      return buildVerySimpleFirstStepsPage();
    default:
      return null;
  }
}

function buildOverviewBlocks(spec: HelpPageSpec): HelpBlock[] {
  const context = getSectionContext(spec);
  const children = (childSpecMap.get(pathId(spec.path)) ?? []).slice(0, 8);

  return [
    {
      kind: 'paragraphs',
      id: 'overview-intro',
      paragraphs: [
        `This section is about ${context.name}. If you feel unsure where to begin, that is normal. The goal here is to help you complete one small task at a time instead of trying to learn everything at once.`,
        `${context.openArea} Once you are there, pick the page that matches the question you have right now.`
      ]
    },
    {
      kind: 'list',
      id: 'overview-topics',
      title: 'Topics in this section',
      intro: 'These are the main questions this section helps answer.',
      items: children.length > 0
        ? children.map((child) => ({ text: child.title, pageId: pathId(child.path) }))
        : [{ text: 'More detailed pages for this section are being connected here.' }]
    },
    {
      kind: 'steps',
      id: 'overview-how-to-use',
      title: 'A simple way to use this section',
      steps: [
        {
          title: 'Choose one question',
          body: 'Do not try to solve everything at once. Pick the one result you want, such as adding something, editing something, or understanding a status.'
        },
        {
          title: 'Open the matching detail page',
          body: 'Use the links in this section, the page search, or a contextual Help menu from the main app screen you are on.'
        },
        {
          title: 'Follow the steps slowly',
          body: 'Work through the instructions one step at a time. If something looks different on your screen, stop and compare the page title and current trip first.'
        }
      ]
    },
    {
      kind: 'callout',
      id: 'overview-tip',
      tone: 'tip',
      title: 'Small steps are enough',
      body: 'Plantour works best when you build the trip little by little. Add one useful thing, check it, then move to the next task.'
    }
  ];
}

function buildTaskBlocks(spec: HelpPageSpec): HelpBlock[] {
  const context = getSectionContext(spec);
  const action = humanAction(spec.title);
  const needsTripCheck = context.tripBased && !action.includes('guest access') && !action.includes('temporary');

  return [
    {
      kind: 'paragraphs',
      id: 'task-intro',
      paragraphs: [
        `This page helps you ${action}. If you are new to Plantour, take your time. You do not need to know every screen before you begin this task.`,
        'The easiest way is to move in order and check the result after each step. That keeps mistakes small and easy to fix.'
      ]
    },
    {
      kind: 'steps',
      id: 'task-steps',
      title: 'Step by step',
      steps: [
        {
          title: 'Open the right place',
          body: context.openArea
        },
        {
          title: needsTripCheck ? 'Make sure the right trip is selected' : 'Check that you are on the right page',
          body: needsTripCheck
            ? 'Before you continue, look at the current trip name and confirm it matches the trip you want to work on. This avoids changing the wrong trip by mistake.'
            : 'Look at the page title and the main menu path before continuing. A quick check now saves time later.'
        },
        {
          title: 'Use the main action on the screen',
          body: 'Choose the Add, Update, View, Open, Start, Accept, Reject, or Download action that matches your goal. If you see a three-dot menu, open it and choose Help if you need to confirm you are in the right place.'
        },
        {
          title: 'Review the result',
          body: 'After saving or finishing the action, check the list, status text, or confirmation message. If the result is not what you expected, go back one step instead of starting over from scratch.'
        }
      ]
    },
    {
      kind: 'callout',
      id: 'task-tip',
      tone: 'info',
      title: 'If something feels unclear',
      body: 'Use the back link, the page search, or the related pages in the sidebar. The help system is meant to guide you by one small question at a time.'
    }
  ];
}

function buildTroubleshootingBlocks(spec: HelpPageSpec): HelpBlock[] {
  const context = getSectionContext(spec);

  return [
    {
      kind: 'paragraphs',
      id: 'problem-intro',
      paragraphs: [
        `This page is for the situation where ${humanAction(spec.title)}. Problems like this are frustrating, but they are usually easier to solve when you check one possible cause at a time.`,
        'Start with the simplest check first. Many issues come from being on the wrong page, using the wrong email or code, or working in the wrong trip.'
      ]
    },
    {
      kind: 'steps',
      id: 'problem-checks',
      title: 'Checks to try first',
      steps: [
        {
          title: 'Confirm where you are',
          body: `${context.openArea} Then compare the current page title and the action you are trying to perform.`
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
      kind: 'callout',
      id: 'problem-tip',
      tone: 'tip',
      title: 'Slow down on purpose',
      body: 'When a task fails, going faster usually does not help. A calm second attempt after checking the page and current trip solves many common problems.'
    }
  ];
}

function buildRoleBlocks(spec: HelpPageSpec): HelpBlock[] {
  const context = getSectionContext(spec);

  return [
    {
      kind: 'paragraphs',
      id: 'role-intro',
      paragraphs: [
        `${spec.title} is meant to match the way you actually use Plantour. You do not need to read pages for every role. Focus on the parts that fit your access and responsibilities.`,
        `${context.openArea} Then use the suggestions below to stay focused on the tasks that matter most for your role.`
      ]
    },
    {
      kind: 'list',
      id: 'role-focus',
      title: 'What to focus on first',
      items: [
        { text: 'Start with the part of Plantour that matters most for your current task.' },
        { text: 'Use the dashboard to see the current trip and avoid switching between unrelated tasks.' },
        { text: 'Open the matching detail page when you need exact steps for adding, editing, assigning, or packing.' }
      ]
    },
    {
      kind: 'callout',
      id: 'role-tip',
      tone: 'info',
      title: 'You do not need every feature at once',
      body: 'Most users only need a few parts of Plantour on any given day. It is enough to learn the next task clearly and leave the rest for later.'
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

  return {
    id: pathId(spec.path),
    path: spec.path,
    title: spec.title,
    summary: customPage?.summary ?? summary,
    description: customPage?.description ?? buildDescription(spec),
    parentId: pathId(spec.parentPath),
    keywords: customPage?.keywords ?? buildKeywords(spec),
    relatedPageIds: customPage?.relatedPageIds ?? (spec.parentPath ? [pathId(spec.parentPath)] : [HELP_HOME_PAGE_ID]),
    blocks: customPage?.blocks ?? blocks,
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
          'This Help area is made for quick answers. Each page focuses on one question, so you can get help without reading a long manual from start to finish.',
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
        body: 'Plantour is mobile first, and this Help area follows the same idea. Use the page tools only when you need them, then collapse them to keep more room for the instructions.'
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