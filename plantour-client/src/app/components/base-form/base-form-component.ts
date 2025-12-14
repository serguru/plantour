import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud-service';
import { catchError, EMPTY, finalize } from 'rxjs';
import { ContentLayoutComponent } from '../layouts/content-layout.component';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessagesService } from '../../services/messages-service';
import { Router } from '@angular/router';
import { LookupService } from '../../services/lookup-service';
import { ToolbarAware } from '../toolbar-aware';
import deepEqual from 'fast-deep-equal/es6';

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
export class BaseFormComponent<T, TA, TU> extends ToolbarAware implements OnInit {

  constructor() {
    super();
  }

  private initialValue!: any;

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
  @Input() toolBarButtons: any[] | null = null;


  fb = inject(FormBuilder);
  lookupsService = inject(LookupService);
  form!: FormGroup;
  isLoading = false;
  errorMessage?: string;

  get title(): string {
    return `${this.isAddMode ? 'Add' : 'Edit'} ${this.entityName}`;
  }

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  private setupToolbarButtons(): void {
    if (!this.toolBarButtons) return;

    this.setToolbarButtons(
      this.toolBarButtons
    );
  }

  get submitEnabled(): boolean {
    if (this.isAddMode) {
      return true;
    } 
    return !deepEqual(this.initialValue, this.form.getRawValue());
  }

  ngOnInit() {


    this.setupToolbarButtons();
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
        this.initialValue = this.form.getRawValue();
      }
    })
  }

  isValidDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

    for (const [key, value] of Object.entries(newEntity)) {
      if (this.isValidDate(value)) {
        newEntity[key] = this.formatDate(value);
      }
      if (typeof value === 'string') {
        newEntity[key] = value.trim();
      }
      if (value === '') {
        newEntity[key] = null;
      }
    }

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
      newEntity.id = this.id;
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

  navigateBack(): void {
    if (this.backUrl) {
      if (!this.isAddMode) {
        this.router.navigate([this.backUrl], {
          queryParams: { selectId: this.id }
        });
        return;
      }
      this.router.navigate([this.backUrl]);
    }
  }

}
