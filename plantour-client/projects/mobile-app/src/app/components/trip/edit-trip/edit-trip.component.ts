import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { TripService, MessagesService, LookupService } from 'shared-lib';
import { ContentLayoutComponent } from '../../layouts/content-layout.component';

interface TripStatusDto {
  id: string;
  name: string;
}

@Component({
  selector: 'app-edit-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, DatePickerModule, Select, ContentLayoutComponent],
  templateUrl: './edit-trip.component.html',
  styleUrl: './edit-trip.component.scss'
})
export class EditTripComponent implements OnInit {
  private tripService = inject(TripService);
  private lookupService = inject(LookupService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  id: string = '';
  tripForm: FormGroup;
  isSubmitting: boolean = false;
  isLoading: boolean = true;
  tripStatuses: TripStatusDto[] = [];

  constructor() {
    this.tripForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      tripStatus: [null],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    
    this.id = this.route.snapshot.paramMap.get('id') || '';

    if (this.id) {
      this.loadLookups();
      this.loadTrip();
    } else {
      this.messagesService.showError('Trip ID not found');
      this.router.navigate(['/trips']);
      return;
    }
  }

  private loadLookups(): void {
    this.lookupService.getTripStatuses().subscribe({
      next: (tripStatuses) => {
        this.tripStatuses = tripStatuses;
      },
      error: (error) => {
        console.error('Error loading trip statuses:', error);
      }
    });
  }

  private loadTrip(): void {
    this.tripService.getById(this.id).subscribe({
      next: (trip) => {
        this.tripForm.patchValue({
          name: trip.name || '',
          description: trip.description || '',
          tripStatus: trip.tripStatus || '',
          startDate: trip.startDate ? new Date(trip.startDate) : '',
          endDate: trip.endDate ? new Date(trip.endDate) : ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading trip:', error);
        this.messagesService.showError('Failed to load trip');
        this.router.navigate(['/trips']);
      }
    });
  }

  onSubmit(): void {
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.tripForm.value;
    const request = {
      id: this.id,
      name: formValue.name.trim(),
      tripStatus: formValue.tripStatus || null,
      description: formValue.description?.trim() || null,
      startDate: formValue.startDate ? this.tripService.formatDate(formValue.startDate) : null,
      endDate: formValue.endDate ? this.tripService.formatDate(formValue.endDate) : null
    };

    this.tripService.update(request).subscribe({
      next: () => {
        this.messagesService.showInfo('Trip updated successfully');
        this.router.navigate(['/trips']);
      },
      error: (error) => {
        console.error('Error updating trip:', error);
        this.messagesService.showError('Failed to update trip');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/trips']);
  }

  

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tripForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.tripForm.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return 'This field is required';
    }
    if (field?.hasError('maxlength') && field?.touched) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }
    return '';
  }
}
