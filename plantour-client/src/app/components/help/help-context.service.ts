import { Injectable } from '@angular/core';
import { HELP_FUTURE_PAGES_PAGE_ID } from './help-content';

@Injectable({ providedIn: 'root' })
export class HelpContextService {
  resolvePageId(_currentUrl: string, explicitPageId?: string | null): string | null {
    return explicitPageId ?? HELP_FUTURE_PAGES_PAGE_ID;
  }

  getPageUrl(_pageId: string | null): string | null {
    return '/help';
  }
}