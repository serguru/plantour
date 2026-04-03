import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader, MenuConfig } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { LookupService } from '../../../services/lookup-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { MessagesService } from '../../../services/messages-service';
import { TripService } from '../../../services/trip-service';
import { TripUserService } from '../../../services/trip-user-service';
import { UsersService } from '../../../services/users-service';
import { CreateTripExpenseRequest, TripExpenseDto, TripExpenseService, UpdateTripExpenseRequest } from '../../../services/trip-expense-service';

@Component({
  selector: 'app-trip-expense-form-component',
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
    Checkbox,
  ],
  templateUrl: './trip-expense-form-component.html',
  styleUrl: './trip-expense-form-component.scss',
})
export class TripExpenseFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  service = inject(TripExpenseService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);
  lookupService = inject(LookupService);
  tripService = inject(TripService);
  tripUserService = inject(TripUserService);
  usersService = inject(UsersService);

  lookupCurrencies$ = this.lookupService.currencies$;
  lookupPaymentMethods$ = this.lookupService.paymentMethods$;
  lookupRecipients$;

  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  tripId: string | null = null;
  tripCurrencyId: string | null = null;
  private isHydratingForm = false;
  private isAutofillingRate = false;
  private hasUserEditedRate = false;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Trip Expense`;
  }

  menuItems = computed<MenuConfig[]>(() => []);

  ngOnInit(): void {
    this.tripId = this.route.snapshot.params['tripId'];
    if (!this.tripId) {
      throw new Error('Trip Id is required to create or edit a trip expense');
    }

    this.mode = this.route.snapshot.data['mode'];
    this.initForm();

    this.lookupRecipients$ = this.tripUserService.getAll(this.tripId).pipe(
      map((tripUsers) => {
        const currentUserId = this.usersService.getCurrentUserId();
        return tripUsers
          .filter((tripUser) => tripUser.userId !== currentUserId)
          .map((tripUser) => ({
            id: tripUser.id,
            name: tripUser.fullName || tripUser.email,
          }));
      })
    );

    this.tripService.getById(this.tripId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((trip) => {
      this.tripCurrencyId = trip.currencyId;
      if (this.isAddMode && !this.hasUserEditedRate) {
        this.autofillRateForCurrentCurrency(false);
      }
    });

    if (this.isAddMode) {
      return;
    }

    this.id = this.route.snapshot.params['id'];
    if (!this.id) {
      throw new Error('Id is required to edit a trip expense');
    }
    this.loadExpense();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: new FormControl('', Validators.required),
      currencyId: new FormControl<string | null>(null),
      rate: new FormControl<number | null>(1, [Validators.required, Validators.min(0.00000001)]),
      paymentMethod: new FormControl<string | null>(null),
      amount: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
      shared: new FormControl(false),
      recipientId: new FormControl<string | null>(null),
      notes: new FormControl(''),
    });

    this.form.get('currencyId')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      if (this.isHydratingForm) {
        return;
      }

      this.hasUserEditedRate = false;
      this.autofillRateForCurrentCurrency(true);
    });

    this.form.get('rate')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      if (this.isHydratingForm || this.isAutofillingRate) {
        return;
      }

      this.hasUserEditedRate = true;
    });
  }

  private loadExpense(): void {
    if (!this.id) {
      return;
    }

    this.service.getById(this.id, this.tripId!).subscribe({
      next: (expense: TripExpenseDto) => {
        this.isHydratingForm = true;
        this.form.patchValue({
          name: expense.name,
          currencyId: expense.currencyId,
          rate: expense.rate ?? expense.effectiveRate ?? 1,
          paymentMethod: expense.paymentMethod ?? null,
          amount: expense.amount,
          shared: expense.shared,
          recipientId: expense.recipientId,
          notes: expense.notes,
        });
        this.isHydratingForm = false;
      },
    });
  }

  private autofillRateForCurrentCurrency(showWarningOnFailure: boolean): void {
    const currencyId = this.form?.get('currencyId')?.value ?? null;
    const rateControl = this.form?.get('rate');

    if (!rateControl) {
      return;
    }

    if (!currencyId || (this.tripCurrencyId && currencyId === this.tripCurrencyId)) {
      this.setRateControlValue(1);
      return;
    }

    this.service.getSuggestedRate(this.tripId!, currencyId).subscribe({
      next: (rate) => {
        if (this.form?.get('currencyId')?.value !== currencyId) {
          return;
        }

        this.setRateControlValue(rate);
      },
      error: () => {
        if (this.form?.get('currencyId')?.value !== currencyId) {
          return;
        }

        this.setRateControlValue(null);
        rateControl.markAsTouched();

        if (showWarningOnFailure) {
          this.messagesService.showWarning('Rate could not be filled automatically. Enter it manually.');
        }
      },
    });
  }

  private setRateControlValue(value: number | null): void {
    const rateControl = this.form?.get('rate');
    if (!rateControl) {
      return;
    }

    this.isAutofillingRate = true;
    rateControl.setValue(value, { emitEvent: false });
    this.isAutofillingRate = false;
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

  private addExpense(): void {
    const formValue = this.form.value;
    const request: CreateTripExpenseRequest = {
      tripId: this.tripId!,
      name: formValue.name.trim(),
      currencyId: formValue.currencyId || null,
      rate: formValue.rate,
      paymentMethod: formValue.paymentMethod?.trim?.() || formValue.paymentMethod || null,
      amount: formValue.amount,
      shared: !!formValue.shared,
      recipientId: formValue.recipientId || null,
      notes: formValue.notes?.trim() || null,
    };

    this.service.add(request).subscribe({
      next: (expense: TripExpenseDto) => {
        this.localStorageService.setComponentKey('trip-expenses', 'selectedId', expense.id);
        this.messagesService.showInfo('Expense added successfully');
        this.router.navigate([this.tripExpensesUrl]);
      },
    });
  }

  private updateExpense(): void {
    if (!this.id) {
      return;
    }

    const formValue = this.form.getRawValue();
    const request: UpdateTripExpenseRequest = {
      id: this.id,
      tripId: this.tripId!,
      name: formValue.name.trim(),
      currencyId: formValue.currencyId || null,
      rate: formValue.rate,
      paymentMethod: formValue.paymentMethod?.trim?.() || formValue.paymentMethod || null,
      amount: formValue.amount,
      shared: !!formValue.shared,
      recipientId: formValue.recipientId || null,
      notes: formValue.notes?.trim() || null,
    };

    this.service.update(request).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('trip-expenses', 'selectedId', this.id!);
        this.messagesService.showInfo('Expense updated successfully');
        this.router.navigate([this.tripExpensesUrl]);
      },
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.tripExpensesUrl]);
  }

  get tripExpensesUrl(): string {
    return `/trips/${this.tripId}/trip-expenses`;
  }
}