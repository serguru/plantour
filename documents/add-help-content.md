# Add Help Content

## Help Component Structure Rule

When adding or updating Help components in the Angular client, keep templates and styles in separate files.

- Do not use inline HTML templates in the component TypeScript file.
- Do not use inline CSS styles in the component TypeScript file.
- Every Help component must use an external HTML template file through `templateUrl`.
- If a Help component does not intentionally reuse an existing Help SCSS file, it must have its own SCSS file.
- Reusing another Help component's SCSS file is allowed only when the styling is intentionally shared.

## Supported Options For Adding Help Answer Pages

### 1. Add a list answer to an existing section

Use this when the answer is static text, bullet points, or step-by-step instructions.

List-answer strings may include basic HTML markup when you need richer formatting without creating a custom answer component. The list renderer supports Angular's sanitized `innerHTML`, so markup such as `<strong>`, `<em>`, `<a>`, `<code>`, `<br>`, and similar safe HTML can be used inside section titles and answer items.

Steps:

1. Open `plantour-client/src/app/components/help/help-content.ts`.
2. Find the `SECTION_SOURCES` array.
3. Choose an existing section.
4. Add a new item to that section's `questions` array.
5. Set a unique `slug`.
6. Set the `question` text.
7. Add useful `keywords`.
8. Set `answer.kind` to `'list'`.
9. Add one or more answer `sections` with `listStyle` and `items`.
10. If needed, include safe HTML inside `title` or `items` strings for formatting.
11. Save and verify the new page under `/help/{sectionId}/{questionSlug}`.

### 2. Add a new section with one or more list answers

Use this when the topic does not fit any existing Help section.

Steps:

1. Open `plantour-client/src/app/components/help/help-content.ts`.
2. Add a new section object to `SECTION_SOURCES`.
3. Set a unique section `id`.
4. Set the section `title` and `summary`.
5. Add one or more question objects in `questions`.
6. Use the same list-answer structure as in option 1.
7. Save and verify the section on `/help` and each generated answer page.

### 3. Add a custom Angular component answer page

Use this when the answer needs interactive UI, conditional rendering, or service calls.

Steps:

1. Create a standalone Help answer component under `plantour-client/src/app/components/help/answers/`.
2. Create a separate HTML template file for it.
3. Reuse an existing Help SCSS file intentionally, or create a dedicated SCSS file.
4. Open `plantour-client/src/app/components/help/help-content.ts`.
5. Extend `HelpAnswerComponentKey` with a new key.
6. Add the new question in the correct Help section.
7. Set `answer.kind` to `'component'` and set `componentKey` to the new key.
8. Open `plantour-client/src/app/components/help/answers/help-answer-component.ts`.
9. Import the new answer component.
10. Map the new `componentKey` in `buildAnswerSpec()`.
11. Save and verify the dedicated answer page.

## Notes

- You do not need to add a new Angular route for each answer page.
- Help answer page URLs are generated through the existing `/help/:sectionId/:questionSlug` route.
- The source of truth for Help sections and questions is `help-content.ts`.
- HTML used inside list-answer strings is rendered on the page but converted back to plain text for summaries, descriptions, search text, and FAQ metadata.