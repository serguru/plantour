import { Component, inject, OnInit } from '@angular/core';
import { TripService, CreateTripRequest, UpdateTripRequest, TripDto } from '../../../services/trip-service';
import { FormControl, ReactiveFormsModule, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { LookupService, TripStatusDto } from '../../../services/lookup-service';
import { MessagesService } from '../../../services/messages-service';
import { ButtonModule } from 'primeng/button';
import { MessagePanel } from '../../message-panel/message-panel-component/message-panel-component';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { UsersService } from '../../../services/users-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { ComponentService } from '../../../services/component-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { capitalizeFirstLetter, formatDate } from '../../../helpers/utils';
import { catchError, EMPTY, finalize, map } from 'rxjs';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { dateRangeValidator } from '../../../helpers/date-range-validator';

@Component({
  selector: 'app-trip-form-component',
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    //ButtonModule,
    MessagePanel,
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
  componentService = inject(ComponentService);
  lookupService = inject(LookupService);

  tripStatuses: TripStatusDto[] = [];

  isLoading = toSignal(this.componentService.loading$);

  mode: 'add' | 'edit' | 'view' = 'view';
  id: string | null = null;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  errorMessage = '';
  participantId = '';


  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Trip`;
  }

  get isReadOnlyMode(): boolean {
    return this.mode === 'view';
  }

  ngOnInit(): void {

    this.componentService.reset();

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
      startDate: new FormControl<string | null>(null, []),
      endDate: new FormControl<string | null>(null, []),
    },{ validators: dateRangeValidator });
  }

  private loadTrip(): void {
    if (!this.id) return;

    this.errorMessage = '';

    this.componentService.updateLoading(true);
    this.service.getById(this.id).pipe(
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Failed to load trip. Please try again.';
        return EMPTY;
      }),
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
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
    if (this.isLoading() || this.isReadOnlyMode) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    this.errorMessage = '';

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
      startDate: formatDate(formValue.startDate) || null,
      endDate: formatDate(formValue.endDate) || null
    };

    this.componentService.updateLoading(true);
    this.service.add(request).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
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
      startDate: formatDate(formValue.startDate) || null,
      endDate: formatDate(formValue.endDate) || null
    };

    this.componentService.updateLoading(true);
    this.service.update(request).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
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
