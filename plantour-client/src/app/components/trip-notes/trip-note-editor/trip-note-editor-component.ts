import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

@Component({
  selector: 'app-trip-note-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-note-editor-component.html',
  styleUrl: './trip-note-editor-component.scss',
})
export class TripNoteEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() contentJson: string | null = null;
  @Input() readOnly = false;
  @Output() contentJsonChange = new EventEmitter<string | null>();

  @ViewChild('editorHost') private editorHost?: ElementRef<HTMLDivElement>;

  private editor: Editor | null = null;

  ngAfterViewInit(): void {
    if (!this.editorHost) {
      return;
    }

    this.editor = new Editor({
      element: this.editorHost.nativeElement,
      editable: !this.readOnly,
      extensions: [
        StarterKit,
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
        }),
        Image,
      ],
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      editorProps: {
        attributes: {
          class: 'trip-note-editor__content ProseMirror',
        },
      },
      onUpdate: ({ editor }) => {
        this.contentJsonChange.emit(JSON.stringify(this.serializeContent(editor.getJSON())));
      },
    });

    void this.applyContentAsync(this.contentJson);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.editor) {
      return;
    }

    if (changes['readOnly']) {
      this.editor.setEditable(!this.readOnly);
    }

    if (changes['contentJson']) {
      void this.applyContentAsync(this.contentJson);
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  isActive(name: string, attributes?: Record<string, unknown>): boolean {
    return this.editor?.isActive(name, attributes) ?? false;
  }

  toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  toggleUnderline(): void {
    this.editor?.chain().focus().toggleUnderline().run();
  }

  toggleStrike(): void {
    this.editor?.chain().focus().toggleStrike().run();
  }

  toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  toggleHeading(level: 2 | 3): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  toggleBlockquote(): void {
    this.editor?.chain().focus().toggleBlockquote().run();
  }

  setLink(): void {
    const value = window.prompt('Enter link URL', 'https://');
    if (!value) {
      return;
    }

    this.editor?.chain().focus().extendMarkRange('link').setLink({ href: value.trim() }).run();
  }

  unsetLink(): void {
    this.editor?.chain().focus().unsetLink().run();
  }

  addImage(): void {
    const value = window.prompt('Enter image URL', 'https://');
    if (!value) {
      return;
    }

    const url = value.trim();
    if (!this.isPublicHttpUrl(url)) {
      window.alert('Enter a public image URL that starts with http:// or https://.');
      return;
    }

    this.editor?.chain().focus().setImage({ src: url, alt: 'Trip note image' }).run();
  }

  private parseContent(contentJson: string | null): Record<string, unknown> {
    if (!contentJson) {
      return { type: 'doc', content: [{ type: 'paragraph' }] };
    }

    try {
      return JSON.parse(contentJson) as Record<string, unknown>;
    } catch {
      return { type: 'doc', content: [{ type: 'paragraph' }] };
    }
  }

  private async applyContentAsync(contentJson: string | null): Promise<void> {
    if (!this.editor) {
      return;
    }

    const nextContent = this.parseContent(contentJson);
    const currentContent = JSON.stringify(this.serializeContent(this.editor.getJSON()));
    const nextContentSerialized = JSON.stringify(this.serializeContent(nextContent));
    if (currentContent !== nextContentSerialized) {
      this.editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }

  private serializeContent(content: any): Record<string, unknown> {
    return this.cloneContent(content);
  }

  private cloneContent(content: Record<string, unknown>): Record<string, unknown> {
    return JSON.parse(JSON.stringify(content)) as Record<string, unknown>;
  }

  private isPublicHttpUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}