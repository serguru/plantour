Use this flow depending on what you want to add.

**Where Things Live**
The help system is split into four layers:

1. Section order:
plantour-client/src/app/components/help/sections/sections-order.json

2. Section metadata and question order inside one section:
get-started section
why-plantour section
how-do-i section

3. Question and answer content:
Example question files:
plantour-client/src/app/components/help/sections/get-started/What are my first steps with Plantour.json
plantour-client/src/app/components/help/sections/why-plantour/Why do I need to use Plantour.json

4. Runtime wiring for imported JSON files:
plantour-client/src/app/components/help/help-content.ts

The authoring rules are documented in:
documents/add-help-content.md

**Add A New Question To An Existing Section**
Use this when the section already exists.

1. Open the target section folder.
Example:
plantour-client/src/app/components/help/sections/get-started

2. Create a new question JSON file.
Use a descriptive filename, for example:
`How do I pack shared items.json`

3. Put the question data into that file.
For a normal list answer, use this shape:

```json
{
  "slug": "pack-shared-items",
  "question": "How do I pack shared items?",
  "keywords": ["shared items", "packing", "participant"],
  "answer": {
    "kind": "list",
    "sections": [
      {
        "title": "Steps",
        "listTag": "ol",
        "items": [
          "Open the trip.",
          "Go to the shared items page.",
          "Select the item and assign it."
        ]
      }
    ]
  }
}
```

4. Open that section’s manifest and add the new filename into the `questions` array where you want it to appear.
Example:
get-started section

5. Open plantour-client/src/app/components/help/help-content.ts.

6. Add an import for the new question JSON near the other imports.

7. Register that file in `QUESTION_SOURCE_BY_FILE`.
The key must match:
`section-folder-name/file-name.json`

Example entry:

```ts
[
  'get-started/How do I pack shared items.json',
  getStartedPackSharedItemsQuestion as HelpQuestionSource
]
```

8. Save and verify the question appears on the help page and opens at `/help/{sectionId}/{slug}`.

**Add A New Section**
Use this when the topic does not fit an existing section.

1. Create a new folder under:
plantour-client/src/app/components/help/sections

Example folder:
`trip-sharing`

2. Inside that folder, create `section.json`.

3. Add section metadata and ordered question filenames:

```json
{
  "id": "trip-sharing",
  "title": "Trip Sharing",
  "summary": "Sharing trips, items, and responsibilities",
  "questions": [
    "How do I invite people to a trip.json"
  ]
}
```

4. Create the first question JSON file in that same folder.

5. Open section order:
plantour-client/src/app/components/help/sections/sections-order.json

6. Add the new folder name in the position where you want the section to appear.

Example:

```json
[
  "get-started",
  "trip-sharing",
  "why-plantour",
  "how-do-i"
]
```

7. Open plantour-client/src/app/components/help/help-content.ts.

8. Import the new `section.json`.

9. Import every question JSON file from that new section.

10. Register the section in `SECTION_MANIFEST_BY_FOLDER`.

Example:

```ts
[
  'trip-sharing',
  tripSharingSectionManifest as HelpSectionManifest
]
```

11. Register each question in `QUESTION_SOURCE_BY_FILE`.

12. Save and verify the new section appears on `/help`.

**Add A List Answer**
Use this for static help content.

1. Create or edit a question JSON file in the section folder.
Example:
plantour-client/src/app/components/help/sections/how-do-i/... add, update or delete dictionary entities.json

2. Set `answer.kind` to `list`.

3. Add one or more `sections`.

4. For bullet lists, use `listTag: "ul"`.

5. For numbered steps, use `listTag: "ol"`.

6. If needed, add `beforeHtml` for content before the list.

7. If needed, add `afterHtml` for content after the list.

Example:

```json
{
  "slug": "download-report",
  "question": "How do I download a trip report?",
  "keywords": ["trip report", "download", "pdf"],
  "answer": {
    "kind": "list",
    "sections": [
      {
        "beforeHtml": "Use these steps to download the report.",
        "listTag": "ol",
        "items": [
          "Open the trip.",
          "Open the page header menu.",
          "Select the trip report action."
        ],
        "afterHtml": "The report will be downloaded as a file."
      }
    ]
  }
}
```

**Add A Component Answer**
Use this when the answer needs custom UI or logic.

1. Create the Angular answer component under:
plantour-client/src/app/components/help/answers

2. Add its HTML template and, if needed, SCSS.

3. Create the question JSON file in the right section folder.

4. In that JSON file, use:

```json
{
  "slug": "some-question",
  "question": "Some question?",
  "keywords": ["example"],
  "answer": {
    "kind": "component",
    "componentKey": "your-component-key"
  }
}
```

5. Open plantour-client/src/app/components/help/help-content.ts.

6. Extend `HelpAnswerComponentKey` with the new key.

7. Import the new question JSON.

8. Register the question in `QUESTION_SOURCE_BY_FILE`.

9. Open the answer component registry:
plantour-client/src/app/components/help/answers/help-answer-component.ts

10. Import the new Angular answer component there.

11. Map the new `componentKey` to that component in the existing registry logic.

12. Save and verify the answer page renders correctly.

**Change Section Order**
1. Open plantour-client/src/app/components/help/sections/sections-order.json.
2. Reorder the folder names.
3. Save.

That is the only file controlling section order.

**Change Question Order Inside One Section**
1. Open the section manifest.
Example:
plantour-client/src/app/components/help/sections/why-plantour/section.json

2. Reorder the filenames in `questions`.
3. Save.

That is the only file controlling question order inside that section.

**What Must Stay In Sync**
When you add a question, keep these consistent:

1. The filename in the section folder.
2. The same filename in that section’s `questions` array.
3. The same `section/file.json` key in `QUESTION_SOURCE_BY_FILE` inside plantour-client/src/app/components/help/help-content.ts.
4. The `slug` inside the JSON file.

If any of those drift, the question may not load.

**Recommended Workflow**
For a normal new list answer:

1. Create question JSON in the right section folder.
2. Add the filename to that section’s `section.json`.
3. Import and register it in plantour-client/src/app/components/help/help-content.ts.
4. Verify the page.

For a brand new section:

1. Create the folder.
2. Add `section.json`.
3. Add one or more question JSON files.
4. Add the folder name to plantour-client/src/app/components/help/sections/sections-order.json.
5. Import and register section and questions in plantour-client/src/app/components/help/help-content.ts.

**Validation**
After changes, run the client TypeScript check if you want a quick validation:

```powershell
cd plantour-client
.\node_modules\.bin\tsc.cmd -p tsconfig.app.json --noEmit
```

**Useful References**
Structure and rules:
documents/add-help-content.md

Runtime wiring:
plantour-client/src/app/components/help/help-content.ts

Section order:
plantour-client/src/app/components/help/sections/sections-order.json

Section manifests:
plantour-client/src/app/components/help/sections/get-started/section.json
plantour-client/src/app/components/help/sections/why-plantour/section.json
plantour-client/src/app/components/help/sections/how-do-i/section.json

If you want, I can also turn this into a shorter contributor checklist and add it directly to documents/add-help-content.md.
