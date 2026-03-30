import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { allTogetherValidator } from '../../../helpers/all-together-validator';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { dateRangeValidator } from '../../../helpers/date-range-validator';
import { capitalizeFirstLetter, getMessageFromError } from '../../../helpers/utils';
import { ItineraryService, CreateItineraryPartRequest, ItineraryPartDto, UpdateItineraryPartRequest } from '../../../services/itinerary-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { LookupService } from '../../../services/lookup-service';
import { MessagesService } from '../../../services/messages-service';
import { FormActions } from '../../form/form-actions/form-actions';
import { FormHeader, MenuConfig } from '../../form/form-header/form-header';

@Component({
  selector: 'app-trip-itinerary-form',
  standalone: true,
  imports: [
    CommonModule,
    DatePicker,
    FormActions,
    FormHeader,
    InputNumber,
    InputTextModule,
    ReactiveFormsModule,
    Select,
    TextareaModule,
    AutoFocusDirective,
  ],
  templateUrl: './trip-itinerary-form-component.html',
  styleUrl: './trip-itinerary-form-component.scss',
})
export class TripItineraryFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly itineraryService = inject(ItineraryService);
  readonly lookupService = inject(LookupService);
  readonly messagesService = inject(MessagesService);
  readonly localStorageService = inject(LocalStorageService);

  lookupCategories$;

  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  tripId: string | null = null;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Itinerary Part`;
  }

  menuItems = computed<MenuConfig[]>(() => []);

  ngOnInit(): void {
    this.tripId = this.route.snapshot.params['tripId'];
    if (!this.tripId) {
      throw new Error('Trip Id is required to create or edit an itinerary part');
    }

    this.lookupCategories$ = combineLatest([
      this.lookupService.itineraryPartCategories$,
      this.itineraryService.getAll(this.tripId),
    ]).pipe(
      map(([defaultCategories, parts]) => {
        const resultNames = [
          ...defaultCategories.map((item) => item.name).filter((item) => !!item),
          ...parts.map((item) => item.category).filter((item): item is string => !!item),
        ].filter((item, index, self) => index === self.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()));

        return resultNames.sort((a, b) => a.localeCompare(b));
      })
    );

    this.mode = this.route.snapshot.data['mode'];
    this.initForm();
    if (this.isAddMode) {
      return;
    }

    this.id = this.route.snapshot.params['id'];
    if (!this.id) {
      throw new Error('Id is required to edit an itinerary part');
    }

    this.loadPart();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: new FormControl('', Validators.required),
      category: new FormControl(''),
      startDate: new FormControl<string | null>(null, Validators.required),
      endDate: new FormControl<string | null>(null),
      address: new FormControl(''),
      latitude: new FormControl<number | null>(null, [Validators.min(-90), Validators.max(90)]),
      longitude: new FormControl<number | null>(null, [Validators.min(-180), Validators.max(180)]),
      notes: new FormControl(''),
    }, {
      validators: [
        dateRangeValidator,
        allTogetherValidator(['latitude', 'longitude'], 'coordinatesPairRequired'),
      ],
    });
  }

  private loadPart(): void {
    this.itineraryService.getById(this.id!, this.tripId!).subscribe({
      next: (part: ItineraryPartDto) => {
        this.form.patchValue({
          name: part.name,
          category: part.category,
          startDate: this.toDateInputValue(part.startDate),
          endDate: this.toDateInputValue(part.endDate),
          address: part.address,
          latitude: part.latitude,
          longitude: part.longitude,
          notes: part.notes,
        });
      },
    });
  }

  private toDateInputValue(value?: string | null): string | null {
    return value ? value.slice(0, 10) : null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messagesService.showWarning('Please fill in all required fields correctly');
      return;
    }

    if (this.isAddMode) {
      this.addPart();
      return;
    }

    this.updatePart();
  }

  private addPart(): void {
    const formValue = this.form.getRawValue();
    const request: CreateItineraryPartRequest = {
      tripId: this.tripId!,
      name: formValue.name.trim(),
      category: formValue.category?.trim() || undefined,
      startDate: formValue.startDate,
      endDate: formValue.endDate || null,
      address: formValue.address?.trim() || null,
      latitude: formValue.latitude ?? null,
      longitude: formValue.longitude ?? null,
      notes: formValue.notes?.trim() || undefined,
    };

    this.itineraryService.add(request).subscribe({
      next: (part) => {
        this.localStorageService.setComponentKey('trip-itinerary', 'selectedId', part.id);
        this.messagesService.showInfo('Itinerary part added successfully');
        this.router.navigate([this.itineraryUrl]);
      },
      error: (error) => {
        const errorMessage = getMessageFromError(error, 'Adding itinerary part failed');
        this.messagesService.showError(errorMessage);
      },
    });
  }

  private updatePart(): void {
    const formValue = this.form.getRawValue();
    const request: UpdateItineraryPartRequest = {
      id: this.id!,
      tripId: this.tripId!,
      name: formValue.name.trim(),
      category: formValue.category?.trim() || undefined,
      startDate: formValue.startDate,
      endDate: formValue.endDate || null,
      address: formValue.address?.trim() || null,
      latitude: formValue.latitude ?? null,
      longitude: formValue.longitude ?? null,
      notes: formValue.notes?.trim() || undefined,
    };

    this.itineraryService.update(request).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('trip-itinerary', 'selectedId', this.id!);
        this.messagesService.showInfo('Itinerary part updated successfully');
        this.router.navigate([this.itineraryUrl]);
      },
      error: (error) => {
        const errorMessage = getMessageFromError(error, 'Updating itinerary part failed');
        this.messagesService.showError(errorMessage);
      },
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.itineraryUrl]);
  }

  get itineraryUrl(): string {
    return `/trips/${this.tripId}/itinerary`;
  }
}