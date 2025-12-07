import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { UserThingService, MessagesService, LookupService } from 'shared-lib';
import { ContentLayoutComponent } from '../../layouts/content-layout.component';

interface ThingCategoryDto {
  id: string;
  name: string;
  notes?: string | null;
}

interface UnitDto {
  id: string;
  name: string;
}

@Component({
  selector: 'app-edit-thing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, Select,
      ContentLayoutComponent],
  templateUrl: './edit-thing.component.html',
  styleUrl: './edit-thing.component.scss'
})
export class EditThingComponent implements OnInit {
  private userThingService = inject(UserThingService);
  private lookupService = inject(LookupService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  thingForm: FormGroup;
  isSubmitting: boolean = false;
  isLoading: boolean = true;
  thingId: string = '';
  categories: ThingCategoryDto[] = [];
  units: UnitDto[] = [];

  constructor() {
    this.thingForm = this.fb.group({
      category: [null],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      notes: [''],
      units: [null],
      value: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.thingId = params['id'];
      if (this.thingId) {
        this.loadLookups();
        this.loadThing();
      } else {
        this.messagesService.showError('Thing ID not provided');
        this.router.navigate(['/things']);
      }
    });
  }

  private loadLookups(): void {
    this.lookupService.getThingCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });

    this.lookupService.getUnits().subscribe({
      next: (units) => {
        this.units = units;
      },
      error: (error) => {
        console.error('Error loading units:', error);
      }
    });
  }

  private loadThing(): void {
    this.isLoading = true;
    this.userThingService.getById(this.thingId).subscribe({
      next: (thing) => {
        this.thingForm.patchValue({
          category: thing.category,
          name: thing.name,
          notes: thing.notes,
          units: thing.units,
          value: thing.value
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading thing:', error);
        this.messagesService.showError('Failed to load thing');
        this.router.navigate(['/things']);
      }
    });
  }

  onSubmit(): void {
    if (this.thingForm.invalid) {
      this.thingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.thingForm.value;
    const request = {
      id: this.thingId,
      category: formValue.category || null,
      name: formValue.name.trim(),
      notes: formValue.notes?.trim() || null,
      units: formValue.units || null,
      value: formValue.value?.trim() || null
    };

    this.userThingService.update(request).subscribe({
      next: () => {
        this.messagesService.showInfo('Thing updated successfully');
        this.router.navigate(['/things']);
      },
      error: (error) => {
        console.error('Error updating thing:', error);
        this.messagesService.showError('Failed to update thing');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/things']);
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
