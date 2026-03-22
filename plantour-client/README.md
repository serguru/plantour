# PlantourClient

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.10.

## Development server

This repo supports 3 environments: **dev** (local), **qa**, and **production**.

To start a local dev server (uses the **dev** environment), run:

```bash
npm run serve:dev
```

By default this runs on `http://localhost:4203/` (see `package.json`).

To run the client using the **qa** environment locally:

```bash
npm run serve:qa
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Component Structure Convention

Angular components in this repo should keep markup and styling in external files.

- Do not use inline `template` in `@Component` metadata.
- Do not use inline `styles` or `style` in `@Component` metadata.
- Use `templateUrl` with a separate HTML file.
- Prefer `styleUrl` with a component-specific SCSS file.
- Reusing another component's SCSS file is acceptable only when that styling is intentionally shared.

Help components follow the same rule with one extra constraint:

- Every Help component must have its own HTML template file.
- A Help component may reuse an existing Help SCSS file when the styling is intentionally shared.
- Otherwise the Help component must have its own SCSS file.

## Building

Builds are environment-specific:

```bash
npm run build:dev
npm run build:qa
npm run build:production
```

Output is written to `dist/`.

### Environment files

- `src/environments/environment.ts` = **dev** (local)
- `src/environments/environment.qa.ts` = **qa**
- `src/environments/environment.prod.ts` = **production**

Angular configuration wiring (file replacements) is in `angular.json` under `projects.plantour-app.architect.build.configurations`.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
