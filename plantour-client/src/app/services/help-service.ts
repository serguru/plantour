import { Injectable } from '@angular/core';
import { HELP_HOME_PAGE_ID, HELP_PAGE_MAP, findHelpPageByPath, getHelpPageUrl } from '../components/help/help-content';
import type { HelpBreadcrumb, HelpPage } from '../components/help/help-content';

export type { HelpBreadcrumb, HelpPage } from '../components/help/help-content';

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
    const helpPath = segments[0] === 'help' ? segments.slice(1) : [];
    const page = findHelpPageByPath(helpPath);

    return page?.id ?? HELP_HOME_PAGE_ID;
  }

  getPageUrl(pageId: string | null): string | null {
    return getHelpPageUrl(pageId ?? HELP_HOME_PAGE_ID);
  }
}