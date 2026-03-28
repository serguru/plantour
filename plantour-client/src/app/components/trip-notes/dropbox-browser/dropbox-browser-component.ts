import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { getMessageFromError } from '../../../helpers/utils';
import { DropboxBrowseEntryDto, DropboxBrowseResultDto, DropboxService } from '../../../services/dropbox-service';

@Component({
  selector: 'app-dropbox-browser-component',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, InputTextModule, ProgressSpinnerModule],
  templateUrl: './dropbox-browser-component.html',
  styleUrl: './dropbox-browser-component.scss',
})
export class DropboxBrowserComponent implements OnChanges, OnDestroy {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() imageSelected = new EventEmitter<DropboxBrowseEntryDto>();

  private readonly dropboxService = inject(DropboxService);

  result: DropboxBrowseResultDto | null = null;
  filterText = '';
  loading = false;
  errorText = '';
  selectedEntry: DropboxBrowseEntryDto | null = null;
  previewUrl = '';
  previewLoading = false;
  previewErrorText = '';
  private previewRequestKey = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue) {
      this.filterText = '';
      this.clearSelection();
      this.load(null);
    }
  }

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  get filteredEntries(): DropboxBrowseEntryDto[] {
    const entries = this.result?.entries ?? [];
    const filter = this.filterText.trim().toLowerCase();
    if (!filter) {
      return entries;
    }

    return entries.filter((entry) => entry.name.toLowerCase().includes(filter));
  }

  load(path: string | null): void {
    this.loading = true;
    this.errorText = '';
    this.clearSelection();

    this.dropboxService.browse(path).subscribe({
      next: (result) => {
        this.result = result;
        this.loading = false;
      },
      error: (error) => {
        this.result = null;
        this.loading = false;
        this.errorText = getMessageFromError(error, 'Unable to load Dropbox images. Check your Dropbox token and scopes.');
      },
    });
  }

  goToParent(): void {
    this.load(this.result?.parentPath ?? null);
  }

  openFolder(entry: DropboxBrowseEntryDto): void {
    this.load(entry.pathDisplay ?? null);
  }

  selectImage(entry: DropboxBrowseEntryDto): void {
    this.selectedEntry = entry;
    this.previewLoading = true;
    this.previewErrorText = '';
    this.revokePreviewUrl();

    const source = entry.source?.trim() ?? '';
    if (!source) {
      this.previewLoading = false;
      this.previewErrorText = 'This Dropbox image cannot be selected.';
      return;
    }

    this.previewRequestKey = source;
    this.dropboxService.getImage(source).subscribe({
      next: (blob) => {
        if (this.previewRequestKey !== source) {
          return;
        }

        this.previewUrl = URL.createObjectURL(blob);
        this.previewLoading = false;
      },
      error: (error) => {
        if (this.previewRequestKey !== source) {
          return;
        }

        this.previewLoading = false;
        this.previewErrorText = getMessageFromError(error, 'Unable to load Dropbox image preview.');
      },
    });
  }

  submitSelectedImage(): void {
    if (!this.selectedEntry || !this.selectedEntry.source) {
      return;
    }

    this.imageSelected.emit(this.selectedEntry);
    this.close();
  }

  clearSelection(): void {
    this.selectedEntry = null;
    this.previewLoading = false;
    this.previewErrorText = '';
    this.previewRequestKey = '';
    this.revokePreviewUrl();
  }

  close(): void {
    this.clearSelection();
    this.visible = false;
    this.visibleChange.emit(false);
  }

  private revokePreviewUrl(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = '';
    }
  }
}