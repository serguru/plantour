import { Component, EventEmitter, HostListener, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud-service';
import { catchError, EMPTY, finalize } from 'rxjs';
import { ContentLayoutComponent } from '../layouts/content-layout.component';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessagesService } from '../../services/messages-service';
import { Router } from '@angular/router';
import { LookupService } from '../../services/lookup-service';
import deepEqual from 'fast-deep-equal';
import { ToolbarService } from '../../services/toolbar-service';
import { MessagePanelComponent } from '../message-panel/message-panel-component/message-panel-component';

export type BaseFormMode = 'add' | 'edit';

@Component({
  selector: 'app-base-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ContentLayoutComponent,
    CommonModule,
    ButtonModule,
    MessagePanelComponent
  ],
  templateUrl: './base-form-component.html',
  styleUrl: './base-form-component.scss',
})
export class BaseFormComponent<T, TA, TU> implements OnInit {

  constructor() {
  }

  get cancelDisabled() {
    return this.isLoading;
  }

  get enterDisabled() {
    return this.isLoading || !this.submitEnabled;
  }

  @HostListener('window:keydown.enter', ['$event'])
  handleEnter(event: Event) {
    this.onSubmit();
  }

  @HostListener('window:keydown.escape', ['$event'])
  handleEsc(event: Event) {
    this.navigateBack();
  }

  private initialValue!: any;

  messagesService = inject(MessagesService);

  toolbarService = inject(ToolbarService);

  router = inject(Router);

  @Input() service!: CrudService<T, TA, TU>;
  @Input() fieldsConfig!: { [key: string]: any };
  @Input() formTemplate!: any;
  @Input() mode!: BaseFormMode;
  @Input() id: string | null = null;
  @Input() tripId: string | null = null;
  @Input() entityIcon!: string;
  @Input() entityName!: string;
  @Input() backUrl: string | null = null;
  @Input() toolBarButtons: any[] | null = null;
  @Output() formReady = new EventEmitter<any>();


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

    this.toolbarService.setCurrentButtons(
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
      this.formReady.emit(this);
      return;
    }

    this.isLoading = true;

    this.service.getById(this.id!, this.tripId).pipe(
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
        this.formReady.emit(this);
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
    if (this.enterDisabled) {
      return;
    }

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

    if (this.cancelDisabled || !this.backUrl) {
      return;
    }

    if (!this.isAddMode) {
      this.router.navigate([this.backUrl], {
        queryParams: { selectId: this.id }
      });
      return;
    }
    this.router.navigate([this.backUrl]);
  }

}
