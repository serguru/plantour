import { watch } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, '..');
const generatedOutputPath = path.join(clientRoot, 'src', 'app', 'services', 'generated-public-page-documents.ts');
const watchMode = process.argv.includes('--watch');

const publicPageDefinitions = [
  {
    id: 'page/home',
    title: 'Plantour Packing Lists & Travel Planning App',
    summary: 'Plan trips, build packing lists, coordinate group travel, and get AI-powered packing suggestions with Plantour.',
    description: 'Plantour landing page for packing lists, trip planning, group coordination, and AI packing recommendations.',
    url: '/',
    breadcrumbText: 'Home',
    keywords: ['plantour', 'packing', 'travel planning', 'landing', 'packing lists', 'ai'],
    sourceLabel: 'Page',
    htmlFiles: [
      'src/app/components/landing-new-user/landing-new-user.component.html'
    ],
    extraText: [
      'Plan less.',
      'Travel more.',
      'One place for your packing lists, todos, and shared group details.',
      'Keep trip details organized',
      'Keep travelers, packing items, tasks, and trip details together in one clear workspace, so nothing gets lost between notes, chats, and spreadsheets.',
      'Coordinate group travel easily',
      'Share packing lists and tasks with family or travel companions, so everyone knows what to bring, what to do, and what is already covered.',
      'Pack with fewer forgotten items',
      'Build clear packing lists, track what is packed and what is still missing, and keep everything ready before the trip instead of checking scattered notes at the last minute.',
      'Artificial Intelligence',
      'Get intelligent AI suggestions based on your trip destination and weather. Pack faster and avoid forgetting essentials.',
      'Templates',
      'Reuse proven packing setups for future journeys. Start in seconds instead of planning from scratch.',
      'Coming soon',
      'Plantour is growing beyond packing lists with upcoming tools for route planning, travel notes, activities, and expense tracking.'
    ]
  },
  {
    id: 'page/contact',
    title: 'Contact',
    summary: 'Contact Plantour support for questions, bug reports, feature requests, feedback, or partnerships.',
    description: 'Contact page for Plantour support and business inquiries.',
    url: '/contact',
    breadcrumbText: 'Home / Contact',
    keywords: ['contact', 'support', 'feedback', 'bug report', 'feature request'],
    sourceLabel: 'Page',
    htmlFiles: [
      'src/app/components/features/contact/contact-component.html'
    ],
    extraText: [
      'General Inquiry',
      'Bug Report',
      'Feature Request',
      'Feedback',
      'Partnership',
      'Other',
      'Message sent',
      'We have received your message and will get back to you soon.'
    ]
  },
  {
    id: 'page/privacy',
    title: 'Privacy Policy',
    summary: 'Learn what Plantour collects, how the data is used, and how deletion requests work.',
    description: 'Plantour privacy policy covering collection, usage, payments, retention, and deletion requests.',
    url: '/privacy',
    breadcrumbText: 'Home / Privacy Policy',
    keywords: ['privacy', 'policy', 'data', 'retention', 'deletion'],
    sourceLabel: 'Page',
    htmlFiles: [
      'src/app/components/features/privacy/privacy-component/privacy-component.html'
    ],
    extraText: []
  },
  {
    id: 'page/terms',
    title: 'Terms of Usage',
    summary: 'Read Plantour terms covering accounts, trial access, billing, acceptable use, and limitations.',
    description: 'Plantour terms of usage for eligibility, accounts, billing, acceptable use, and limitations.',
    url: '/terms',
    breadcrumbText: 'Home / Terms of Usage',
    keywords: ['terms', 'usage', 'billing', 'trial', 'accounts'],
    sourceLabel: 'Page',
    htmlFiles: [
      'src/app/components/features/terms/terms-component/terms-component.html'
    ],
    extraText: []
  },
  {
    id: 'page/public-templates',
    title: 'Plantour Packing Templates by Activity, Age & Temperature',
    summary: 'Browse public packing templates filtered by activity, age range, temperature, and category.',
    description: 'Public Plantour packing templates page with activity, age, temperature, and category filters.',
    url: '/packing-list-generator/templates',
    breadcrumbText: 'Home / Public Templates',
    keywords: ['public templates', 'packing templates', 'activity', 'age range', 'temperature'],
    sourceLabel: 'Public templates',
    htmlFiles: [
      'src/app/components/features/public-templates/public-templates-component.html'
    ],
    extraText: [
      'Templates',
      'Search',
      'Activity',
      'Age range',
      'Temperature',
      'Category'
    ]
  }
];

