import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { TripUserThingService, MessagesService, UsersService } from 'shared-lib';

@Component({
  selector: 'app-add-trip-user-thing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, InputNumberModule, ButtonModule, Select],
  templateUrl: './add-trip-user-thing.component.html',
  styleUrl: './add-trip-user-thing.component.scss'
})
export class AddTripUserThingComponent implements OnInit {
  private tripUserThingService = inject(TripUserThingService);
  private messagesService = inject(MessagesService);
  private usersService = inject(UsersService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  tripId: string = '';
  //tripUserId: string = '';
  thingForm: FormGroup;
  isSubmitting: boolean = false;

  packingStatuses = [
    { label: 'Not Packed', value: 'NotPacked' },
    { label: 'Packed', value: 'Packed' },
    { label: 'In Use', value: 'InUse' }
  ];

  constructor() {
    this.thingForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      category: [''],
      notes: [''],
      units: [''],
      value: [null],
      packingStatus: ['NotPacked']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tripId = params['id'];
    });
    
    // this.route.queryParams.subscribe(queryParams => {
    //   this.tripUserId = queryParams['tripUserId'] || '';
    // });
    
    if (!this.tripId) {
      this.messagesService.showError('Missing trip information');
      this.router.navigate(['/trips']);
    }
  }

  onSubmit(): void {
    if (this.thingForm.invalid) {
      this.thingForm.markAllAsTouched();
      return;
    }

    // If tripUserId is not provided via query params, we need to handle this
    // For now, we'll require it to be passed via query parameters
    // if (!this.tripUserId) {
    //   this.messagesService.showError('Trip user information is missing. Please try again.');
    //   return;
    // }

    this.isSubmitting = true;

    const formValue = this.thingForm.value;
    const request = {
//      tripUserId: this.tripUserId,
      tripId: this.tripId,
      name: formValue.name.trim(),
      category: formValue.category?.trim() || null,
      notes: formValue.notes?.trim() || null,
      units: formValue.units?.trim() || null,
      value: formValue.value || null,
      packingStatus: formValue.packingStatus || 'NotPacked',
      tripUserPackageId: null,
      packedAt: null
    };

    this.tripUserThingService.add(request).subscribe({
      next: () => {
        this.messagesService.showInfo('Thing added successfully');
        this.router.navigate(['/trips', this.tripId, 'things']);
      },
      error: (error) => {
        console.error('Error adding thing:', error);
        this.messagesService.showError('Failed to add thing');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/trips', this.tripId, 'things']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.thingForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.thingForm.get(fieldName);
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
