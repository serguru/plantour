import { Component, inject, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Select } from 'primeng/select';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { ComponentService } from '../../../services/component-service';
import { DropboxService } from '../../../services/dropbox-service';
import { TripNoteDto } from '../../../services/trip-note-service';
import { extractDropboxImageUrls, renderTripNoteContentHtml } from '../trip-note-utils';

@Component({
  selector: 'app-trip-note-item-component',
  standalone: true,
  imports: [FormsModule, Select],
  templateUrl: './trip-note-item-component.html',
  styleUrl: './trip-note-item-component.scss',
})
export class TripNoteItemComponent implements OnChanges {
  @Input() entity: TripNoteDto = {} as TripNoteDto;
  @Input() itemMetaData: any | null = null;

  private readonly componentService = inject(ComponentService);
  private readonly dropboxService = inject(DropboxService);
  private readonly selectedId = toSignal(this.componentService.selectedId$, { initialValue: null });
  private readonly objectUrls: string[] = [];
  private renderVersion = 0;

  renderedHtml = '';

  async ngOnChanges(): Promise<void> {
    const currentVersion = ++this.renderVersion;
    await this.renderContentAsync(currentVersion);
  }

  ngOnDestroy(): void {
    this.revokeObjectUrls();
  }

  get isExpanded(): boolean {
    return this.selectedId() === this.entity.id;
  }

  get createdAtText(): string | null {
    return this.entity.createdAt ? new Date(this.entity.createdAt).toLocaleString() : null;
  }

  get marked(): boolean {
    return !!this.itemMetaData?.isMarked?.(this.entity.id);
  }

  onTripActivityChange(id: string | null): void {
    if (!this.itemMetaData?.assignTripActivity) {
      return;
    }

    this.itemMetaData.assignTripActivity(this.entity, id);
  }

  onTripActivityClick(event: Event): void {
    event.stopPropagation();
  }

  onMarkedChange(event: Event): void {
    event.stopPropagation();
    const target = event.target as HTMLInputElement | null;
    this.itemMetaData?.toggleMarked?.(this.entity.id, !!target?.checked);
  }

  onMarkedClick(event: Event): void {
    event.stopPropagation();
  }

  private async renderContentAsync(version: number): Promise<void> {
    this.revokeObjectUrls();

    const dropboxUrls = extractDropboxImageUrls(this.entity.contentJson);
    if (dropboxUrls.length === 0) {
      this.renderedHtml = renderTripNoteContentHtml(this.entity.contentJson);
      return;
    }

    const resolvedEntries = await Promise.all(
      dropboxUrls.map(async (url) => {
        const objectUrl = await firstValueFrom(
          this.dropboxService.getImage(url).pipe(
            map((blob) => URL.createObjectURL(blob)),
            catchError(() => of(''))
          )
        );

        return [url, objectUrl] as const;
      })
    );

    if (version !== this.renderVersion) {
      for (const [, objectUrl] of resolvedEntries) {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      }

      return;
    }

    const resolvedMap = new Map<string, string>();
    for (const [url, objectUrl] of resolvedEntries) {
      if (!objectUrl) {
        continue;
      }

      resolvedMap.set(url, objectUrl);
      this.objectUrls.push(objectUrl);
    }

    this.renderedHtml = renderTripNoteContentHtml(this.entity.contentJson, (url) => {
      if (resolvedMap.has(url)) {
        return resolvedMap.get(url) ?? '';
      }

      return dropboxUrls.includes(url) ? '' : url;
    });
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