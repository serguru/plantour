import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ContentLayoutComponent } from '../../../layouts/content-layout.component';
import { MessagesService } from '../../../../services/messages-service';
import { TripUserPackageService } from '../../../../services/trip-user-package-service';
import { UsersService } from '../../../../services/users-service';

@Component({
  selector: 'app-add-trip-user-package',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, InputNumberModule, ButtonModule, Select, CheckboxModule, ContentLayoutComponent],
  templateUrl: './add-trip-user-package.component.html',
  styleUrl: './add-trip-user-package.component.scss'
})
export class AddTripUserPackageComponent implements OnInit {
  private tripUserPackageService = inject(TripUserPackageService);
  private messagesService = inject(MessagesService);
  private usersService = inject(UsersService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  tripId: string = '';
  packageForm: FormGroup;
  isSubmitting: boolean = false;

  packingStatuses = [
    { label: 'Not Packed', value: 'NotPacked' },
    { label: 'Packed', value: 'Packed' },
    { label: 'In Use', value: 'InUse' }
  ];

  weightUnits = [
    { label: 'kg', value: 'kg' },
    { label: 'lbs', value: 'lbs' },
    { label: 'g', value: 'g' },
    { label: 'oz', value: 'oz' }
  ];

  constructor() {
    this.packageForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      label: [''],
      notes: [''],
      packingStatus: ['NotPacked'],
      packingListIncluded: [false],
      weightValue: [null],
      weightUnit: ['kg']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tripId = params['id'];
    });
    
    if (!this.tripId) {
      this.messagesService.showError('Missing trip information');
      this.router.navigate(['/trips']);
    }
  }

  onSubmit(): void {
    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.packageForm.value;
    const request = {
      tripId: this.tripId,
      name: formValue.name.trim(),
      label: formValue.label?.trim() || null,
      notes: formValue.notes?.trim() || null,
      packingStatus: formValue.packingStatus || 'NotPacked',
      packingListIncluded: formValue.packingListIncluded || false,
      weightValue: formValue.weightValue || null,
      weightUnit: formValue.weightUnit || null,
      parentPackageId: null,
      packedAt: null
    };

    this.tripUserPackageService.add(request).subscribe({
      next: () => {
        this.messagesService.showInfo('Package added successfully');
        this.router.navigate(['/trips', this.tripId, 'packages']);
      },
      error: (error) => {
        console.error('Error adding package:', error);
        this.messagesService.showError('Failed to add package');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/trips', this.tripId, 'packages']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.packageForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.packageForm.get(fieldName);
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
