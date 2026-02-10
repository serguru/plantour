import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DOCUMENT, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { UsersService } from '../../../services/users-service';
import { MessagesService } from '../../../services/messages-service';
import { AppButton } from '../../button/button-component';
import { ContactSubmissionRequest } from '../../../models/contact.models';
import { SeoService } from '../../../services/seo-service';

@Component({
  selector: 'app-contact-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    AppButton
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './contact-component.html',
  styleUrl: './contact-component.scss',
})
export class ContactComponent {
  componentId = 'contact';
  contactForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  subjectCategories = [
    { label: 'General Inquiry', value: 'general' },
    { label: 'Bug Report', value: 'bug' },
    { label: 'Feature Request', value: 'feature' },
    { label: 'Feedback', value: 'feedback' },
    { label: 'Partnership', value: 'partnership' },
    { label: 'Other', value: 'other' }
  ];

  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);
  private seoService = inject(SeoService);
  private document = inject(DOCUMENT);

  constructor() {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phoneNumber: ['', [Validators.maxLength(20)]],
      subjectCategory: [''],
      messageBody: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]]
    });

    this.setSeo();
  }

  private setSeo(): void {
    const canonicalUrl = this.toAbsoluteUrl('/contact');
    const title = 'Contact | Plantour';
    const description = this.trimDescription(
      'Contact Plantour support for questions, bug reports, feature requests, feedback, or partnerships.',
    );

    this.seoService.setSeo({
      title,
      description,
      canonicalUrl,
      ogType: 'website',
      jsonLd: this.contactJsonLd({ canonicalUrl, title, description }),
    });
  }

  private trimDescription(value: string, maxLen = 160): string {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLen) {
      return normalized;
    }
    return `${normalized.slice(0, maxLen - 1).trimEnd()}…`;
  }

  private toAbsoluteUrl(path: string): string {
    try {
      return new URL(path, this.document.baseURI).toString();
    } catch {
      return path;
    }
  }

  private contactJsonLd(input: {
    canonicalUrl: string;
    title: string;
    description: string;
  }): Record<string, unknown> {
    const homeUrl = this.toAbsoluteUrl('/');

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: homeUrl },
            { '@type': 'ListItem', position: 2, name: 'Contact', item: input.canonicalUrl },
          ],
        },
        {
          '@type': 'ContactPage',
          '@id': input.canonicalUrl,
          url: input.canonicalUrl,
          name: input.title,
          description: input.description,
          isPartOf: {
            '@type': 'WebSite',
            '@id': homeUrl,
            url: homeUrl,
            name: 'Plantour',
          },
        },
      ],
    };
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.messagesService.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request: ContactSubmissionRequest = this.contactForm.value;

    this.usersService.submitContact(request).pipe(
      catchError((error) => {
        const errorMsg = error.error?.message || 'Failed to submit contact form. Please try again.';
        this.errorMessage = errorMsg;
        this.messagesService.showError('Submission Failed', errorMsg);
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: () => {
        this.messagesService.showInfo('Message sent', 'We have received your message and will get back to you soon.');
        this.contactForm.reset();
      }
    });
  }

  onBack(): void {
    this.location.back();
  }

  onLogoClick(): void {
    this.router.navigate(['']);
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return 'This field is required';
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `This field must be at least ${minLength} characters`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return `This field must not exceed ${maxLength} characters`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

