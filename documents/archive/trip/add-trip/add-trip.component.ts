import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { ContentLayoutComponent } from '../../layouts/content-layout.component';
import { LookupService } from '../../../services/lookup-service';
import { MessagesService } from '../../../services/messages-service';
import { TripService } from '../../../services/trip-service';

interface TripStatusDto {
  id: string;
  name: string;
}

@Component({
  selector: 'app-add-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, DatePickerModule, Select,
      ContentLayoutComponent],
  templateUrl: './add-trip.component.html',
  styleUrl: './add-trip.component.scss'
})
export class AddTripComponent implements OnInit {
  private tripService = inject(TripService);
  private lookupService = inject(LookupService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  tripForm: FormGroup;
  isSubmitting: boolean = false;
  tripStatuses: TripStatusDto[] = [];

  constructor() {
    this.tripForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      tripStatus: [null],
      description: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadLookups();
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

  onSubmit(): void {
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.tripForm.value;
    const request = {
      name: formValue.name.trim(),
      tripStatus: formValue.tripStatus || null,
      description: formValue.description?.trim() || null,
      startDate: formValue.startDate ? this.tripService.formatDate(formValue.startDate) : null,
      endDate: formValue.endDate ? this.tripService.formatDate(formValue.endDate) : null
    };

    this.tripService.add(request).subscribe({
      next: () => {
        this.messagesService.showInfo('Trip created successfully');
        this.router.navigate(['/trips']);
      },
      error: (error) => {
        console.error('Error creating trip:', error);
        this.messagesService.showError('Failed to create trip');
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
