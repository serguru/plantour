import { Injectable } from '@angular/core';
import { HELP_HOME_PAGE_ID, HELP_PAGE_MAP, findHelpPageByPath, getHelpPageUrl } from '../components/help/help-content';
import type { HelpBreadcrumb, HelpPage } from '../components/help/help-content';

export type { HelpBreadcrumb, HelpPage } from '../components/help/help-content';

const COMPONENT_HELP_PAGE_IDS: Readonly<Record<string, string>> = {
  dashboard: 'help/workflows/trip-info',
  'trip-info': 'help/workflows/trip-info',
  'trips-ai': 'help/ai-features/ai-full-trip-generation',
  'sign-in': 'help/get-started/first-steps',
  'signin-token': 'help/get-started/first-steps',
  'public-templates': 'help/features/item-templates',
  'public-template-detail': 'help/features/item-templates',
  things: 'help/workflows/work-with-my-items-dictionary',
  'thing-form': 'help/workflows/work-with-my-items-dictionary',
  todos: 'help/workflows/work-with-my-todos-dictionary',
  'todo-form': 'help/workflows/work-with-my-todos-dictionary',
  travelers: 'help/workflows/invite-travelers',
  'traveler-form': 'help/workflows/invite-travelers',
  packs: 'help/workflows/work-with-my-bags-dictionary',
  'pack-form': 'help/workflows/work-with-my-bags-dictionary',
  keys: 'help/workflows/work-with-keys',
  'key-form': 'help/workflows/work-with-keys',
  trips: 'help/trip-workflows/work-with-trips',
  'trip-form': 'help/trip-workflows/work-with-trips',
  'trip-itinerary': 'help/trip-workflows/work-with-trip-itinerary',
  'trip-itinerary-form': 'help/trip-workflows/work-with-trip-itinerary',
  'trip-itinerary-map': 'help/trip-workflows/see-trip-on-map',
  'trip-packs': 'help/trip-workflows/how-do-i-work-with-trip-bags',
  'trip-pack-form': 'help/trip-workflows/how-do-i-work-with-trip-bags',
  'trips-improvement': 'help/trip-workflows/plan-trip-improvements',
  'trip-improvement-form': 'help/trip-workflows/plan-trip-improvements',
  'trip-expenses': 'help/trip-workflows/manage-trip-expenses',
  'trip-expense-form': 'help/trip-workflows/manage-trip-expenses',
  'trip-users': 'help/workflows/invite-travelers',
  'trip-user-form': 'help/workflows/invite-travelers',
  'trip-things': 'help/trip-workflows/what-can-i-do-with-trip-items',
  'trip-thing-form': 'help/trip-workflows/what-can-i-do-with-trip-items',
  'trip-todos': 'help/trip-workflows/work-with-trip-todos',
  'trip-todo-form': 'help/trip-workflows/work-with-trip-todos',
  'trip-notes': 'help/trip-workflows/keep-travel-notes',
  'trip-note-form': 'help/trip-workflows/keep-travel-notes',
  'trip-activities-personal': 'help/trip-workflows/work-with-trip-activities',
  'trip-activity-personal-form': 'help/trip-workflows/work-with-trip-activities',
  'trip-activities-public': 'help/shared-trip-workflows/work-with-shared-activities',
  'trip-activity-public-form': 'help/shared-trip-workflows/work-with-shared-activities',
  'trip-shared': 'help/shared-trip-workflows/how-does-admin-add-update-and-delete-shared-items',
  'trip-shared-form': 'help/shared-trip-workflows/how-does-admin-add-update-and-delete-shared-items',
  'trip-shared-todos': 'help/shared-trip-workflows/how-does-admin-add-update-and-delete-shared-todos',
  'trip-shared-todo-form': 'help/shared-trip-workflows/how-does-admin-add-update-and-delete-shared-todos',
  'trip-shared-expenses': 'help/shared-trip-workflows/how-does-admin-add-update-and-delete-shared-expenses',
  'trip-shared-expense-form': 'help/shared-trip-workflows/how-does-admin-add-update-and-delete-shared-expenses',
  'trip-comments': 'help/trip-workflows/work-with-trip-comments',
  contact: 'help/workflows/contact-plantour-administration',
  privacy: 'help/workflows/contact-plantour-administration',
  terms: 'help/workflows/contact-plantour-administration',
  profile: 'help/features/profile-data',
  templates: 'help/features/item-templates',
  'templates-ai': 'help/ai-features/ai-item-recommendations',
  checkout: 'help/workflows/manage-billing',
  plans: 'help/workflows/manage-billing',
  search: 'help/features/search-for-something',
};