function escapeTsString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function extractAttributeText(source) {
  const values = [];
  const patterns = [
    /\bplaceholder\s*=\s*"([^"]+)"/gi,
    /\bplaceholder\s*=\s*'([^']+)'/gi,
    /\btitle\s*=\s*"([^"]+)"/gi,
    /\btitle\s*=\s*'([^']+)'/gi,
    /\balt\s*=\s*"([^"]+)"/gi,
    /\balt\s*=\s*'([^']+)'/gi,
    /\baria-label\s*=\s*"([^"]+)"/gi,
    /\baria-label\s*=\s*'([^']+)'/gi
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      values.push(match[1]);
    }
  }

  return values.join(' ');
}

function stripTemplateSyntax(source) {
  return source
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/\{\{[\s\S]*?\}\}/g, ' ')
    .replace(/@(?:if|else\s+if|else|for|switch|case|default|defer|placeholder|loading|error|empty)\b[^\{]*\{/g, ' ')
    .replace(/(^|\s)\}/g, ' ');
}

function htmlToSearchText(source) {
  const attributeText = extractAttributeText(source);
  const normalizedSource = stripTemplateSyntax(source)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/\s*(p|div|section|article|header|footer|main|form|label|li|ul|ol|h1|h2|h3|h4|h5|h6|button|a|span|small|textarea|option)\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  return normalizeWhitespace(decodeHtmlEntities(`${attributeText} ${normalizedSource}`));
}

async function buildGeneratedDocuments() {
  const documents = [];

  for (const definition of publicPageDefinitions) {
    const htmlParts = [];

    for (const relativeFilePath of definition.htmlFiles) {
      const absoluteFilePath = path.join(clientRoot, relativeFilePath);
      const content = await readFile(absoluteFilePath, 'utf8');
      htmlParts.push(htmlToSearchText(content));
    }

    const searchText = normalizeWhitespace([
      definition.title,
      definition.summary,
      definition.description,
      definition.breadcrumbText,
      definition.keywords.join(' '),
      ...definition.extraText,
      ...htmlParts
    ].join(' '));

    documents.push({
      id: definition.id,
      title: definition.title,
      summary: definition.summary,
      description: definition.description,
      url: definition.url,
      breadcrumbText: definition.breadcrumbText,
      keywords: definition.keywords,
      searchText,
      sourceLabel: definition.sourceLabel
    });
  }

  return documents;
}

async function writeGeneratedDocuments() {
  const documents = await buildGeneratedDocuments();
  const entries = documents.map((document) => `  {\n    id: '${escapeTsString(document.id)}',\n    title: '${escapeTsString(document.title)}',\n    summary: '${escapeTsString(document.summary)}',\n    description: '${escapeTsString(document.description)}',\n    url: '${escapeTsString(document.url)}',\n    breadcrumbText: '${escapeTsString(document.breadcrumbText)}',\n    keywords: [${document.keywords.map((keyword) => `'${escapeTsString(keyword)}'`).join(', ')}],\n    searchText: '${escapeTsString(document.searchText)}',\n    sourceLabel: '${escapeTsString(document.sourceLabel)}'\n  }`);

  const content = `export const GENERATED_PUBLIC_PAGE_DOCUMENTS = [\n${entries.join(',\n')}\n];\n`;
  await writeFile(generatedOutputPath, content, 'utf8');
}

async function main() {
  await writeGeneratedDocuments();

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
      await writeGeneratedDocuments();
      console.log('[search] regenerated generated-public-page-documents.ts');
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

  const watchTargets = new Set();
  for (const definition of publicPageDefinitions) {
    for (const relativeFilePath of definition.htmlFiles) {
      watchTargets.add(path.join(clientRoot, relativeFilePath));
    }
  }

  const watchers = Array.from(watchTargets).map((watchTarget) =>
    watch(watchTarget, () => {
      clearTimeout(rerunTimer);
      rerunTimer = setTimeout(() => {
        void runOnce();
      }, 100);
    })
  );

  console.log('[search] watching public search source files');

  const closeWatchers = () => {
    for (const watcher of watchers) {
      watcher.close();
    }
    clearTimeout(rerunTimer);
    process.exit(0);
  };

  process.on('SIGINT', closeWatchers);
  process.on('SIGTERM', closeWatchers);

  await new Promise(() => {});
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});