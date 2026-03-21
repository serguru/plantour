import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, '..');
const helpSectionsRoot = path.join(clientRoot, 'src', 'app', 'components', 'help', 'sections');
const sectionsOrderPath = path.join(helpSectionsRoot, 'sections-order.json');

async function readJson(filePath) {
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function getHelpUrl(sectionId, slug) {
  return `/help/${sectionId}/${slug}`;
}

async function main() {
  const sectionFolders = await readJson(sectionsOrderPath);
  assert(Array.isArray(sectionFolders), 'Help section order must be an array.');

  const seenFolders = new Set();
  const seenSectionIds = new Map();
  const seenPaths = new Map();

  for (const folderName of sectionFolders) {
    assert(typeof folderName === 'string' && folderName.length > 0, 'Help section folder names must be non-empty strings.');
    assert(!seenFolders.has(folderName), `Duplicate help section folder in sections-order.json: ${folderName}`);
    seenFolders.add(folderName);

    const sectionManifestPath = path.join(helpSectionsRoot, folderName, 'section.json');
    const sectionManifest = await readJson(sectionManifestPath);

    assert(typeof sectionManifest.id === 'string' && sectionManifest.id.length > 0, `Missing section id in ${sectionManifestPath}`);
    assert(Array.isArray(sectionManifest.questions), `Section questions must be an array in ${sectionManifestPath}`);

    const existingSectionFolder = seenSectionIds.get(sectionManifest.id);
    assert(!existingSectionFolder, `Duplicate help section id "${sectionManifest.id}" in folders "${existingSectionFolder}" and "${folderName}"`);
    seenSectionIds.set(sectionManifest.id, folderName);

    const seenQuestionFiles = new Set();

    for (const questionFileName of sectionManifest.questions) {
      assert(typeof questionFileName === 'string' && questionFileName.length > 0, `Question filenames must be non-empty strings in ${sectionManifestPath}`);
      assert(!seenQuestionFiles.has(questionFileName), `Duplicate help question filename "${questionFileName}" in ${sectionManifestPath}`);
      seenQuestionFiles.add(questionFileName);

      const questionFilePath = path.join(helpSectionsRoot, folderName, questionFileName);
      const question = await readJson(questionFilePath);

      assert(typeof question.slug === 'string' && question.slug.length > 0, `Missing question slug in ${questionFilePath}`);

      const helpUrl = getHelpUrl(sectionManifest.id, question.slug);
      const existingQuestionFilePath = seenPaths.get(helpUrl);
      assert(
        !existingQuestionFilePath,
        `Duplicate help URL path "${helpUrl}" in "${existingQuestionFilePath}" and "${questionFilePath}"`
      );
      seenPaths.set(helpUrl, questionFilePath);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});