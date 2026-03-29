import { Injectable } from '@angular/core';
import { HELP_HOME_PAGE_ID, HELP_PAGE_MAP, findHelpPageByPath, getHelpPageUrl } from '../components/help/help-content';
import type { HelpBreadcrumb, HelpPage } from '../components/help/help-content';

export type { HelpBreadcrumb, HelpPage } from '../components/help/help-content';

const ROUTE_HELP_PAGE_MATCHERS: ReadonlyArray<{ pattern: RegExp; pageId: string }> = [
  { pattern: /^\/dashboard(?:\/.*)?$/, pageId: 'help/workflows/trip-info' },
  { pattern: /^\/packing-list-generator\/templates(?:\/.*)?$/, pageId: 'help/features/item-templates' },
  { pattern: /^\/templates-ai(?:\/.*)?$/, pageId: 'help/features/ai-item-recommendations' },
  { pattern: /^\/templates(?:\/.*)?$/, pageId: 'help/features/item-templates' },
  { pattern: /^\/profile(?:\/.*)?$/, pageId: 'help/features/profile-data' },
  { pattern: /^\/travelers(?:\/.*)?$/, pageId: 'help/workflows/invite-travelers' },
  { pattern: /^\/packs(?:\/.*)?$/, pageId: 'help/workflows/work-with-my-bags-dictionary' },
  { pattern: /^\/things(?:\/.*)?$/, pageId: 'help/workflows/work-with-my-items-dictionary' },
  { pattern: /^\/todos(?:\/.*)?$/, pageId: 'help/workflows/work-with-my-todos-dictionary' },
  { pattern: /^\/trips\/[^/]+\/trip-shared-todos(?:\/.*)?$/, pageId: 'help/shared-trip-workflows/how-does-admin-add-update-and-delete-shared-todos' },
  { pattern: /^\/trips\/[^/]+\/trip-shared(?:\/.*)?$/, pageId: 'help/shared-trip-workflows/how-does-admin-add-update-and-delete-shared-items' },
  { pattern: /^\/trips\/[^/]+\/trip-packs(?:\/.*)?$/, pageId: 'help/trip-workflows/how-do-i-work-with-trip-bags' },
  { pattern: /^\/trips\/[^/]+\/trip-things(?:\/.*)?$/, pageId: 'help/trip-workflows/what-can-i-do-with-trip-items' },
  { pattern: /^\/trips\/[^/]+\/trip-participants(?:\/.*)?$/, pageId: 'help/workflows/invite-travelers' },
  { pattern: /^\/trips\/[^/]+\/trip-todos(?:\/.*)?$/, pageId: 'help/trip-workflows/work-with-trip-todos' },
  { pattern: /^\/trips\/[^/]+\/trip-comments(?:\/.*)?$/, pageId: 'help/trip-workflows/work-with-trip-comments' },
  { pattern: /^\/trips(?:\/trip\/[^/]+)?$/, pageId: 'help/trip-workflows/work-with-trips' },
  { pattern: /^\/trips\/(add|edit\/[^/]+|view\/[^/]+)$/, pageId: 'help/trip-workflows/work-with-trips' }
];

@Injectable({ providedIn: 'root' })
export class HelpService {
  resolvePageId(currentUrl: string, explicitPageId?: string | null): string | null {
    if (explicitPageId && HELP_PAGE_MAP.has(explicitPageId)) {
      return explicitPageId;
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

  getPageUrl(pageId: string | null): string | null {
    return getHelpPageUrl(pageId ?? HELP_HOME_PAGE_ID);
  }
}