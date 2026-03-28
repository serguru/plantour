import { TripActivityDto } from '../../services/trip-activity-service';

export interface TripNoteActivityOption {
  id: string;
  name: string;
}

interface TripNoteInlineRenderResult {
  html: string;
  imageHtml: string[];
}

export function buildTripNoteActivityOptions(
  publicActivities: TripActivityDto[],
  personalActivities: TripActivityDto[]
): TripNoteActivityOption[] {
  return [...publicActivities, ...personalActivities]
    .map((activity) => ({
      id: activity.id,
      name: buildTripNoteActivityLabel(activity),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function normalizeTripNoteContentJson(contentJson: string | null | undefined): string | null {
  if (!contentJson) {
    return null;
  }

  const parsed = parseTripNoteContentJson(contentJson);
  if (!parsed || !hasMeaningfulTripNoteNode(parsed)) {
    return null;
  }

  return JSON.stringify(parsed);
}

export function hasMeaningfulTripNoteContentJson(contentJson: string | null | undefined): boolean {
  const parsed = parseTripNoteContentJson(contentJson);
  return !!parsed && hasMeaningfulTripNoteNode(parsed);
}

export function renderTripNoteContentHtml(contentJson: string | null | undefined): string {
  const parsed = parseTripNoteContentJson(contentJson);
  if (!parsed) {
    return '';
  }

  return renderTripNoteNode(parsed);
}

function parseTripNoteContentJson(contentJson: string | null | undefined): any | null {
  if (!contentJson) {
    return null;
  }

  try {
    return JSON.parse(contentJson);
  } catch {
    return null;
  }
}

function hasMeaningfulTripNoteNode(node: any): boolean {
  if (!node || typeof node !== 'object') {
    return false;
  }

  if (node.type === 'text' && typeof node.text === 'string' && node.text.trim().length > 0) {
    return true;
  }

  if (node.type === 'image' && typeof node.attrs?.src === 'string' && node.attrs.src.trim().length > 0) {
    return true;
  }

  if (!Array.isArray(node.content)) {
    return false;
  }

  return node.content.some((child: any) => hasMeaningfulTripNoteNode(child));
}

function buildTripNoteActivityLabel(activity: TripActivityDto): string {
  const parts = [activity.name.trim()];
  if (activity.activity?.trim()) {
    parts.push(activity.activity.trim());
  }

  const scope = activity.tripUserId ? 'Personal' : 'Shared';
  return `${scope}: ${parts.join(' · ')}`;
}

function renderTripNoteNode(node: any): string {
  if (!node || typeof node !== 'object') {
    return '';
  }

  switch (node.type) {
    case 'doc':
      return renderChildren(node.content);
    case 'paragraph': {
      const inline = renderInlineChildren(node.content);
      const paragraphHtml = inline.html ? `<p>${inline.html}</p>` : '';
      return paragraphHtml + inline.imageHtml.join('');
    }
    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level) || 2, 2), 4);
      const inline = renderInlineChildren(node.content);
      const headingHtml = inline.html ? `<h${level}>${inline.html}</h${level}>` : '';
      return headingHtml + inline.imageHtml.join('');
    }
    case 'bulletList':
      return `<ul>${renderChildren(node.content)}</ul>`;
    case 'orderedList':
      return `<ol>${renderChildren(node.content)}</ol>`;
    case 'listItem':
      return `<li>${renderChildren(node.content)}</li>`;
    case 'blockquote':
      return `<blockquote>${renderChildren(node.content)}</blockquote>`;
    case 'codeBlock':
      return `<pre><code>${escapeHtml(extractText(node))}</code></pre>`;
    case 'horizontalRule':
      return '<hr />';
    case 'image':
      return renderImageHtml(node.attrs?.src, node.attrs?.alt);
    default:
      return renderChildren(node.content);
  }
}

function renderChildren(content: any): string {
  if (!Array.isArray(content)) {
    return '';
  }

  return content.map((child) => renderTripNoteNode(child)).join('');
}

function renderInlineChildren(content: any): TripNoteInlineRenderResult {
  if (!Array.isArray(content)) {
    return { html: '', imageHtml: [] };
  }

  const html: string[] = [];
  const imageHtml: string[] = [];

  for (const child of content) {
    if (!child || typeof child !== 'object') {
      continue;
    }

    if (child.type === 'text') {
      const textValue = typeof child.text === 'string' ? child.text : '';
      let textHtml = escapeHtml(textValue);

      const marks = Array.isArray(child.marks) ? child.marks : [];
      for (const mark of marks) {
        if (!mark || typeof mark !== 'object') {
          continue;
        }

        switch (mark.type) {
          case 'bold':
            textHtml = `<strong>${textHtml}</strong>`;
            break;
          case 'italic':
            textHtml = `<em>${textHtml}</em>`;
            break;
          case 'underline':
            textHtml = `<u>${textHtml}</u>`;
            break;
          case 'strike':
            textHtml = `<s>${textHtml}</s>`;
            break;
          case 'code':
            textHtml = `<code>${textHtml}</code>`;
            break;
          case 'link': {
            const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : '';
            if (href) {
              textHtml = `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer nofollow">${textHtml}</a>`;
              if (isImageUrl(href)) {
                imageHtml.push(renderImageHtml(href, textValue || 'Note image'));
              }
            }
            break;
          }
        }
      }

      html.push(textHtml);
      continue;
    }

    if (child.type === 'hardBreak') {
      html.push('<br />');
      continue;
    }

    if (child.type === 'image') {
      imageHtml.push(renderImageHtml(child.attrs?.src, child.attrs?.alt));
    }
  }

  return {
    html: html.join(''),
    imageHtml,
  };
}

function renderImageHtml(src: unknown, alt: unknown): string {
  if (typeof src !== 'string' || !src.trim()) {
    return '';
  }

  return `<figure class="trip-note-rendered-image"><img src="${escapeAttribute(src)}" alt="${escapeAttribute(
    typeof alt === 'string' ? alt : 'Trip note image'
  )}" referrerpolicy="no-referrer" loading="lazy" /></figure>`;
}

function extractText(node: any): string {
  if (!node || typeof node !== 'object') {
    return '';
  }

  if (node.type === 'text') {
    return typeof node.text === 'string' ? node.text : '';
  }

  if (!Array.isArray(node.content)) {
    return '';
  }

  return node.content.map((child: any) => extractText(child)).join('');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function isImageUrl(value: string): boolean {
  return /\.(png|jpe?g|gif|webp|bmp|svg)(?:[?#].*)?$/i.test(value);
}