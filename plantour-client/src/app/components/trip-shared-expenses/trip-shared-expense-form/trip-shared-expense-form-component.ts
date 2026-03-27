import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LookupService } from '../../../services/lookup-service';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader, MenuConfig } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { LocalStorageService } from '../../../services/local-storage-service';
import { MessagesService } from '../../../services/messages-service';
import { TripService } from '../../../services/trip-service';
import { CreateTripSharedExpenseRequest, TripSharedExpenseDto, TripSharedExpenseService, UpdateTripSharedExpenseRequest } from '../../../services/trip-shared-expense-service';

@Component({
  selector: 'app-trip-shared-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    AutoFocusDirective,
    FormHeader,
    FormActions,
    Select,
    InputNumber,
  ],
  templateUrl: './trip-shared-expense-form-component.html',
  styleUrl: './trip-shared-expense-form-component.scss',
})
export class TripSharedExpenseFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  service = inject(TripSharedExpenseService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);
  lookupService = inject(LookupService);

  lookupCurrencies$ = this.lookupService.currencies$;
  lookupPaymentMethods$ = this.lookupService.paymentMethods$;

  mode: 'add' | 'edit' | 'view' = 'view';
  id: string | null = null;
  tripId: string | null = null;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  menuItems = computed<MenuConfig[]>(() => []);

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Trip Shared Expense`;
  }

  ngOnInit(): void {
    this.tripId = this.route.snapshot.params['tripId'];
    if (!this.tripId) {
      throw new Error('Trip Id is required to create or edit a trip shared expense');
    }

    this.mode = this.route.snapshot.data['mode'];
    this.initForm();
    if (this.isAddMode) {
      return;
    }
    this.id = this.route.snapshot.params['id'];
    if (!this.id) {
      throw new Error('Id is required to edit a trip shared expense');
    }
    this.loadExpense();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: new FormControl('', Validators.required),
      currencyId: new FormControl<string | null>(null),
      paymentMethod: new FormControl<string | null>(null),
      amount: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
      category: new FormControl(''),
      notes: new FormControl(''),
    });
  }

  private loadExpense(): void {
    if (!this.id) {
      return;
    }

    this.service.getById(this.id, this.tripId!).subscribe({
      next: (expense: TripSharedExpenseDto) => {
        this.form.patchValue({
          name: expense.name,
          currencyId: expense.currencyId,
          paymentMethod: expense.paymentMethod ?? null,
          amount: expense.amount,
          category: expense.category,
          notes: expense.notes,
        });
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messagesService.showWarning('Please fill in all required fields correctly');
      return;
    }
    if (this.isAddMode) {
      this.addExpense();
      return;
    }
    this.updateExpense();
  }

  private addExpense() {
    const formValue = this.form.value;
    const request: CreateTripSharedExpenseRequest = {
      tripId: this.tripId!,
      name: formValue.name.trim(),
      category: formValue.category?.trim() || null,
      paymentMethod: formValue.paymentMethod?.trim?.() || formValue.paymentMethod || null,
      currencyId: formValue.currencyId || null,
      amount: formValue.amount,
      notes: formValue.notes?.trim() || null,
    };

    this.service.add(request).subscribe({
      next: (expense: TripSharedExpenseDto) => {
        this.localStorageService.setComponentKey('trip-shared-expenses', 'selectedId', expense.id);
        this.messagesService.showInfo('Shared expense added successfully');
        this.router.navigate([this.tripSharedUrl]);
      },
    });
  }

  private updateExpense(): void {
    if (!this.id) {
      return;
    }

    const formValue = this.form.getRawValue();
    const request: UpdateTripSharedExpenseRequest = {
      id: this.id,
      tripId: this.tripId!,
      name: formValue.name.trim(),
      category: formValue.category?.trim() || null,
      paymentMethod: formValue.paymentMethod?.trim?.() || formValue.paymentMethod || null,
      currencyId: formValue.currencyId || null,
      amount: formValue.amount,
      notes: formValue.notes?.trim() || null,
    };

    this.service.update(request).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('trip-shared-expenses', 'selectedId', this.id!);
        this.messagesService.showInfo('Shared expense updated successfully');
        this.router.navigate([this.tripSharedUrl]);
      },
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.tripSharedUrl]);
  }

  get tripSharedUrl(): string {
    return `/trips/${this.tripId}/trip-shared-expenses`;
  }
}