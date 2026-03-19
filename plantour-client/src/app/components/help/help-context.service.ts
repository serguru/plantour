import { Injectable } from '@angular/core';
import { HELP_PAGES } from './help-content';

interface HelpContextRule {
  pattern: RegExp;
  pageId: string;
}

const CONTEXT_RULES: HelpContextRule[] = [
  { pattern: /^\/help(?:\/.*)?$/, pageId: 'help-home' },
  { pattern: /^\/$/, pageId: 'public/guest-access/start-guest-access-and-open-the-las-vegas-demo-trip' },
  { pattern: /^\/dashboard$/, pageId: 'dashboard' },
  { pattern: /^\/sign-in(?:\/participant)?$/, pageId: 'access' },
  { pattern: /^\/signin-token$/, pageId: 'access/admin-sign-in/how-email-link-sign-in-works' },
  { pattern: /^\/packing-list-generator\/templates$/, pageId: 'public/packing-list-generator' },
  { pattern: /^\/packing-list-generator\/templates\/[^/]+$/, pageId: 'public/packing-list-generator/template-details' },
  { pattern: /^\/things$/, pageId: 'items' },
  { pattern: /^\/things\/add$/, pageId: 'items/how-to-add-an-item' },
  { pattern: /^\/things\/edit\/[^/]+$/, pageId: 'items/how-to-edit-an-item' },
  { pattern: /^\/todos$/, pageId: 'todos' },
  { pattern: /^\/todos\/add$/, pageId: 'todos/how-to-add-a-todo' },
  { pattern: /^\/todos\/edit\/[^/]+$/, pageId: 'todos/how-to-edit-a-todo' },
  { pattern: /^\/travelers$/, pageId: 'travelers' },
  { pattern: /^\/travelers\/add$/, pageId: 'travelers/how-to-add-a-traveler' },
  { pattern: /^\/travelers\/edit\/[^/]+$/, pageId: 'travelers/how-to-edit-a-traveler' },
  { pattern: /^\/travelers\/view\/[^/]+$/, pageId: 'travelers/how-to-view-a-traveler' },
  { pattern: /^\/packs$/, pageId: 'bags' },
  { pattern: /^\/packs\/add$/, pageId: 'bags/how-to-add-a-bag' },
  { pattern: /^\/packs\/edit\/[^/]+$/, pageId: 'bags/how-to-edit-a-bag' },
  { pattern: /^\/trips$/, pageId: 'trips' },
  { pattern: /^\/trips\/trip\/[^/]+$/, pageId: 'trips/how-to-open-an-existing-trip' },
  { pattern: /^\/trips\/add$/, pageId: 'trips/how-to-create-a-trip' },
  { pattern: /^\/trips\/edit\/[^/]+$/, pageId: 'trips/how-to-edit-a-trip' },
  { pattern: /^\/trips\/view\/[^/]+$/, pageId: 'trips/how-to-view-a-trip' },
  { pattern: /^\/trips\/[^/]+\/trip-packs$/, pageId: 'bags/trip-bags' },
  { pattern: /^\/trips\/[^/]+\/trip-packs\/add$/, pageId: 'bags/trip-bags/how-to-add-a-bag-to-a-trip' },
  { pattern: /^\/trips\/[^/]+\/trip-packs\/edit\/[^/]+$/, pageId: 'bags/trip-bags/how-to-edit-a-trip-bag' },
  { pattern: /^\/trips\/[^/]+\/trip-participants$/, pageId: 'trip-participants' },
  { pattern: /^\/trips\/[^/]+\/trip-participants\/add$/, pageId: 'trip-participants/how-to-add-a-person-to-a-trip' },
  { pattern: /^\/trips\/[^/]+\/trip-participants\/edit\/[^/]+$/, pageId: 'trip-participants/how-to-edit-a-trip-participant' },
  { pattern: /^\/trips\/[^/]+\/trip-participants\/view\/[^/]+$/, pageId: 'trip-participants/how-to-view-a-trip-participant' },
  { pattern: /^\/trips\/[^/]+\/trip-things$/, pageId: 'trip-items' },
  { pattern: /^\/trips\/[^/]+\/trip-things\/add$/, pageId: 'trip-items/how-to-add-an-item-directly-to-a-trip' },
  { pattern: /^\/trips\/[^/]+\/trip-things\/edit\/[^/]+$/, pageId: 'trip-items/how-to-edit-a-trip-item' },
  { pattern: /^\/trips\/[^/]+\/trip-todos$/, pageId: 'trip-todos' },
  { pattern: /^\/trips\/[^/]+\/trip-todos\/add$/, pageId: 'trip-todos/how-to-add-a-trip-todo' },
  { pattern: /^\/trips\/[^/]+\/trip-todos\/edit\/[^/]+$/, pageId: 'trip-todos/how-to-edit-a-trip-todo' },
  { pattern: /^\/trips\/[^/]+\/trip-shared$/, pageId: 'shared-items' },
  { pattern: /^\/trips\/[^/]+\/trip-shared\/add$/, pageId: 'shared-items/how-to-add-a-shared-item' },
  { pattern: /^\/trips\/[^/]+\/trip-shared\/edit\/[^/]+$/, pageId: 'shared-items/how-to-edit-a-shared-item' },
  { pattern: /^\/trips\/[^/]+\/trip-shared\/view\/[^/]+$/, pageId: 'shared-items/how-to-view-a-shared-item' },
  { pattern: /^\/trips\/[^/]+\/trip-shared-todos$/, pageId: 'shared-todos' },
  { pattern: /^\/trips\/[^/]+\/trip-shared-todos\/add$/, pageId: 'shared-todos/how-to-add-a-shared-todo' },
  { pattern: /^\/trips\/[^/]+\/trip-shared-todos\/edit\/[^/]+$/, pageId: 'shared-todos/how-to-edit-a-shared-todo' },
  { pattern: /^\/trips\/[^/]+\/trip-shared-todos\/view\/[^/]+$/, pageId: 'shared-todos/how-to-view-a-shared-todo' },
  { pattern: /^\/trips\/[^/]+\/trip-comments$/, pageId: 'comments' },
  { pattern: /^\/contact$/, pageId: 'help-home' },
  { pattern: /^\/privacy$/, pageId: 'help-home' },
  { pattern: /^\/profile$/, pageId: 'profile' },
  { pattern: /^\/terms$/, pageId: 'help-home' },
  { pattern: /^\/templates$/, pageId: 'templates' },
  { pattern: /^\/templates-ai$/, pageId: 'ai' },
  { pattern: /^\/checkout\/[^/]+\/[^/]+$/, pageId: 'getting-started/checkout' },
  { pattern: /^\/plans$/, pageId: 'billing' },
];

@Injectable({ providedIn: 'root' })
export class HelpContextService {
  private readonly pageIds = new Set(HELP_PAGES.map((page) => page.id));

  resolvePageId(currentUrl: string, explicitPageId?: string | null): string | null {
    if (explicitPageId && this.pageIds.has(explicitPageId)) {
      return explicitPageId;
    }

    const cleanUrl = currentUrl.split('?')[0].split('#')[0];
    const match = CONTEXT_RULES.find((rule) => rule.pattern.test(cleanUrl));
    return match?.pageId ?? null;
  }

  getPageUrl(pageId: string | null): string | null {
    if (!pageId) {
      return null;
    }

    if (pageId === 'help-home') {
      return '/help';
    }

    return this.pageIds.has(pageId) ? `/help/${pageId}` : null;
  }
}