import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { AdminsParticipantService, MessagesService, LookupService, ParticipantStatusDto } from 'shared-lib';
import { ContentLayoutComponent } from '../../layouts/content-layout.component';

@Component({
  selector: 'app-add-admins-participant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, Select, ContentLayoutComponent],
  templateUrl: './add-admins-participant.component.html',
  styleUrl: './add-admins-participant.component.scss'
})
export class AddAdminsParticipantComponent implements OnInit {
  private adminsParticipantService = inject(AdminsParticipantService);
  private lookupService = inject(LookupService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  participantForm: FormGroup;
  isSubmitting: boolean = false;
  participantStatuses: ParticipantStatusDto[] = [];

  constructor() {
    this.participantForm = this.fb.group({
      participantId: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      firstName: ['', [Validators.maxLength(100)]],
      lastName: ['', [Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(50)]],
      participantStatus: [null],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadLookups();
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
    if (this.participantForm.invalid) {
      this.participantForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.participantForm.value;
    const request = {
      participantId: formValue.participantId.trim(),
      email: formValue.email.trim(),
      firstName: formValue.firstName?.trim() || null,
      lastName: formValue.lastName?.trim() || null,
      phone: formValue.phone?.trim() || null,
      participantStatus: formValue.participantStatus || null,
      notes: formValue.notes?.trim() || null
    };

    this.adminsParticipantService.add(request).subscribe({
      next: () => {
        this.messagesService.showInfo('Participant created successfully');
        this.router.navigate(['/admins-participant']);
      },
      error: (error) => {
        console.error('Error creating participant:', error);
        this.messagesService.showError('Failed to create participant');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admins-participant']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.participantForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.participantForm.get(fieldName);
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
