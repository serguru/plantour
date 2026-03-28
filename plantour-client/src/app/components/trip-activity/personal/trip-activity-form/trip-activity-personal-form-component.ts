import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { AutoFocusDirective } from '../../../../helpers/auto-focus-directive';
import { FormHeader, MenuConfig } from '../../../form/form-header/form-header';
import { FormActions } from '../../../form/form-actions/form-actions';
import { capitalizeFirstLetter } from '../../../../helpers/utils';
import { LocalStorageService } from '../../../../services/local-storage-service';
import { MessagesService } from '../../../../services/messages-service';
import { CreateTripActivityRequest, TripActivityDto, TripActivityService, UpdateTripActivityRequest } from '../../../../services/trip-activity-service';
import { dateRangeValidator } from '../../../../helpers/date-range-validator';
import { allTogetherValidator } from '../../../../helpers/all-together-validator';
import { ItineraryPartDto, ItineraryService } from '../../../../services/itinerary-service';
import { buildTripActivityTypeOptions, sortTripActivityItineraryParts } from '../../trip-activity-utils';

@Component({
  selector: 'app-trip-activity-personal-form',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    AutoFocusDirective,
    FormHeader,
    FormActions,
    Select,
    DatePicker,
    InputNumber,
  ],
  templateUrl: './trip-activity-personal-form-component.html',
  styleUrl: './trip-activity-personal-form-component.scss',
})
export class TripActivityPersonalFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  service = inject(TripActivityService);
  itineraryService = inject(ItineraryService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);

  lookupActivities$;
  lookupItineraryParts$;

  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  tripId: string | null = null;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Personal Trip Activity`;
  }

  menuItems = computed<MenuConfig[]>(() => []);

  ngOnInit(): void {
    this.tripId = this.route.snapshot.params['tripId'];
    if (!this.tripId) {
      throw new Error('Trip Id is required to create or edit a personal trip activity');
    }

    const allActivities$ = combineLatest([
      this.service.getAllPublic(this.tripId),
      this.service.getAllPersonal(this.tripId),
    ]).pipe(
      map(([publicActivities, personalActivities]) => [...publicActivities, ...personalActivities])
    );

    this.lookupActivities$ = allActivities$.pipe(
      map((activities: TripActivityDto[]) => buildTripActivityTypeOptions(activities))
    );

    this.lookupItineraryParts$ = this.itineraryService.getAll(this.tripId).pipe(
      map((parts: ItineraryPartDto[]) => sortTripActivityItineraryParts(parts))
    );

    this.mode = this.route.snapshot.data['mode'];
    this.initForm();

    if (this.isAddMode) {
      return;
    }

    this.id = this.route.snapshot.params['id'];
    if (!this.id) {
      throw new Error('Id is required to edit a personal trip activity');
    }
    this.loadActivity();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: new FormControl('', Validators.required),
      activity: new FormControl(''),
      startDate: new FormControl<string | null>(null),
      endDate: new FormControl<string | null>(null),
      address: new FormControl(''),
      latitude: new FormControl<number | null>(null, [Validators.min(-90), Validators.max(90)]),
      longitude: new FormControl<number | null>(null, [Validators.min(-180), Validators.max(180)]),
      notes: new FormControl(''),
      itineraryPartId: new FormControl<string | null>(null),
    }, {
      validators: [
        allTogetherValidator(['startDate', 'endDate'], 'datePairRequired'),
        dateRangeValidator,
        allTogetherValidator(['latitude', 'longitude'], 'coordinatesPairRequired'),
      ],
    });
  }

  private loadActivity(): void {
    if (!this.id) {
      return;
    }

    this.service.getPersonalById(this.tripId!, this.id).subscribe({
      next: (activity: TripActivityDto) => {
        this.form.patchValue({
          name: activity.name,
          activity: activity.activity,
          startDate: this.toDateInputValue(activity.startDate),
          endDate: this.toDateInputValue(activity.endDate),
          address: activity.address,
          latitude: activity.latitude,
          longitude: activity.longitude,
          notes: activity.notes,
          itineraryPartId: activity.itineraryPartId ?? null,
        });
      },
    });
  }

  private toDateInputValue(value?: string | null): string | null {
    return value ? value.slice(0, 10) : null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messagesService.showWarning('Please fill in all required fields correctly');
      return;
    }

    if (this.isAddMode) {
      this.addActivity();
      return;
    }

    this.updateActivity();
  }

  private addActivity() {
    const formValue = this.form.value;
    const request: CreateTripActivityRequest = {
      tripId: this.tripId!,
      name: formValue.name.trim(),
      itineraryPartId: formValue.itineraryPartId || null,
      activity: formValue.activity?.trim() || null,
      startDate: formValue.startDate || null,
      endDate: formValue.endDate || null,
      address: formValue.address?.trim() || null,
      latitude: formValue.latitude ?? null,
      longitude: formValue.longitude ?? null,
      notes: formValue.notes?.trim() || null,
    };

    this.service.addPersonal(request).subscribe({
      next: (activity: TripActivityDto) => {
        this.localStorageService.setComponentKey('trip-activities-personal', 'selectedId', activity.id);
        this.messagesService.showInfo('Personal trip activity added successfully');
        this.router.navigate([this.tripActivitiesUrl]);
      },
    });
  }

  private updateActivity(): void {
    if (!this.id) {
      return;
    }

    const formValue = this.form.getRawValue();
    const request: UpdateTripActivityRequest = {
      id: this.id,
      itineraryPartId: formValue.itineraryPartId || null,
      activity: formValue.activity?.trim() || null,
      name: formValue.name.trim(),
      startDate: formValue.startDate || null,
      endDate: formValue.endDate || null,
      address: formValue.address?.trim() || null,
      latitude: formValue.latitude ?? null,
      longitude: formValue.longitude ?? null,
      notes: formValue.notes?.trim() || null,
    };

    this.service.updatePersonal(request).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('trip-activities-personal', 'selectedId', this.id!);
        this.messagesService.showInfo('Personal trip activity updated successfully');
        this.router.navigate([this.tripActivitiesUrl]);
      },
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.tripActivitiesUrl]);
  }

  get tripActivitiesUrl(): string {
    return `/trips/${this.tripId}/trip-activities/personal`;
  }
}