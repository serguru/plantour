import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { TripUserService, MessagesService, LookupService, ParticipantStatusDto } from 'shared-lib';

@Component({
  selector: 'app-edit-trip-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, Select],
  templateUrl: './edit-trip-user.component.html',
  styleUrl: './edit-trip-user.component.scss'
})
export class EditTripUserComponent implements OnInit {
  private tripUserService = inject(TripUserService);
  private lookupService = inject(LookupService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  tripUserForm: FormGroup;
  isSubmitting: boolean = false;
  isLoading: boolean = true;
  tripId: string = '';
  tripUserId: string = '';
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
      this.tripUserId = params['userId'];
      if (this.tripId && this.tripUserId) {
        this.loadLookups();
        this.loadTripUser();
      } else {
        this.messagesService.showError('Trip ID or User ID not provided');
        this.router.navigate(['/trips']);
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

  private loadTripUser(): void {
    this.isLoading = true;
    this.tripUserService.getById(this.tripUserId).subscribe({
      next: (tripUser) => {
        this.tripUserForm.patchValue({
          adminParticipantId: tripUser.adminParticipantId,
          email: tripUser.email,
          firstName: tripUser.firstName,
          lastName: tripUser.lastName,
          phone: tripUser.phone,
          participantStatus: tripUser.participantStatus,
          notes: tripUser.notes
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading trip user:', error);
        this.messagesService.showError('Failed to load trip user');
        this.router.navigate(['/trips', this.tripId, 'users']);
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
      id: this.tripUserId,
      tripId: this.tripId,
      adminParticipantId: formValue.adminParticipantId.trim(),
      email: formValue.email.trim(),
      firstName: formValue.firstName?.trim() || null,
      lastName: formValue.lastName?.trim() || null,
      phone: formValue.phone?.trim() || null,
      participantStatus: formValue.participantStatus || null,
      notes: formValue.notes?.trim() || null
    };

    this.tripUserService.update(request).subscribe({
      next: () => {
        this.messagesService.showInfo('Trip user updated successfully');
        this.router.navigate(['/trips', this.tripId, 'users']);
      },
      error: (error) => {
        console.error('Error updating trip user:', error);
        this.messagesService.showError('Failed to update trip user');
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
