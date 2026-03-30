import { Component, inject, Input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { ComponentService } from '../../../services/component-service';
import { TripNoteEditorService } from '../../../services/trip-note-editor-service';
import { TripNoteDto } from '../../../services/trip-note-service';
import { renderTripNoteContentHtml } from '../trip-note-utils';

@Component({
  selector: 'app-trip-note-item-component',
  standalone: true,
  imports: [FormsModule, Select, Checkbox],
  templateUrl: './trip-note-item-component.html',
  styleUrl: './trip-note-item-component.scss',
})
export class TripNoteItemComponent implements OnChanges {
  @Input() entity: TripNoteDto = {} as TripNoteDto;
  @Input() itemMetaData: any | null = null;

  private readonly componentService = inject(ComponentService);
  private readonly tripNoteEditorService = inject(TripNoteEditorService);
  private readonly selectedId = toSignal(this.componentService.selectedId$, { initialValue: null });
  private renderVersion = 0;

  renderedHtml = '';

  ngOnChanges(): void {
    void this.updateRenderedHtml();
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

  onMarkedChange(event: CheckboxChangeEvent): void {
    event.originalEvent?.stopPropagation();
    this.itemMetaData?.toggleMarked?.(this.entity.id, !!event.checked);
  }

  onMarkedClick(event: Event): void {
    event.stopPropagation();
  }

  private async updateRenderedHtml(): Promise<void> {
    const renderVersion = ++this.renderVersion;
    const html = renderTripNoteContentHtml(this.entity.contentJson);
    const hydratedHtml = await this.tripNoteEditorService.hydrateStoredHtml(html);
    if (renderVersion !== this.renderVersion) {
      return;
    }

    this.renderedHtml = hydratedHtml;
  }
}