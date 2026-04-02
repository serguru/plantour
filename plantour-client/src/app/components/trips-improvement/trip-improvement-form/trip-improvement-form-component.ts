import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CreateTripImprovementRequest, TripImprovementDto, TripImprovementService, UpdateTripImprovementRequest } from '../../../services/trip-improvement-service';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader, MenuConfig } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { MessagesService } from '../../../services/messages-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { capitalizeFirstLetter } from '../../../helpers/utils';

@Component({
  selector: 'app-trip-improvement-form-component',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    InputNumber,
    Checkbox,
    AutoFocusDirective,
    FormHeader,
    FormActions,
  ],
  templateUrl: './trip-improvement-form-component.html',
  styleUrl: './trip-improvement-form-component.scss',
})
export class TripImprovementFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  service = inject(TripImprovementService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);

  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  tripId: string | null = null;
  form!: FormGroup;
  private existingImprovements: TripImprovementDto[] = [];

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Trip Improvement`;
  }

  menuItems = computed<MenuConfig[]>(() => []);

  ngOnInit(): void {
    this.tripId = this.route.snapshot.params['tripId'];
    if (!this.tripId) {
      throw new Error('Trip Id is required to create or edit a trip improvement');
    }

    this.mode = this.route.snapshot.data['mode'];
    this.initForm();

    this.service.getAll(this.tripId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((improvements) => {
      this.existingImprovements = improvements || [];

      if (this.isAddMode) {
        const nextOrder = this.getNextOrder();
        this.form.patchValue({ improvementOrder: nextOrder });
      }
    });

    if (this.isAddMode) {
      return;
    }

    this.id = this.route.snapshot.params['id'];
    if (!this.id) {
      throw new Error('Id is required to edit a trip improvement');
    }

    this.loadImprovement();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: new FormControl('', Validators.required),
      improvementOrder: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      notes: new FormControl(''),
      accepted: new FormControl(false),
      rejected: new FormControl(false),
    });
  }

  private loadImprovement(): void {
    if (!this.id) {
      return;
    }

    this.service.getById(this.id, this.tripId!).subscribe({
      next: (improvement: TripImprovementDto) => {
        this.form.patchValue({
          name: improvement.name,
          improvementOrder: improvement.improvementOrder,
          notes: improvement.notes,
          accepted: improvement.finished === 'success',
          rejected: improvement.finished === 'failure',
        });
      }
    });
  }

  onAcceptedChange(event: CheckboxChangeEvent): void {
    if (!event.checked) {
      return;
    }

    this.form.patchValue({ rejected: false }, { emitEvent: false });
  }

  onRejectedChange(event: CheckboxChangeEvent): void {
    if (!event.checked) {
      return;
    }

    this.form.patchValue({ accepted: false }, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messagesService.showWarning('Please fill in all required fields correctly');
      return;
    }

    if (this.isAddMode) {
      this.addImprovement();
      return;
    }

    this.updateImprovement();
  }

  private addImprovement(): void {
    const formValue = this.form.getRawValue();
    if (this.isDuplicateOrder(formValue.improvementOrder, null)) {
      this.messagesService.showWarning('Improvement order must be unique within this trip');
      return;
    }

    const request: CreateTripImprovementRequest = {
      tripId: this.tripId!,
      name: formValue.name?.trim(),
      improvementOrder: formValue.improvementOrder,
      notes: formValue.notes?.trim() || undefined,
      finished: this.getFinishedValue(formValue),
    };

    this.service.add(request).subscribe({
      next: (improvement: TripImprovementDto) => {
        this.localStorageService.setComponentKey('trips-improvement', 'selectedId', improvement.id);
        this.messagesService.showInfo('Trip improvement added successfully');
        void this.router.navigate([this.tripImprovementsUrl]);
      }
    });
  }

  private updateImprovement(): void {
    if (!this.id) {
      return;
    }

    const formValue = this.form.getRawValue();
    if (this.isDuplicateOrder(formValue.improvementOrder, this.id)) {
      this.messagesService.showWarning('Improvement order must be unique within this trip');
      return;
    }

    const request: UpdateTripImprovementRequest = {
      id: this.id,
      tripId: this.tripId!,
      name: formValue.name?.trim(),
      improvementOrder: formValue.improvementOrder,
      notes: formValue.notes?.trim() || undefined,
      finished: this.getFinishedValue(formValue),
    };

    this.service.update(request).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('trips-improvement', 'selectedId', this.id!);
        this.messagesService.showInfo('Trip improvement updated successfully');
        void this.router.navigate([this.tripImprovementsUrl]);
      }
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    void this.router.navigate([this.tripImprovementsUrl]);
  }

  get tripImprovementsUrl(): string {
    return `/trips/${this.tripId}/trips-improvement`;
  }

  private getNextOrder(): number {
    if (!this.existingImprovements.length) {
      return 1;
    }

    return Math.max(...this.existingImprovements.map(x => x.improvementOrder || 0)) + 1;
  }

  private isDuplicateOrder(order: number | null | undefined, currentId: string | null): boolean {
    if (!order) {
      return false;
    }

    return this.existingImprovements.some(x => x.improvementOrder === order && x.id !== currentId);
  }

  private getFinishedValue(formValue: { accepted?: boolean | null; rejected?: boolean | null }): string | null {
    if (formValue.accepted) {
      return 'success';
    }

    if (formValue.rejected) {
      return 'failure';
    }

    return null;
  }
}