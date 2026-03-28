import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { DropboxBrowseEntryDto, DropboxService } from '../../../services/dropbox-service';
import { isDropboxImageSource, isDropboxPrivateImageSource } from '../trip-note-utils';

const TripNoteImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      dataSource: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-source'),
        renderHTML: (attributes) => attributes['dataSource'] ? { 'data-source': attributes['dataSource'] } : {},
      },
    };
  },
});

@Component({
  selector: 'app-trip-note-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-note-editor-component.html',
  styleUrl: './trip-note-editor-component.scss',
})
export class TripNoteEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() contentJson: string | null = null;
  @Input() dropboxSelection: DropboxBrowseEntryDto | null = null;
  @Input() readOnly = false;
  @Output() browseDropbox = new EventEmitter<void>();
  @Output() contentJsonChange = new EventEmitter<string | null>();
  @Output() dropboxSelectionHandled = new EventEmitter<void>();

  @ViewChild('editorHost') private editorHost?: ElementRef<HTMLDivElement>;

  private readonly dropboxService = inject(DropboxService);
  private editor: Editor | null = null;
  private readonly objectUrls: string[] = [];
  private contentVersion = 0;
  private lastHandledDropboxSelectionKey = '';

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
        TripNoteImage,
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

    void this.initializeEditorContentAsync();
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

    if (changes['dropboxSelection']) {
      if (!this.dropboxSelection) {
        this.lastHandledDropboxSelectionKey = '';
      } else {
        void this.insertDropboxSelectionAsync(this.dropboxSelection);
      }
    }
  }

  ngOnDestroy(): void {
    this.revokeObjectUrls();
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

    this.editor?.chain().focus().setImage({ src: value.trim(), alt: 'Trip note image' }).run();
  }

  openDropboxBrowser(): void {
    this.browseDropbox.emit();
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

    const currentVersion = ++this.contentVersion;
    this.revokeObjectUrls();

    const nextContent = this.parseContent(contentJson);
    const contentForEditor = this.cloneContent(nextContent);
    const dropboxSources = this.collectDropboxSources(contentForEditor);
    const resolvedMap = new Map<string, string>();

    for (const source of dropboxSources) {
      const objectUrl = await this.resolveDropboxImageObjectUrl(source);
      if (objectUrl) {
        resolvedMap.set(source, objectUrl);
      }
    }

    if (currentVersion !== this.contentVersion) {
      for (const objectUrl of resolvedMap.values()) {
        URL.revokeObjectURL(objectUrl);
      }

      return;
    }

    for (const objectUrl of resolvedMap.values()) {
      this.objectUrls.push(objectUrl);
    }

    this.applyResolvedDropboxSources(contentForEditor, resolvedMap);

    const currentContent = JSON.stringify(this.serializeContent(this.editor.getJSON()));
    const nextContentSerialized = JSON.stringify(this.serializeContent(contentForEditor));
    if (currentContent !== nextContentSerialized) {
      this.editor.commands.setContent(contentForEditor, { emitUpdate: false });
    }
  }

  private async initializeEditorContentAsync(): Promise<void> {
    await this.applyContentAsync(this.contentJson);

    if (this.dropboxSelection) {
      await this.insertDropboxSelectionAsync(this.dropboxSelection);
    }
  }

  private async resolveDropboxImageObjectUrl(source: string): Promise<string> {
    return await firstValueFrom(
      this.dropboxService.getImage(source).pipe(
        map((blob) => URL.createObjectURL(blob)),
        catchError(() => of(''))
      )
    );
  }

  private async insertDropboxSelectionAsync(entry: DropboxBrowseEntryDto): Promise<void> {
    const source = entry.source?.trim();
    if (!this.editor || !source) {
      return;
    }

    const selectionKey = `${entry.id ?? ''}:${source}`;
    if (selectionKey === this.lastHandledDropboxSelectionKey) {
      return;
    }

    this.lastHandledDropboxSelectionKey = selectionKey;
    const objectUrl = await this.resolveDropboxImageObjectUrl(source);
    this.editor.chain().focus().insertContent({
      type: 'image',
      attrs: {
        src: objectUrl || '',
        alt: entry.name || 'Dropbox image',
        dataSource: source,
      },
    }).run();
    this.dropboxSelectionHandled.emit();
  }

  private collectDropboxSources(node: any): string[] {
    const sources = new Set<string>();
    this.collectDropboxSourcesRecursive(node, sources);
    return [...sources];
  }

  private collectDropboxSourcesRecursive(node: any, sources: Set<string>): void {
    if (!node || typeof node !== 'object') {
      return;
    }

    const dataSource = typeof node.attrs?.dataSource === 'string' ? node.attrs.dataSource : null;
    const src = typeof node.attrs?.src === 'string' ? node.attrs.src : null;

    if (node.type === 'image') {
      if (dataSource && isDropboxImageSource(dataSource)) {
        sources.add(dataSource);
      } else if (src && isDropboxImageSource(src)) {
        sources.add(src);
      }
    }

    if (!Array.isArray(node.content)) {
      return;
    }

    for (const child of node.content) {
      this.collectDropboxSourcesRecursive(child, sources);
    }
  }

  private applyResolvedDropboxSources(node: any, resolvedMap: Map<string, string>): void {
    if (!node || typeof node !== 'object') {
      return;
    }

    if (node.type === 'image' && node.attrs && typeof node.attrs === 'object') {
      const dataSource = typeof node.attrs.dataSource === 'string' ? node.attrs.dataSource : null;
      const src = typeof node.attrs.src === 'string' ? node.attrs.src : null;
      const source = dataSource && isDropboxImageSource(dataSource)
        ? dataSource
        : src && isDropboxImageSource(src)
          ? src
          : null;

      if (source) {
        node.attrs.dataSource = source;
        const resolvedSource = resolvedMap.get(source);
        if (resolvedSource) {
          node.attrs.src = resolvedSource;
        } else if (isDropboxPrivateImageSource(source)) {
          node.attrs.src = '';
        }
      }
    }

    if (!Array.isArray(node.content)) {
      return;
    }

    for (const child of node.content) {
      this.applyResolvedDropboxSources(child, resolvedMap);
    }
  }

  private serializeContent(content: any): Record<string, unknown> {
    const clone = this.cloneContent(content);
    this.serializeContentRecursive(clone);
    return clone;
  }

  private serializeContentRecursive(node: any): void {
    if (!node || typeof node !== 'object') {
      return;
    }

    if (node.type === 'image' && node.attrs && typeof node.attrs === 'object') {
      const dataSource = typeof node.attrs.dataSource === 'string' ? node.attrs.dataSource : null;
      if (dataSource && isDropboxImageSource(dataSource)) {
        node.attrs.src = dataSource;
        delete node.attrs.dataSource;
      }
    }

    if (!Array.isArray(node.content)) {
      return;
    }

    for (const child of node.content) {
      this.serializeContentRecursive(child);
    }
  }

  private cloneContent(content: Record<string, unknown>): Record<string, unknown> {
    return JSON.parse(JSON.stringify(content)) as Record<string, unknown>;
  }

  private revokeObjectUrls(): void {
    while (this.objectUrls.length > 0) {
      const objectUrl = this.objectUrls.pop();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    }
  }
}