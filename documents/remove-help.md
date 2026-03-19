# Remove Existing Help System Plan

## Goal

Remove the current Help system completely so the app continues to work normally, but without any Help pages, Help links, Help buttons, Help routes, or Help sitemap entries.

This document is a plan only. No runtime code changes are included here.

## Exploration Summary

### Frontend

The Help system is concentrated in the Angular client under:

- `plantour-client/src/app/components/help/`

This folder currently contains the main Help page, shared Help section components, types, and all subsection content components.

### Backend

No Help-specific controllers, services, DTOs, middleware, or API endpoints were found in `plantour-server`.

### Database and SQL

No Help-specific schema or tables were found.

The only Help-related backend data found is sitemap seed data in:

- `plantour-server/DB/Scripts/5 populate-sitemap.sql`

That script inserts many `/help...` URLs into `sitemap_urls`. Those rows must be removed, otherwise the generated sitemap will keep publishing dead Help URLs.

## Conclusion

The Help system is mostly self-contained in the Angular client, but it has several external references that must be removed or updated before deleting the Help folder.

If the plan below is applied, the app should work normally without the Help system.

## Files To Delete

### Delete the entire Help feature folder

Delete:

- `plantour-client/src/app/components/help/`

Notes:

- This is the main removal target.
- It currently includes the main Help page, helper types, shared section renderer, and all Help subsection components.
- Delete the folder only after removing external references listed below.

## Files To Update

### 1. Remove Angular Help routes

Update:

- `plantour-client/src/app/app.routes.ts`

Changes needed:

- Remove the `help` route.
- Remove the `help/:section/:subsection` route.
- Remove the lazy imports of `./components/help/help-component`.
- Remove the `componentId: 'help'` route metadata.

Reason:

- If these routes stay in place after deleting the Help folder, the client build will fail or navigation will break.

### 2. Remove SSR handling for Help

Update:

- `plantour-client/src/app/app.routes.server.ts`

Changes needed:

- Remove the server-side render entry for path `help`.

Reason:

- SSR should not try to render a page that no longer exists.

### 3. Remove the Help item from the toolbar/menu

Update:

- `plantour-client/src/app/components/toolbar/toolbar-component.html`

Changes needed:

- Remove the Help menu item.
- Remove its selected-state binding for `help`.
- Remove its click handler that navigates to `/help`.

Reason:

- Leaving this item would create a dead navigation entry.

### 4. Remove direct Help navigation from feature pages

Update these client files:

- `plantour-client/src/app/components/dashboard/dashboard-component.ts`
- `plantour-client/src/app/components/features/public-templates/public-templates-component.ts`
- `plantour-client/src/app/components/features/public-templates/public-template-detail/public-template-detail-component.html`
- `plantour-client/src/app/components/packs/packs-component.ts`
- `plantour-client/src/app/components/packs/pack-form/pack-form-component.ts`
- `plantour-client/src/app/components/templates/templates-component.ts`
- `plantour-client/src/app/components/templates-ai/templates-ai-component.ts`
- `plantour-client/src/app/components/things/things-component.ts`
- `plantour-client/src/app/components/things/thing-form/thing-form-component.ts`
- `plantour-client/src/app/components/todos/todos-component.ts`
- `plantour-client/src/app/components/todos/todo-form/todo-form-component.ts`
- `plantour-client/src/app/components/travelers/travelers-component.ts`
- `plantour-client/src/app/components/travelers/traveler-form/traveler-form-component.ts`
- `plantour-client/src/app/components/trip-comments/trip-comments-component.ts`
- `plantour-client/src/app/components/trip-packs/trip-packs-component.ts`
- `plantour-client/src/app/components/trip-packs/trip-pack-form/trip-pack-form-component.ts`
- `plantour-client/src/app/components/trip-shared/trip-shared-component.ts`
- `plantour-client/src/app/components/trip-shared/trip-shared-form/trip-shared-form-component.ts`
- `plantour-client/src/app/components/trip-shared-todos/trip-shared-todos-component.ts`
- `plantour-client/src/app/components/trip-shared-todos/trip-shared-todo-form/trip-shared-todo-form-component.ts`
- `plantour-client/src/app/components/trip-things/trip-things-component.ts`
- `plantour-client/src/app/components/trip-things/trip-thing-form/trip-thing-form-component.ts`
- `plantour-client/src/app/components/trip-todos/trip-todos-component.ts`
- `plantour-client/src/app/components/trip-todos/trip-todo-form/trip-todo-form-component.ts`
- `plantour-client/src/app/components/trip-users/trip-users-component.ts`
- `plantour-client/src/app/components/trip-users/trip-user-form/trip-user-form-component.ts`
- `plantour-client/src/app/components/trips/trips-component.ts`
- `plantour-client/src/app/components/trips/trip-form/trip-form-component.ts`

