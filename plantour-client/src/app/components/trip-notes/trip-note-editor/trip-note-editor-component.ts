import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trip-note-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-note-editor-component.html',
  styleUrl: './trip-note-editor-component.scss',
})
export class TripNoteEditorComponent implements OnChanges {
  @Input() contentJson: string | null = null;
  @Input() readOnly = false;
  @Output() contentJsonChange = new EventEmitter<string | null>();
  textValue = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contentJson']) {
      this.textValue = this.contentJsonToPlainText(this.contentJson);
    }
  }

  onTextInput(value: string): void {
    this.textValue = value;
    this.contentJsonChange.emit(this.plainTextToContentJson(value));
  }

  private plainTextToContentJson(value: string): string | null {
    const normalized = value.replace(/\r\n/g, '\n').trim();
    if (!normalized) {
      return null;
    }

    const paragraphs = normalized
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0)
      .map((paragraph) => ({
        type: 'paragraph',
        content: this.buildParagraphContent(paragraph),
      }));

    if (paragraphs.length === 0) {
      return null;
    }

    return JSON.stringify({
      type: 'doc',
      content: paragraphs,
    });
  }

  private buildParagraphContent(paragraph: string): Array<Record<string, unknown>> {
    const lines = paragraph.split('\n');
    const content: Array<Record<string, unknown>> = [];

    lines.forEach((line, index) => {
      if (line.length > 0) {
        content.push({
          type: 'text',
          text: line,
        });
      }

      if (index < lines.length - 1) {
        content.push({ type: 'hardBreak' });
      }
    });

    return content.length > 0 ? content : [{ type: 'text', text: '' }];
  }

  private contentJsonToPlainText(contentJson: string | null): string {
    if (!contentJson) {
      return '';
    }

    try {
      return this.extractNodeText(JSON.parse(contentJson)).trim();
    } catch {
      return '';
    }
  }

  private extractNodeText(node: any): string {
    if (!node || typeof node !== 'object') {
      return '';
    }

    switch (node.type) {
      case 'doc':
        return this.joinChildText(node.content, '\n\n');
      case 'paragraph':
      case 'heading':
      case 'blockquote':
      case 'codeBlock':
        return this.joinChildText(node.content, '');
      case 'bulletList':
        return this.joinListText(node.content, '- ');
      case 'orderedList':
        return this.joinOrderedListText(node.content);
      case 'listItem':
        return this.joinChildText(node.content, ' ');
      case 'text':
        return typeof node.text === 'string' ? node.text : '';
      case 'hardBreak':
        return '\n';
      case 'image':
        return typeof node.attrs?.src === 'string' ? `[Image: ${node.attrs.src}]` : '';
      case 'horizontalRule':
        return '---';
      default:
        return this.joinChildText(node.content, '');
    }
  }

  private joinChildText(content: any, separator: string): string {
    if (!Array.isArray(content)) {
      return '';
    }

    return content.map((child) => this.extractNodeText(child)).join(separator);
  }

  private joinListText(content: any, prefix: string): string {
    if (!Array.isArray(content)) {
      return '';
    }

    return content
      .map((child) => `${prefix}${this.extractNodeText(child).trim()}`.trimEnd())
      .filter((line) => line.length > 0)
      .join('\n');
  }

  private joinOrderedListText(content: any): string {
    if (!Array.isArray(content)) {
      return '';
    }

    return content
      .map((child, index) => `${index + 1}. ${this.extractNodeText(child).trim()}`.trimEnd())
      .filter((line) => line.length > 0)
      .join('\n');
  }
}