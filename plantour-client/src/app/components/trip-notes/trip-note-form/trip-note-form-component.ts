import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader, HeaderButtonConfig, MenuConfig } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { capitalizeFirstLetter, getMessageFromError } from '../../../helpers/utils';
import { MessagesService } from '../../../services/messages-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { TripActivityService } from '../../../services/trip-activity-service';
import { CreateTripNoteRequest, TripNoteDto, TripNoteService, UpdateTripNoteRequest } from '../../../services/trip-note-service';
import { TripNoteEditorComponent, TripNoteEditorViewState } from '../trip-note-editor/trip-note-editor-component';
import { TripNoteEditorService } from '../../../services/trip-note-editor-service';
import { buildTripNoteActivityOptions, hasMeaningfulTripNoteContentJson, normalizeTripNoteContentJson } from '../trip-note-utils';

interface TripNoteFormDropboxDraft {
  tripId: string;
  mode: 'add' | 'edit';
  id: string | null;
  title: string;
  tripActivityId: string | null;
  noteOrder: number | null;
  contentJson: string | null;
  controlsPanelCollapsed: boolean;
}

@Component({
  selector: 'app-trip-note-form-component',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    Select,
    InputNumber,
    AutoFocusDirective,
    FormHeader,
    FormActions,
    TripNoteEditorComponent,
  ],
  templateUrl: './trip-note-form-component.html',
  styleUrl: './trip-note-form-component.scss',
})
export class TripNoteFormComponent implements OnInit {
  private readonly componentId = 'trip-note-form';
  private readonly controlsPanelCollapsedStorageKey = 'controlsPanelCollapsed';
  private readonly dropboxDraftStorageKey = 'dropbox-connect-draft';
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly document = inject(DOCUMENT);

  private readonly tripNoteService = inject(TripNoteService);
  private readonly tripActivityService = inject(TripActivityService);
  private readonly tripNoteEditorService = inject(TripNoteEditorService);
  private readonly messagesService = inject(MessagesService);
  private readonly localStorageService = inject(LocalStorageService);

