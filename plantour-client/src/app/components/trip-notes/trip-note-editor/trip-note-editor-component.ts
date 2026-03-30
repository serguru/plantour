import { CommonModule, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, EventEmitter, inject, Input, NgZone, OnChanges, OnInit, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { DialogModule } from 'primeng/dialog';
import { HeaderButtonConfig, MenuConfig } from '../../form/form-header/form-header';
import { getMessageFromError } from '../../../helpers/utils';
import { MessagesService } from '../../../services/messages-service';
import {
  TripNoteEditorConfig,
  TripNoteEditorDropboxBrowserEntry,
  TripNoteEditorService,
} from '../../../services/trip-note-editor-service';
import { createTripNoteEditorContentJson, getTripNoteEditorHtml } from '../trip-note-utils';

export interface TripNoteEditorViewState {
  headerButtons: HeaderButtonConfig[];
  menuItems: MenuConfig[];
  dropboxStatusLabel: string;
  dropboxStatusSummary: string;
  dropboxDisplayName: string | null;
}

@Component({
  selector: 'app-trip-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule, DialogModule],
  templateUrl: './trip-note-editor-component.html',
  styleUrl: './trip-note-editor-component.scss',
})
export class TripNoteEditorComponent implements OnInit, OnChanges {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly tripNoteEditorService = inject(TripNoteEditorService);
  private readonly messagesService = inject(MessagesService);

  @Input() contentJson: string | null = null;
  @Input() readOnly = false;
  @Output() contentJsonChange = new EventEmitter<string | null>();
  @Output() connectDropboxRequested = new EventEmitter<void>();
  @Output() viewStateChange = new EventEmitter<TripNoteEditorViewState>();

  readonly isBrowser = isPlatformBrowser(this.platformId);

  editorHtml = '';
  editorApiKey = 'no-api-key';
  editorReady = false;
  dropboxEnabled = false;
  dropboxConnected = false;
  dropboxDisplayName: string | null = null;
  dropboxDialogVisible = false;
  dropboxBrowserLoading = false;
  dropboxCurrentPath = '';
  dropboxParentPath: string | null = null;
  dropboxEntries: TripNoteEditorDropboxBrowserEntry[] = [];
  init: Record<string, unknown> = {};

  private editorInstance: any | null = null;
  private lastEmittedContentJson: string | null = null;
  private hydrationVersion = 0;

  ngOnInit(): void {
    this.editorHtml = getTripNoteEditorHtml(this.contentJson);
    this.emitViewState();

    if (!this.isBrowser) {
      return;
    }

    this.loadConfig();
    void this.hydrateEditorHtmlFromInput();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contentJson']) {
      if (this.contentJson === this.lastEmittedContentJson) {
        return;
      }

      if (!this.isBrowser) {
        this.editorHtml = getTripNoteEditorHtml(this.contentJson);
        return;
      }

      void this.hydrateEditorHtmlFromInput();
    }

    if (changes['readOnly'] && this.editorReady) {
      this.init = this.buildEditorInit();
      this.emitViewState();
    }
  }

  onEditorChange(value: string): void {
    this.editorHtml = value ?? '';
    const canonicalHtml = this.tripNoteEditorService.canonicalizeStoredHtml(this.editorHtml);
    const contentJson = createTripNoteEditorContentJson(canonicalHtml);
    this.lastEmittedContentJson = contentJson;
    this.contentJsonChange.emit(contentJson);
  }

  disconnectDropbox(): void {
    this.tripNoteEditorService
      .disconnectDropbox()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.dropboxDialogVisible = false;
          this.dropboxEntries = [];
          this.messagesService.showInfo('Dropbox disconnected');
          this.loadConfig(true);
          this.emitViewState();
        },
        error: (error) => {
          this.messagesService.showError(getMessageFromError(error, 'Dropbox disconnect failed'));
        },
      });
  }

  async openDropboxDialog(): Promise<void> {
    if (!this.dropboxEnabled) {
      this.messagesService.showWarning('Dropbox integration is not configured on the server.');
      return;
    }

    if (!this.dropboxConnected) {
      this.emitConnectDropboxRequested();
      return;
    }

    this.dropboxDialogVisible = true;
    this.loadDropboxFolder(this.dropboxCurrentPath);
  }

  closeDropboxDialog(): void {
    this.dropboxDialogVisible = false;
  }

  loadDropboxFolder(path?: string | null): void {
    this.dropboxBrowserLoading = true;
    this.tripNoteEditorService
      .browseDropbox(path)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (browser) => {
          this.dropboxCurrentPath = browser.currentPath ?? '';
          this.dropboxParentPath = browser.parentPath ?? null;
          this.dropboxEntries = browser.entries ?? [];
          this.dropboxBrowserLoading = false;
        },
        error: (error) => {
          this.dropboxBrowserLoading = false;
          this.messagesService.showError(getMessageFromError(error, 'Dropbox folder could not be loaded'));
        },
      });
  }

  onDropboxEntryClick(entry: TripNoteEditorDropboxBrowserEntry): void {
    if (entry.isFolder) {
      this.loadDropboxFolder(entry.path);
      return;
    }

    if (!entry.previewUrl) {
      this.messagesService.showWarning('Dropbox could not create a preview link for this image');
      return;
    }

    this.editorInstance?.insertContent(this.tripNoteEditorService.buildDropboxImageHtml(entry));
    this.dropboxDialogVisible = false;
  }

  get canManageDropbox(): boolean {
    return this.isBrowser && this.dropboxEnabled && !this.readOnly;
  }

  get headerButtons(): HeaderButtonConfig[] {
    return [];
  }

  get menuItems(): MenuConfig[] {
    if (!this.canManageDropbox) {
      return [];
    }

    return [
      this.dropboxConnected
        ? {
            label: 'Disconnect from Dropbox',
            icon: 'times-circle',
            action: () => this.disconnectDropbox(),
          }
        : {
            label: 'Connect to Dropbox',
            icon: 'link',
            action: () => this.emitConnectDropboxRequested(),
          },
    ];
  }

  get dropboxStatusLabel(): string {
    if (!this.dropboxEnabled) {
      return 'Unavailable';
    }

    return this.dropboxConnected ? 'Connected' : 'Disconnected';
  }

  get dropboxStatusSummary(): string {
    if (!this.dropboxEnabled) {
      return 'Dropbox integration is not configured on the server.';
    }

    if (this.dropboxConnected) {
      return this.dropboxDisplayName?.trim() || 'Dropbox account connected.';
    }

    return 'Connect Dropbox from the menu to insert images.';
  }

  get hasDropboxEntries(): boolean {
    return this.dropboxEntries.length > 0;
  }

  trackDropboxEntry(_index: number, entry: TripNoteEditorDropboxBrowserEntry): string {
    return entry.id;
  }

  private buildEditorInit(): Record<string, unknown> {
    return {
      min_height: 294,
      autoresize_bottom_margin: 24,
      menubar: false,
      statusbar: false,
      promotion: false,
      branding: false,
      browser_spellcheck: true,
      convert_urls: false,
      relative_urls: false,
      remove_script_host: false,
      plugins: 'autolink autoresize charmap code image link lists paste table visualblocks',
      toolbar:
        'dropboximage | blocks | bold italic underline | bullist numlist blockquote | link image undo redo | table | removeformat code',
      block_formats: 'Paragraph=p;Heading 2=h2;Heading 3=h3;Heading 4=h4',
      object_resizing: 'img',
      image_caption: true,
      image_dimensions: true,
      automatic_uploads: false,
      paste_data_images: false,
      readonly: this.readOnly,
      setup: (editor: any) => {
        this.editorInstance = editor;

        editor.ui.registry.addButton('dropboximage', {
          text: 'Dropbox',
          tooltip: 'Insert image from Dropbox',
          onAction: async () => {
            await this.openDropboxDialog();
          },
        });

        editor.on('remove', () => {
          if (this.editorInstance === editor) {
            this.editorInstance = null;
          }
        });
      },
    };
  }

  private loadConfig(forceRefresh = false, onLoaded?: () => void | Promise<void>): void {
    this.tripNoteEditorService
      .getConfig(forceRefresh)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (config) => {
          this.applyEditorConfig(config);
          if (onLoaded) {
            await onLoaded();
          }
        },
        error: () => {
          this.messagesService.showError('Trip note editor configuration could not be loaded');
        },
      });
  }

  private applyEditorConfig(config: TripNoteEditorConfig): void {
    this.editorApiKey = config.tinyMceApiKey?.trim() || 'no-api-key';
    this.dropboxEnabled = !!config.dropboxEnabled;
    this.dropboxConnected = !!config.dropboxConnected;
    this.dropboxDisplayName = config.dropboxDisplayName?.trim() || null;
    this.init = this.buildEditorInit();
    this.editorReady = true;
    void this.refreshHydratedEditorHtml();
    this.emitViewState();
  }

  private async hydrateEditorHtmlFromInput(): Promise<void> {
    const version = ++this.hydrationVersion;
    const html = getTripNoteEditorHtml(this.contentJson);
    const hydrated = await this.tripNoteEditorService.hydrateStoredHtml(html);
    if (version !== this.hydrationVersion) {
      return;
    }

    this.editorHtml = hydrated;
  }

  private async refreshHydratedEditorHtml(): Promise<void> {
    await this.hydrateEditorHtmlFromInput();

    if (!this.editorInstance) {
      return;
    }

    const editorContent = this.editorInstance.getContent({ format: 'html' }) ?? '';
    if (editorContent === this.editorHtml) {
      return;
    }

    this.editorInstance.setContent(this.editorHtml ?? '', { format: 'html' });
  }

  private emitViewState(): void {
    const viewState: TripNoteEditorViewState = {
      headerButtons: this.headerButtons,
      menuItems: this.menuItems,
      dropboxStatusLabel: this.dropboxStatusLabel,
      dropboxStatusSummary: this.dropboxStatusSummary,
      dropboxDisplayName: this.dropboxDisplayName,
    };

    Promise.resolve().then(() => {
      this.zone.run(() => {
        this.viewStateChange.emit(viewState);
      });
    });
  }

  private emitConnectDropboxRequested(): void {
    Promise.resolve().then(() => {
      this.zone.run(() => {
        this.connectDropboxRequested.emit();
      });
    });
  }
}
