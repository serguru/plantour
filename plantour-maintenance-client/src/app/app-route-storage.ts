export const DEFAULT_AUTHENTICATED_ROUTE = '/dashboard';
export const LAST_OPEN_PAGE_STORAGE_KEY = 'plantour-maintenance.last-open-page';

const PERSISTABLE_ROUTES = new Set(['/dashboard', '/visitor-activity', '/users', '/logs']);

export function isPersistableRoute(url: string | null | undefined): url is string {
  if (!url) {
    return false;
  }

  return PERSISTABLE_ROUTES.has(stripQueryStringAndHash(url));
}

export function normalizeStoredRoute(url: string | null | undefined): string {
  if (!isPersistableRoute(url)) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }

  return stripQueryStringAndHash(url);
}

function stripQueryStringAndHash(url: string): string {
  return url.split(/[?#]/, 1)[0] ?? url;
}