  lookupActivities$;

  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  tripId: string | null = null;
  form!: FormGroup;
  contentJson: string | null = null;
  controlsPanelCollapsed = false;
  headerButtons: HeaderButtonConfig[] = [];
  menuItems: MenuConfig[] = [];
  dropboxStatusLabel = 'Disconnected';
  dropboxStatusSummary = 'Loading Dropbox configuration...';
  dropboxDisplayName: string | null = null;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Trip Note`;
  }

  ngOnInit(): void {
    this.controlsPanelCollapsed = this.localStorageService.getComponentBooleanKey(
      this.componentId,
      this.controlsPanelCollapsedStorageKey,
      false
    );

    this.tripId = this.route.snapshot.params['tripId'];
    if (!this.tripId) {
      throw new Error('Trip Id is required to create or edit a trip note');
    }

    this.lookupActivities$ = combineLatest([
      this.tripActivityService.getAllPublic(this.tripId),
      this.tripActivityService.getAllPersonal(this.tripId),
    ]).pipe(map(([publicActivities, personalActivities]) => buildTripNoteActivityOptions(publicActivities, personalActivities)));

    this.mode = this.route.snapshot.data['mode'];
    if (!this.isAddMode) {
      this.id = this.route.snapshot.params['id'];
      if (!this.id) {
        throw new Error('Id is required to edit a trip note');
      }
    }

    this.initForm();
    const restoredDraft = this.restoreDropboxDraft();
    this.handleDropboxAuthorizationReturn();

    if (this.isAddMode || restoredDraft) {
      return;
    }

    this.loadTripNote();
  }

  private initForm(): void {
    this.form = this.fb.group({
      title: new FormControl('', Validators.required),
      tripActivityId: new FormControl<string | null>(null),
      noteOrder: new FormControl<number | null>(null, Validators.min(0)),
    });
  }

  private loadTripNote(): void {
    if (!this.id || !this.tripId) {
      return;
    }

    this.tripNoteService.getById(this.id, this.tripId).subscribe({
      next: (note: TripNoteDto) => {
        this.form.patchValue({
          title: note.title,
          tripActivityId: note.tripActivityId ?? null,
          noteOrder: note.noteOrder ?? null,
        });
        this.contentJson = note.contentJson ?? null;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messagesService.showWarning('Please fill in all required fields correctly');
      return;
    }

    if (!hasMeaningfulTripNoteContentJson(this.contentJson)) {
      this.messagesService.showWarning('Enter note content before saving');
      return;
    }

    if (this.isAddMode) {
      this.addTripNote();
      return;
    }

    this.updateTripNote();
  }

  private addTripNote(): void {
    const formValue = this.form.getRawValue();
    const request: CreateTripNoteRequest = {
      tripId: this.tripId!,
      tripActivityId: formValue.tripActivityId || null,
      title: formValue.title.trim(),
      contentJson: normalizeTripNoteContentJson(this.contentJson),
      noteOrder: formValue.noteOrder ?? null,
    };

    this.tripNoteService.add(request).subscribe({
      next: (note: TripNoteDto) => {
        this.localStorageService.setComponentKey('trip-notes', 'selectedId', note.id);
        this.messagesService.showInfo('Trip note added successfully');
        this.router.navigate([this.tripNotesUrl]);
      },
    });
  }

  private updateTripNote(): void {
    if (!this.id) {
      return;
    }

    const formValue = this.form.getRawValue();
    const request: UpdateTripNoteRequest = {
      id: this.id,
      tripId: this.tripId!,
      tripActivityId: formValue.tripActivityId || null,
      title: formValue.title.trim(),
      contentJson: normalizeTripNoteContentJson(this.contentJson),
      noteOrder: formValue.noteOrder ?? null,
    };

    this.tripNoteService.update(request).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('trip-notes', 'selectedId', this.id!);
        this.messagesService.showInfo('Trip note updated successfully');
        this.router.navigate([this.tripNotesUrl]);
      },
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.tripNotesUrl]);
  }

  toggleControlsPanel(): void {
    this.controlsPanelCollapsed = !this.controlsPanelCollapsed;
    this.localStorageService.setComponentKey(
      this.componentId,
      this.controlsPanelCollapsedStorageKey,
      this.controlsPanelCollapsed
    );
  }

  get controlsPanelToggleLabel(): string {
    return this.controlsPanelCollapsed ? 'Show note details' : 'Hide note details';
  }

  onEditorViewStateChange(viewState: TripNoteEditorViewState): void {
    this.headerButtons = viewState.headerButtons;
    this.menuItems = viewState.menuItems;
    this.dropboxStatusLabel = viewState.dropboxStatusLabel;
    this.dropboxStatusSummary = viewState.dropboxStatusSummary;
    this.dropboxDisplayName = viewState.dropboxDisplayName;
  }

  onDropboxConnectRequested(): void {
    void this.prepareDropboxConnection();
  }

  get tripNotesUrl(): string {
    return `/trips/${this.tripId}/trip-notes`;
  }

  async prepareDropboxConnection(): Promise<void> {
    const location = this.document.defaultView?.location;
    if (!location) {
      this.messagesService.showError('Dropbox authorization requires a browser.');
      return;
    }

    try {
      const connectUrl = await this.tripNoteEditorService.prepareDropboxConnect(
        location.origin,
        `${location.pathname}${location.search}`
      );
      this.persistDropboxDraft();
      location.assign(connectUrl.authorizationUrl);
    } catch (error) {
      this.messagesService.showError(getMessageFromError(error, 'Dropbox connection could not be started'));
    }
  }

  private persistDropboxDraft(): void {
    const formValue = this.form.getRawValue();
    const draft: TripNoteFormDropboxDraft = {
      tripId: this.tripId!,
      mode: this.mode,
      id: this.id,
      title: formValue.title ?? '',
      tripActivityId: formValue.tripActivityId ?? null,
      noteOrder: formValue.noteOrder ?? null,
      contentJson: this.contentJson,
      controlsPanelCollapsed: this.controlsPanelCollapsed,
    };

    this.localStorageService.setComponentKey(this.componentId, this.dropboxDraftStorageKey, draft);
  }

  private restoreDropboxDraft(): boolean {
    const draft = this.localStorageService.getComponentKeyObject(this.componentId, this.dropboxDraftStorageKey) as TripNoteFormDropboxDraft | null;
    if (!draft) {
      return false;
    }

    const matchesCurrentForm = draft.tripId === this.tripId && draft.mode === this.mode && (draft.id ?? null) === (this.id ?? null);
    if (!matchesCurrentForm) {
      return false;
    }

    this.localStorageService.setComponentKey(this.componentId, this.dropboxDraftStorageKey, null);
    this.controlsPanelCollapsed = draft.controlsPanelCollapsed;
    this.form.patchValue({
      title: draft.title,
      tripActivityId: draft.tripActivityId,
      noteOrder: draft.noteOrder,
    });
    this.contentJson = draft.contentJson;
    return true;
  }

  private handleDropboxAuthorizationReturn(): void {
    const status = this.route.snapshot.queryParamMap.get('dropboxConnect');
    if (!status) {
      return;
    }

    const message = this.route.snapshot.queryParamMap.get('dropboxMessage')?.trim();
    if (status === 'success') {
      this.messagesService.showInfo(message || 'Dropbox connected');
    } else {
      this.messagesService.showError(message || 'Dropbox authorization failed');
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
  }
}