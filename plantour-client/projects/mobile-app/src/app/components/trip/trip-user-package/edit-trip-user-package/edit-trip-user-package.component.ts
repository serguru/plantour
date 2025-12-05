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
import { TripUserPackageService, MessagesService } from 'shared-lib';

@Component({
  selector: 'app-edit-trip-user-package',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, InputNumberModule, ButtonModule, Select, CheckboxModule],
  templateUrl: './edit-trip-user-package.component.html',
  styleUrl: './edit-trip-user-package.component.scss'
})
export class EditTripUserPackageComponent implements OnInit {
  private tripUserPackageService = inject(TripUserPackageService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  tripId: string = '';
  packageId: string = '';
  packageForm: FormGroup;
  isSubmitting: boolean = false;
  isLoading: boolean = true;

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
      this.packageId = params['packageId'];
      
      if (!this.tripId || !this.packageId) {
        this.messagesService.showError('Missing trip or package information');
        this.router.navigate(['/trips']);
        return;
      }
      
      this.loadPackage();
    });
  }

  private loadPackage(): void {
    this.tripUserPackageService.getById(this.packageId).subscribe({
      next: (pkg) => {
        this.packageForm.patchValue({
          name: pkg.name || '',
          label: pkg.label || '',
          notes: pkg.notes || '',
          packingStatus: pkg.packingStatus || 'NotPacked',
          packingListIncluded: pkg.packingListIncluded || false,
          weightValue: pkg.weightValue || null,
          weightUnit: pkg.weightUnit || 'kg'
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading package:', error);
        this.messagesService.showError('Failed to load package');
        this.router.navigate(['/trips', this.tripId, 'packages']);
      }
    });
  }

  onSubmit(): void {
    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.packageForm.value;
    const request = {
      id: this.packageId,
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

    this.tripUserPackageService.update(request).subscribe({
      next: () => {
        this.messagesService.showInfo('Package updated successfully');
        this.router.navigate(['/trips', this.tripId, 'packages']);
      },
      error: (error) => {
        console.error('Error updating package:', error);
        this.messagesService.showError('Failed to update package');
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