Changes needed in those files:

- Remove `router.navigate(...)` calls that send users to `/help/...`.
- Remove `routerLink="/help"` links.
- Remove any `helpUrl` variables built for navigation to Help pages.
- Remove Help-only buttons, anchors, menu items, or CTA blocks from templates.
- Remove any now-unused imports, methods, and injected dependencies created only for Help navigation.

Reason:

- These files currently contain entry points into the Help system.
- If they are left unchanged, users will hit dead routes after Help removal.

Implementation note:

- Prefer removing the Help trigger completely instead of redirecting it somewhere else.
- If a button row or toolbar action exists only to open Help, remove that UI entirely.

### 5. Remove Help URLs from sitemap seed data

Update:

- `plantour-server/DB/Scripts/5 populate-sitemap.sql`

Changes needed:

- Remove all inserted `/help` and `/help/...` rows from the `sitemap_urls` seed script.

Reason:

- The server generates sitemap data from the DB.
- If these rows remain, search engines will keep seeing deleted Help pages.

Additional deployment note:

- If any environment already has Help URLs in the `sitemap_urls` table, remove those rows from the database as part of rollout, not only from the seed script.

## Files That Do Not Need Changes

No Help-specific backend runtime code was found in:

- controllers
- services
- repositories
- DTOs
- middleware
- EF models
- database schema scripts

That means there is no evidence of Help-specific API or DB logic beyond sitemap URL seed data.

## Recommended Removal Order

1. Remove all external Help references in Angular routes, SSR routes, toolbar, and feature components.
2. Remove Help URLs from `5 populate-sitemap.sql`.
3. Delete the entire `plantour-client/src/app/components/help/` folder.
4. Build the Angular app and fix any remaining stale imports or Help references.
5. Build the .NET API and verify sitemap generation still works correctly.

## Validation Checklist After Applying The Plan

### Client

- No `/help` route exists.
- No menu item or button navigates to `/help`.
- No client file imports from `src/app/components/help`.
- Angular build succeeds.
- App navigation works without dead Help links.

### Server

- .NET build succeeds.
- `sitemap.xml` no longer contains `/help` URLs.
- No backend endpoint returns Help-related data.

### Database

- `sitemap_urls` contains no Help URLs.

## Risks To Watch During Implementation

### Client build breaks after deleting Help folder

Cause:

- A stale lazy import, `routerLink`, or `router.navigate` to Help was missed.

Mitigation:

- Search for `/help`, `componentId: 'help'`, and `help-component` after edits and before deleting the folder.

### SEO keeps publishing deleted Help pages

Cause:

- Existing DB rows in `sitemap_urls` were not removed.

Mitigation:

- Clean both the SQL seed script and the actual DB data used by the deployed environment.

## Final Scope Statement

Delete:

- Entire Angular Help folder.

Update:

- Angular routes.
- Angular SSR routes.
- Toolbar/menu.
- All feature components that link to or navigate to Help.
- Sitemap seed SQL and deployed sitemap data.

Do not change:

- Backend controllers, services, repositories, DTOs, middleware, or DB schema, because no Help-specific runtime logic was found there.