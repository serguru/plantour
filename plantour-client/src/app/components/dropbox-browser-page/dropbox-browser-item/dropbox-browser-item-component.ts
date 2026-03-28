import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DropboxBrowseEntryDto } from '../../../services/dropbox-service';

@Component({
  selector: 'app-dropbox-browser-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropbox-browser-item-component.html',
  styleUrl: './dropbox-browser-item-component.scss',
})
export class DropboxBrowserItemComponent {
  @Input() entity: DropboxBrowseEntryDto = {} as DropboxBrowseEntryDto;
  @Input() itemMetaData: any | null = null;

  onOpenFolder(event: Event): void {
    event.stopPropagation();
    this.itemMetaData?.openFolder?.(this.entity);
  }

  onSubmit(event: Event): void {
    event.stopPropagation();
    this.itemMetaData?.submit?.(this.entity);
  }

  previewVisible(): boolean {
    return !!this.itemMetaData?.isPreviewVisible?.(this.entity.id);
  }

  previewUrl(): string {
    return this.itemMetaData?.getPreviewUrl?.(this.entity.id) ?? '';
  }

  previewLoading(): boolean {
    return !!this.itemMetaData?.isPreviewLoading?.(this.entity.id);
  }

  previewError(): string {
    return this.itemMetaData?.getPreviewError?.(this.entity.id) ?? '';
  }

  submitVisible(): boolean {
    return !!this.itemMetaData?.isSubmitVisible?.(this.entity);
  }
}