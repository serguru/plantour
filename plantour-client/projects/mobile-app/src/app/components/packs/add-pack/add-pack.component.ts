import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { UserPackageService, UsersService, MessagesService } from 'shared-lib';
import { ContentLayoutComponent } from '../../layouts/content-layout.component';

@Component({
  selector: 'app-add-pack',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule,
      ContentLayoutComponent],
  templateUrl: './add-pack.component.html',
  styleUrl: './add-pack.component.scss'
})
export class AddPackComponent implements OnInit {
  private userPackageService = inject(UserPackageService);
  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  packForm: FormGroup;
  isSubmitting: boolean = false;

  constructor() {
    this.packForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['']
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
      if(this.packForm.invalid) {
      this.packForm.markAllAsTouched();
      return;
    }

    const currentUser = this.usersService.currentUser();
    if (!currentUser || !currentUser.user_id) {
      this.messagesService.showError('User not found');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.packForm.value;
    const request = {
      userId: currentUser.user_id,
      name: formValue.name.trim(),
      description: formValue.description?.trim() || null
    };

    this.userPackageService.add(request).subscribe({
      next: () => {
        this.messagesService.showInfo('Pack created successfully');
        this.router.navigate(['/packs']);
      },
      error: (error) => {
        console.error('Error creating pack:', error);
        this.messagesService.showError('Failed to create pack');
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
