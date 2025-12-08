import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { ContentLayoutComponent } from '../../layouts/content-layout.component';
import { UserThingService } from '../../../services/user-thing-service';
import { LookupService } from '../../../services/lookup-service';
import { MessagesService } from '../../../services/messages-service';

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
  selector: 'app-add-thing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, Select, ContentLayoutComponent],
  templateUrl: './add-thing.component.html',
  styleUrl: './add-thing.component.scss'
})
export class AddThingComponent implements OnInit {
  private userThingService = inject(UserThingService);
  private lookupService = inject(LookupService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  thingForm: FormGroup;
  isSubmitting: boolean = false;
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
    this.loadLookups();
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

  onSubmit(): void {
    if (this.thingForm.invalid) {
      this.thingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.thingForm.value;
    const request = {
      category: formValue.category || null,
      name: formValue.name.trim(),
      notes: formValue.notes?.trim() || null,
      units: formValue.units || null,
      value: formValue.value?.trim() || null
    };

    this.userThingService.add(request).subscribe({
      next: () => {
        this.messagesService.showInfo('Thing created successfully');
        this.router.navigate(['/things']);
      },
      error: (error) => {
        console.error('Error creating thing:', error);
        this.messagesService.showError('Failed to create thing');
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
