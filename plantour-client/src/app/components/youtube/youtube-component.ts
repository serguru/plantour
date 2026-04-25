import { Component, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Extracts a YouTube video ID from various YouTube URL formats.
 */
function extractYoutubeId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    // https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // https://youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // https://www.youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // https://www.youtube.com/shorts/VIDEO_ID
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

@Component({
  selector: 'app-youtube',
  standalone: true,
  imports: [],
  templateUrl: './youtube-component.html',
  styleUrl: './youtube-component.scss',
})
export class YoutubeComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly sanitizer = inject(DomSanitizer);

  /** The full YouTube URL (e.g. https://www.youtube.com/watch?v=VIDEO_ID). */
  @Input({ required: true }) url!: string;

  /** Visible link text / caption. */
  @Input({ required: true }) caption!: string;

  /** Optional description for the VideoObject schema. Falls back to caption. */
  @Input() description?: string;

  /** Optional thumbnail URL for the VideoObject schema. */
  @Input() thumbnailUrl?: string;

  /** Optional upload date (ISO string) for the VideoObject schema. */
  @Input() uploadDate?: string;

  /** Optional CSS class added to the anchor element. */
  @Input() linkClass?: string;

  /** Whether to show the YouTube icon before the caption. Defaults to true. */
  @Input() showIcon = true;

  /** The YouTube SVG icon as SafeHtml. */
  protected youtubeIcon: SafeHtml = '';

  /** The extracted video ID (used for schema and embed URL). */
  protected videoId: string | null = null;

  /** The script element injected into <head>, so we can clean it up. */
  private scriptEl: HTMLScriptElement | null = null;

  ngOnInit(): void {
    this.videoId = extractYoutubeId(this.url);
    this.youtubeIcon = this.sanitizer.bypassSecurityTrustHtml(YOUTUBE_ICON_SVG);

    if (this.videoId) {
      this.injectVideoObjectSchema();
    }
  }

  ngOnDestroy(): void {
    this.removeSchema();
  }

  /**
   * Builds and injects a VideoObject JSON-LD script into the document <head>.
   * This structured data helps search engines understand the video content
   * and can enable rich search results (video carousels, thumbnails, etc.).
   *
   * @see https://developers.google.com/search/docs/appearance/structured-data/video
   */
  private injectVideoObjectSchema(): void {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: this.caption,
      description: this.description ?? this.caption,
      contentUrl: this.url,
      embedUrl: `https://www.youtube.com/embed/${this.videoId}`,
    };

    if (this.thumbnailUrl) {
      schema['thumbnailUrl'] = this.thumbnailUrl;
    }

    if (this.uploadDate) {
      schema['uploadDate'] = this.uploadDate;
    }

    const head = this.document.head;
    if (!head) return;

    this.scriptEl = this.document.createElement('script');
    this.scriptEl.type = 'application/ld+json';
    this.scriptEl.textContent = JSON.stringify(schema);
    head.appendChild(this.scriptEl);
  }

  /** Removes the injected schema script from <head>. */
  private removeSchema(): void {
    if (this.scriptEl && this.document.head.contains(this.scriptEl)) {
      this.document.head.removeChild(this.scriptEl);
    }
    this.scriptEl = null;
  }
}

/** Inline SVG for the YouTube icon (play button on dark background). */
const YOUTUBE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
</svg>`;
