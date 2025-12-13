import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { ContentLayoutComponent } from '../../../layouts/content-layout.component';
import { LookupService, ParticipantStatusDto } from '../../../../services/lookup-service';
import { MessagesService } from '../../../../services/messages-service';
import { TripUserService } from '../../../../services/trip-user-service';

@Component({
  selector: 'app-add-trip-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, Select, ContentLayoutComponent],
  templateUrl: './add-trip-user.component.html',
  styleUrl: './add-trip-user.component.scss'
})
export class AddTripUserComponent implements OnInit {
  private tripUserService = inject(TripUserService);
  private lookupService = inject(LookupService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  tripUserForm: FormGroup;
  isSubmitting: boolean = false;
  tripId: string = '';
  participantStatuses: ParticipantStatusDto[] = [];

  constructor() {
    this.tripUserForm = this.fb.group({
      adminParticipantId: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      firstName: ['', [Validators.maxLength(100)]],
      lastName: ['', [Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(50)]],
      participantStatus: [null],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tripId = params['id'];
      if (!this.tripId) {
        this.messagesService.showError('Trip ID not provided');
        this.router.navigate(['/trips']);
      } else {
        this.loadLookups();
      }
    });
  }

  private loadLookups(): void {
    this.lookupService.getParticipantStatuses().subscribe({
      next: (statuses) => {
        this.participantStatuses = statuses;
      },
      error: (error) => {
        console.error('Error loading participant statuses:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.tripUserForm.invalid) {
      this.tripUserForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.tripUserForm.value;
    const request = {
      tripId: this.tripId,
      adminParticipantId: formValue.adminParticipantId.trim(),
      email: formValue.email.trim(),
      firstName: formValue.firstName?.trim() || null,
      lastName: formValue.lastName?.trim() || null,
      phone: formValue.phone?.trim() || null,
      participantStatus: formValue.participantStatus || null,
      notes: formValue.notes?.trim() || null
    };

    this.tripUserService.add(request).subscribe({
      next: () => {
        this.messagesService.showInfo('Trip user created successfully');
        this.router.navigate(['/trips', this.tripId, 'users']);
      },
      error: (error) => {
        console.error('Error creating trip user:', error);
        this.messagesService.showError('Failed to create trip user');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/trips', this.tripId, 'users']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tripUserForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.tripUserForm.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return 'This field is required';
    }
    if (field?.hasError('email') && field?.touched) {
      return 'Invalid email format';
    }
    if (field?.hasError('maxlength') && field?.touched) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }
    return '';
  }
}
