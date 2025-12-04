import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { UserThingService, MessagesService } from 'shared-lib';

@Component({
  selector: 'app-edit-thing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, Select],
  templateUrl: './edit-thing.component.html',
  styleUrl: './edit-thing.component.scss'
})
export class EditThingComponent implements OnInit {
  private userThingService = inject(UserThingService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  thingId: string = '';
  thingForm: FormGroup;
  categories: any[] = [];
  isSubmitting: boolean = false;
  isLoading: boolean = true;

  constructor() {
    this.thingForm = this.fb.group({
      shortDescription: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      categoryId: [null]
    });
  }

  ngOnInit(): void {
    
    this.thingId = this.route.snapshot.paramMap.get('id') || '';

    if (this.thingId) {
      this.loadThing();
    } else {
      this.messagesService.showError('Thing ID not found');
      this.router.navigate(['/things']);
      return;
    }

    this.userThingService.getAllCategories().subscribe(categories =>
      this.categories = categories
    );

  }

  private loadThing(): void {
    this.userThingService.getById(this.thingId).subscribe({
      next: (thing) => {
        this.thingForm.patchValue({
          shortDescription: thing.shortDescription || '',
          description: thing.description || '',
          categoryId: thing.categoryId || null
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
      thingId: this.thingId,
      categoryId: formValue.categoryId || null,
      shortDescription: formValue.shortDescription.trim(),
      description: formValue.description?.trim() || null
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
