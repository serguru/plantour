import { Component, computed, inject, OnInit } from '@angular/core';
import { TripService, CreateTripRequest, UpdateTripRequest, TripDto } from '../../../services/trip-service';
import { FormControl, ReactiveFormsModule, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

import { LookupService, TripStatusDto } from '../../../services/lookup-service';
import { MessagesService } from '../../../services/messages-service';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader, MenuConfig } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { UsersService } from '../../../services/users-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { dateRangeValidator } from '../../../helpers/date-range-validator';

@Component({
  selector: 'app-trip-form-component',
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    AutoFocusDirective,
    FormHeader,
    FormActions,
    DatePicker,
    Select
],
  standalone: true,
  templateUrl: './trip-form-component.html'
})
export class TripFormComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  service = inject(TripService);
  usersService = inject(UsersService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);
  lookupService = inject(LookupService);

  tripStatuses: TripStatusDto[] = [];

  mode: 'add' | 'edit' | 'view' = 'view';
  id: string | null = null;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  participantId = '';


  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Trip`;
  }

  get isReadOnlyMode(): boolean {
    return this.mode === 'view';
  }

  menuItems = computed<MenuConfig[]>(() => []);

  ngOnInit(): void {

    this.mode = this.route.snapshot.data['mode'];

    this.initForm();

    if (this.isAddMode) {
      this.lookupService.tripStatuses$.subscribe(statuses => {
        this.tripStatuses = statuses;
        this.form.patchValue({ tripStatusId: this.tripStatuses.length > 0 ? this.tripStatuses[0].id : null });
      });
      return;
    }

    this.lookupService.tripStatuses$.subscribe(statuses => {
      this.tripStatuses = statuses;
      this.id = this.route.snapshot.paramMap.get('id');
      this.loadTrip();
    });
  }

  

  private initForm(): void {
    this.form = this.fb.group({
      name: new FormControl('', Validators.required),
      tripStatusId: new FormControl('', []),
      notes: new FormControl('', []),
      startDate: new FormControl<string | null>(null, Validators.required),
      endDate: new FormControl<string | null>(null, Validators.required),
    },{ validators: dateRangeValidator });
  }

  private loadTrip(): void {
    if (!this.id) return;

    this.service.getById(this.id).subscribe({
      next: (trip: TripDto) => {
        this.participantId = trip.id;
        this.form.patchValue({
          name: trip.name,
          tripStatusId: trip.tripStatusId,
          notes: trip.notes,
          startDate: trip.startDate,
          endDate: trip.endDate
        });
      }
    });
  }

  onSubmit(): void {
    if (this.isReadOnlyMode) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messagesService.showWarning('Please fill in all required fields correctly');
      return;
    }
    if (this.isAddMode) {
      this.addTrip();
    } else {
      this.updateTrip();
    }
  }

  private addTrip() {
    const formValue = this.form.value;
    const request: CreateTripRequest = {
      name: formValue.name?.trim(),
      tripStatusId: formValue.tripStatusId || null,
      notes: formValue.notes?.trim() || null,
      startDate: formValue.startDate || null,
      endDate: formValue.endDate || null
    };

    this.service.add(request).subscribe({
      next: (trip: TripDto) => {
        this.localStorageService.setComponentKey('trips', 'selectedId', trip.id);
        this.messagesService.showInfo('Trip added successfully');
        this.router.navigate(['/trips']);
      }
    });
  }

  private updateTrip(): void {
    if (!this.id) return;

    const formValue = this.form.getRawValue();
    const request: UpdateTripRequest = {
      id: this.id,
      name: formValue.name?.trim(),
      tripStatusId: formValue.tripStatusId || null,
      notes: formValue.notes?.trim() || null,
      startDate: formValue.startDate || null,
      endDate: formValue.endDate || null
    };

    this.service.update(request).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('trips', 'selectedId', this.id!);
        this.messagesService.showInfo('Trip updated successfully');
        this.router.navigate(['/trips']);
      }
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/trips']);
  }
}
