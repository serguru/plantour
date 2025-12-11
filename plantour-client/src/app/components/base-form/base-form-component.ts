import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud-service';
import { catchError, EMPTY, finalize } from 'rxjs';
import { ContentLayoutComponent } from '../layouts/content-layout.component';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessagesService } from '../../services/messages-service';
import { Router } from '@angular/router';

export type BaseFormMode = 'add' | 'edit';

@Component({
  selector: 'app-base-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ContentLayoutComponent,
    CommonModule,
    ButtonModule
  ],
  templateUrl: './base-form-component.html',
  styleUrl: './base-form-component.scss',
})
export class BaseFormComponent<T, TA, TU> implements OnInit {

  messagesService = inject(MessagesService);

  router = inject(Router);

  @Input() service!: CrudService<T, TA, TU>;
  @Input() fieldsConfig!: { [key: string]: any };
  @Input() formTemplate!: any;
  @Input() mode!: BaseFormMode;
  @Input() id: string | null = null;
  @Input() entityIcon!: string;
  @Input() entityName!: string;
  @Input() backUrl: string | null = null;

  fb = inject(FormBuilder);
  form!: FormGroup;
  isLoading = false;
  errorMessage?: string;

  get title(): string {
    return `${this.isAddMode ? 'Add' : 'Edit'} ${this.entityName}`;
  }

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  ngOnInit() {
    this.form = this.fb.group(this.fieldsConfig);

    if (this.isAddMode) {
      return;
    }

    this.isLoading = true;

    this.service.getById(this.id!).pipe(
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Operatiopn failed. Please try again.';
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading = false;
      })

    ).subscribe({
      next: (entity) => {
        this.form.patchValue(entity as any);
      }
    })
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fill in all fields correctly';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const newEntity = this.form.value;

    if (this.isAddMode) {

      this.service.add(newEntity).pipe(
        catchError((error) => {
          this.errorMessage = error.error?.message || 'Operation failed. Please try again.';
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
        .subscribe({

          next: (response) => {
            this.messagesService.showInfo(`${this.entityName} added successfully`);
            this.router.navigate([this.backUrl], {
              queryParams: { selectId: (response as any).id }
            });

          }
        }

        )

    } else {
      newEntity.packageId = this.id;
      this.service.update(newEntity).pipe(
        catchError((error) => {
          this.errorMessage = error.error?.message || 'Operation failed. Please try again.';
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
        .subscribe({

          next: () => {
            this.messagesService.showInfo(`${this.entityName} updated successfully`);
            this.router.navigate([this.backUrl], {
              queryParams: { selectId: this.id }
            });
          }
        }
        )

    }

  }


}