const ROUTE_HELP_PAGE_MATCHERS: ReadonlyArray<{ pattern: RegExp; pageId: string }> = [
  { pattern: /^\/dashboard(?:\/.*)?$/, pageId: 'help/workflows/trip-info' },
  { pattern: /^\/packing-list-generator\/templates(?:\/.*)?$/, pageId: 'help/features/item-templates' },
  { pattern: /^\/templates-ai(?:\/.*)?$/, pageId: 'help/ai-features/ai-item-recommendations' },
  { pattern: /^\/templates(?:\/.*)?$/, pageId: 'help/features/item-templates' },
  { pattern: /^\/profile(?:\/.*)?$/, pageId: 'help/features/profile-data' },
  { pattern: /^\/travelers(?:\/.*)?$/, pageId: 'help/workflows/invite-travelers' },
  { pattern: /^\/packs(?:\/.*)?$/, pageId: 'help/workflows/work-with-my-bags-dictionary' },
  { pattern: /^\/things(?:\/.*)?$/, pageId: 'help/workflows/work-with-my-items-dictionary' },
  { pattern: /^\/todos(?:\/.*)?$/, pageId: 'help/workflows/work-with-my-todos-dictionary' },
  { pattern: /^\/trips\/[^/]+\/trip-shared-todos(?:\/.*)?$/, pageId: 'help/shared-trip-workflows/how-does-admin-add-update-and-delete-shared-todos' },
  { pattern: /^\/trips\/[^/]+\/trip-shared(?:\/.*)?$/, pageId: 'help/shared-trip-workflows/how-does-admin-add-update-and-delete-shared-items' },
  { pattern: /^\/trips\/[^/]+\/trip-packs(?:\/.*)?$/, pageId: 'help/trip-workflows/how-do-i-work-with-trip-bags' },
  { pattern: /^\/trips\/[^/]+\/trips-improvement(?:\/.*)?$/, pageId: 'help/trip-workflows/plan-trip-improvements' },
  { pattern: /^\/trips\/[^/]+\/trip-things(?:\/.*)?$/, pageId: 'help/trip-workflows/what-can-i-do-with-trip-items' },
  { pattern: /^\/trips\/[^/]+\/trip-participants(?:\/.*)?$/, pageId: 'help/workflows/invite-travelers' },
  { pattern: /^\/trips\/[^/]+\/trip-todos(?:\/.*)?$/, pageId: 'help/trip-workflows/work-with-trip-todos' },
  { pattern: /^\/trips\/[^/]+\/trip-comments(?:\/.*)?$/, pageId: 'help/trip-workflows/work-with-trip-comments' },
  { pattern: /^\/trips(?:\/trip\/[^/]+)?$/, pageId: 'help/trip-workflows/work-with-trips' },
  { pattern: /^\/trips\/(add|edit\/[^/]+|view\/[^/]+)$/, pageId: 'help/trip-workflows/work-with-trips' }
];


@Injectable({ providedIn: 'root' })
export class HelpService {
  resolvePageId(currentUrl: string, explicitPageId?: string | null, componentId?: string | null): string | null {
    if (explicitPageId && HELP_PAGE_MAP.has(explicitPageId)) {
      return explicitPageId;
    }

    if (componentId) {
      const mappedPageId = COMPONENT_HELP_PAGE_IDS[componentId];
      if (mappedPageId && HELP_PAGE_MAP.has(mappedPageId)) {
        return mappedPageId;
      }
    }

    const cleanUrl = currentUrl.split('?')[0].split('#')[0];
    const segments = cleanUrl
      .split('/')
      .filter((segment) => segment.length > 0);
    const isHelpRoute = segments[0] === 'help';

    if (isHelpRoute) {
      const helpPath = segments.slice(1);
      const page = findHelpPageByPath(helpPath);

      if (page?.id) {
        return page.id;
      }
    }

    const matchedPageId = ROUTE_HELP_PAGE_MATCHERS.find((candidate) => candidate.pattern.test(cleanUrl))?.pageId;
    if (matchedPageId && HELP_PAGE_MAP.has(matchedPageId)) {
      return matchedPageId;
    }

    return HELP_HOME_PAGE_ID;
  }

  resolveComponentId(componentIds: ReadonlyArray<string | null | undefined>): string | null {
    for (let index = componentIds.length - 1; index >= 0; index -= 1) {
      const componentId = componentIds[index]?.trim();
      if (componentId) {
        return componentId;
      }
    }

    return null;
  }

  getPageUrl(pageId: string | null): string | null {
    return getHelpPageUrl(pageId ?? HELP_HOME_PAGE_ID);
  }
}