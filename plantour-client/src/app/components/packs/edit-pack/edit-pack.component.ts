import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ContentLayoutComponent } from '../../layouts/content-layout.component';
import { UserPackageService } from '../../../services/user-package-service';
import { MessagesService } from '../../../services/messages-service';

@Component({
  selector: 'app-edit-pack',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, ContentLayoutComponent],
  templateUrl: './edit-pack.component.html',
  styleUrl: './edit-pack.component.scss'
})
export class EditPackComponent implements OnInit {
  private userPackageService = inject(UserPackageService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  packForm: FormGroup;
  isSubmitting: boolean = false;
  isLoading: boolean = true;
  packId: string = '';

  constructor() {
    this.packForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.packId = params['id'];
      if (this.packId) {
        this.loadPack();
      } else {
        this.messagesService.showError('Pack ID not provided');
        this.router.navigate(['/packs']);
      }
    });
  }

  private loadPack(): void {
    this.isLoading = true;
    this.userPackageService.getById(this.packId).subscribe({
      next: (pack) => {
        this.packForm.patchValue({
          name: pack.name,
          description: pack.description
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pack:', error);
        this.messagesService.showError('Failed to load pack');
        this.router.navigate(['/packs']);
      }
    });
  }

  onSubmit(): void {
    if (this.packForm.invalid) {
      this.packForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.packForm.value;
    const request = {
      packageId: this.packId,
      name: formValue.name.trim(),
      description: formValue.description?.trim() || null
    };

    this.userPackageService.update(request).subscribe({
      next: () => {
        this.messagesService.showInfo('Pack updated successfully');
        this.router.navigate(['/packs']);
      },
      error: (error) => {
        console.error('Error updating pack:', error);
        this.messagesService.showError('Failed to update pack');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/packs']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.packForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.packForm.get(fieldName);
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
