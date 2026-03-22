import { watch } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, '..');
const generatedHelpSourcesPath = path.join(clientRoot, 'src', 'app', 'components', 'help', 'generated-help-sources.ts');
const helpSectionsRoot = path.join(clientRoot, 'src', 'app', 'components', 'help', 'sections');
const sectionsOrderPath = path.join(helpSectionsRoot, 'sections-order.json');
const watchMode = process.argv.includes('--watch');

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

function escapeTsString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function toImportPath(filePath) {
  return `./${path.relative(path.dirname(generatedHelpSourcesPath), filePath).split(path.sep).join('/')}`;
}

function toIdentifier(value) {
  const parts = value
    .replace(/\.json$/i, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'helpSource';
  }

  const [firstPart, ...restParts] = parts;
  return [firstPart.charAt(0).toLowerCase() + firstPart.slice(1), ...restParts.map((part) => part.charAt(0).toUpperCase() + part.slice(1))].join('');
}

function createUniqueIdentifier(baseName, usedIdentifiers) {
  let identifier = toIdentifier(baseName);
  let suffix = 2;

  while (usedIdentifiers.has(identifier)) {
    identifier = `${toIdentifier(baseName)}${suffix}`;
    suffix += 1;
  }

  usedIdentifiers.add(identifier);
  return identifier;
}

async function writeGeneratedHelpSources(sectionImports, questionImports) {
  const importLines = [
    ...sectionImports.map((entry) => `import ${entry.importName} from '${escapeTsString(entry.importPath)}';`),
    ...questionImports.map((entry) => `import ${entry.importName} from '${escapeTsString(entry.importPath)}';`)
  ];

  const sectionEntries = sectionImports.map((entry) => `  ['${escapeTsString(entry.folderName)}', ${entry.importName}]`);
  const questionEntries = questionImports.map((entry) => `  ['${escapeTsString(entry.fileKey)}', ${entry.importName}]`);

  const content = `${importLines.join('\n')}\n\nexport const GENERATED_SECTION_MANIFEST_ENTRIES: [string, unknown][] = [\n${sectionEntries.join(',\n')}\n];\n\nexport const GENERATED_QUESTION_SOURCE_ENTRIES: [string, unknown][] = [\n${questionEntries.join(',\n')}\n];\n`;

  await writeFile(generatedHelpSourcesPath, content, 'utf8');
}

async function validateAndGenerate() {
  const sectionFolders = await readJson(sectionsOrderPath);
  assert(Array.isArray(sectionFolders), 'Help section order must be an array.');

  const seenFolders = new Set();
  const seenSectionIds = new Map();
  const seenPaths = new Map();
  const usedIdentifiers = new Set();
  const sectionImports = [];
  const questionImports = [];

  for (const folderName of sectionFolders) {
    assert(typeof folderName === 'string' && folderName.length > 0, 'Help section folder names must be non-empty strings.');
    assert(!seenFolders.has(folderName), `Duplicate help section folder in sections-order.json: ${folderName}`);
    seenFolders.add(folderName);

    const sectionManifestPath = path.join(helpSectionsRoot, folderName, 'section.json');
    const sectionManifest = await readJson(sectionManifestPath);
    sectionImports.push({
      folderName,
      importName: createUniqueIdentifier(`${folderName} section manifest`, usedIdentifiers),
      importPath: toImportPath(sectionManifestPath)
    });

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
      questionImports.push({
        fileKey: `${folderName}/${questionFileName}`,
        importName: createUniqueIdentifier(`${folderName} ${questionFileName} question`, usedIdentifiers),
        importPath: toImportPath(questionFilePath)
      });

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

  await writeGeneratedHelpSources(sectionImports, questionImports);
}

async function main() {
  await validateAndGenerate();

  if (!watchMode) {
    return;
  }

  let rerunTimer = null;
  let running = false;
  let pending = false;

  const runOnce = async () => {
    if (running) {
      pending = true;
      return;
    }

    running = true;

    try {
      await validateAndGenerate();
      console.log('[help] regenerated generated-help-sources.ts');
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    } finally {
      running = false;

      if (pending) {
        pending = false;
        void runOnce();
      }
    }
  };

  const watcher = watch(helpSectionsRoot, { recursive: true }, () => {
    clearTimeout(rerunTimer);
    rerunTimer = setTimeout(() => {
      void runOnce();
    }, 100);
  });

  console.log('[help] watching help content files');

  const closeWatcher = () => {
    watcher.close();
    clearTimeout(rerunTimer);
    process.exit(0);
  };

  process.on('SIGINT', closeWatcher);
  process.on('SIGTERM', closeWatcher);

  await new Promise(() => {});
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});