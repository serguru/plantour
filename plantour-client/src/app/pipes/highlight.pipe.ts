import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'highlight', standalone: true, pure: true })
export class HighlightPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(text: string | null | undefined, term: string | null | undefined, enabled = true): SafeHtml {
    if (!text) return '';
    if (!term?.trim() || !enabled) return text;

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const result = text.replace(regex, match => `<mark class="search-highlight">${match}</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
}
