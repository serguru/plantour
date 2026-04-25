# YoutubeComponent — Usage Guide

## Overview

[`YoutubeComponent`](youtube-component.ts) is a standalone Angular component that renders an SEO-friendly anchor link to a YouTube video. It opens the video in a new tab and automatically injects [VideoObject](https://developers.google.com/search/docs/appearance/structured-data/video) JSON-LD structured data into the document `<head>` for better search engine visibility.

---

## Installation

No additional registration is needed — the component is **standalone** and can be imported directly into any other standalone component or module.

```typescript
import { YoutubeComponent } from './components/youtube/youtube-component';
```

Then add it to the `imports` array of your component:

```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [YoutubeComponent],
  // ...
})
```

---

## Basic Usage

```html
<app-youtube
  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  caption="How to Plan Your Trip with Plantour"
></app-youtube>
```

This renders:

```html
<a class="youtube-link" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
   target="_blank" rel="noopener noreferrer"
   aria-label="Watch: How to Plan Your Trip with Plantour">
  <span class="youtube-icon"><svg>…</svg></span>
  <span class="youtube-caption">How to Plan Your Trip with Plantour</span>
</a>
```

And injects into `<head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "How to Plan Your Trip with Plantour",
  "description": "How to Plan Your Trip with Plantour",
  "contentUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
}
</script>
```

---

## Inputs Reference

| Input | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| [`url`](youtube-component.ts:44) | `string` | ✅ Yes | — | Full YouTube URL. Supports all common formats (see below). |
| [`caption`](youtube-component.ts:47) | `string` | ✅ Yes | — | Visible link text. Also used as the `name` in VideoObject schema. |
| [`description`](youtube-component.ts:50) | `string` | ❌ No | `caption` | Longer description for the VideoObject schema. Recommended for SEO. |
| [`thumbnailUrl`](youtube-component.ts:53) | `string` | ❌ No | — | Thumbnail URL for the VideoObject schema (e.g. `https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg`). |
| [`uploadDate`](youtube-component.ts:56) | `string` | ❌ No | — | Upload date in ISO 8601 format (e.g. `"2025-01-15"`). Adds `uploadDate` to the schema. |
| [`linkClass`](youtube-component.ts:59) | `string` | ❌ No | — | Extra CSS class(es) appended to the anchor element. |
| [`showIcon`](youtube-component.ts:62) | `boolean` | ❌ No | `true` | Set to `false` to hide the YouTube icon. |

---

## Supported URL Formats

The component automatically extracts the video ID from these formats:

| Format | Example |
|--------|---------|
| `youtube.com/watch?v=` | `https://www.youtube.com/watch?v=dQw4w9WgXcQ` |
| `youtu.be/` | `https://youtu.be/dQw4w9WgXcQ` |
| `youtube.com/embed/` | `https://www.youtube.com/embed/dQw4w9WgXcQ` |
| `youtube.com/shorts/` | `https://www.youtube.com/shorts/dQw4w9WgXcQ` |

If the URL doesn't match any known pattern, the link still works — the VideoObject schema simply won't be injected (since `embedUrl` cannot be built).

---

## SEO Best Practices

### 1. Always provide a `description`

The `description` is used in the VideoObject schema. Google may display it in rich search results. If omitted, it falls back to `caption`.

```html
<app-youtube
  url="https://www.youtube.com/watch?v=abc123"
  caption="Top 10 Hiking Trails in California"
  description="Explore the most scenic hiking trails across California, from Yosemite to the Pacific Coast. Includes trail lengths, difficulty levels, and pro tips."
></app-youtube>
```

### 2. Provide a `thumbnailUrl` when possible

Thumbnails make video rich results more visually appealing. Use YouTube's standard thumbnail URLs:

```
https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg
```

```html
<app-youtube
  url="https://www.youtube.com/watch?v=abc123"
  caption="Top 10 Hiking Trails in California"
  thumbnailUrl="https://img.youtube.com/vi/abc123/maxresdefault.jpg"
></app-youtube>
```

### 3. Set `uploadDate` for freshness signals

Search engines consider recency. If you know when the video was published, include it:

```html
<app-youtube
  url="https://www.youtube.com/watch?v=abc123"
  caption="Top 10 Hiking Trails in California"
  uploadDate="2025-03-20"
></app-youtube>
```

### 4. Use descriptive, keyword-rich captions

The `caption` becomes the `name` property in VideoObject schema. Make it descriptive and include relevant keywords naturally.

---

## Styling

The component uses the project's CSS custom properties for consistent theming:

| CSS Variable | Default | Used for |
|-------------|---------|----------|
| `--primary-color` | `#3A9AA8` | Link text color |
| `--primary-color-light` | `#4DB8C4` | Link hover color |
| `--font-ui` | `"Roboto", system-ui, sans-serif` | Link font family |
| `--font-size-ui` | `1rem` | Link font size |
| `--line-height-ui` | `1.6` | Link line height |
| `--letter-spacing-ui` | `0.15px` | Link letter spacing |

The YouTube icon is colored `#ff0000` (YouTube brand red).

### Custom CSS via `linkClass`

```html
<app-youtube
  url="https://www.youtube.com/watch?v=abc123"
  caption="Watch the Tutorial"
  linkClass="my-custom-link"
></app-youtube>
```

```scss
.my-custom-link {
  font-weight: 600;
  font-size: 1.1rem;
}
```

---

## Accessibility

- The link has `target="_blank"` with `rel="noopener noreferrer"` for security and performance.
- An `aria-label` is automatically set to `"Watch: {caption}"`.
- The YouTube SVG icon has `aria-hidden="true"` so it's ignored by screen readers.
- A visible `:focus-visible` outline is applied for keyboard navigation.

---

## Full Example

```html
<app-youtube
  url="https://youtu.be/abc123def45"
  caption="Complete Guide to Plantour Itinerary Builder"
  description="Learn how to create, customize, and share travel itineraries using Plantour's powerful itinerary builder. Covers drag-and-drop planning, budget tracking, and collaboration features."
  thumbnailUrl="https://img.youtube.com/vi/abc123def45/maxresdefault.jpg"
  uploadDate="2025-06-01"
  linkClass="video-link"
  [showIcon]="true"
></app-youtube>
```

---

## How VideoObject Schema Helps SEO

Google's [VideoObject structured data](https://developers.google.com/search/docs/appearance/structured-data/video) enables:

1. **Video rich results** — Videos can appear with a thumbnail, title, and description in search results.
2. **Video carousels** — Multiple videos can appear in a horizontal carousel.
3. **Enhanced visibility** — Videos may be featured in Google's Video tab and "Videos" section of search results.

The schema is injected as a `<script type="application/ld+json">` element in the `<head>` and is automatically cleaned up when the component is destroyed (no stale schema left behind).
