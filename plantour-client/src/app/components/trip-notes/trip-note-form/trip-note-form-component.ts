import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader, HeaderButtonConfig, MenuConfig } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { MessagesService } from '../../../services/messages-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { TripActivityService } from '../../../services/trip-activity-service';
import { CreateTripNoteRequest, TripNoteDto, TripNoteService, UpdateTripNoteRequest } from '../../../services/trip-note-service';
import { TripNoteEditorComponent, TripNoteEditorViewState } from '../trip-note-editor/trip-note-editor-component';
import { buildTripNoteActivityOptions, hasMeaningfulTripNoteContentJson, normalizeTripNoteContentJson } from '../trip-note-utils';

@Component({
  selector: 'app-trip-note-form-component',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    Select,
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private readonly tripNoteService = inject(TripNoteService);
  private readonly tripActivityService = inject(TripActivityService);
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

    if (this.isAddMode) {
      return;
    }

    this.loadTripNote();
  }

  private initForm(): void {
    this.form = this.fb.group({
      title: new FormControl('', Validators.required),
      tripActivityId: new FormControl<string | null>(null),
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

  get tripNotesUrl(): string {
    return `/trips/${this.tripId}/trip-notes`;
  }
}