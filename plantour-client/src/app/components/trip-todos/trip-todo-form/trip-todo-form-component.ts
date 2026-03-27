import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select, SelectChangeEvent } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader, MenuConfig } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { LookupService } from '../../../services/lookup-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { MessagesService } from '../../../services/messages-service';
import { CreateTripTodoRequest, TripTodoDto, TripTodoService, UpdateTripTodoRequest } from '../../../services/trip-todo-service';
import { TodoService } from '../../../services/todo-service';
import { dateRangeValidator } from '../../../helpers/date-range-validator';
import { allTogetherValidator } from '../../../helpers/all-together-validator';
import { ItineraryPartDto, ItineraryService } from '../../../services/itinerary-service';

@Component({
  selector: 'app-trip-todo-form-component',
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
    DatePicker,
    InputNumber,
  ],
  templateUrl: './trip-todo-form-component.html',
  styleUrl: './trip-todo-form-component.scss',
})
export class TripTodoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  service = inject(TripTodoService);
  itineraryService = inject(ItineraryService);
  todoService = inject(TodoService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);
  lookupService = inject(LookupService);

  lookupCategories$;
  lookupTripTodos$;
  lookupItineraryParts$;

  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  tripId: string | null = null;
  form!: FormGroup;
  itineraryPartVisible = signal<boolean>(false);

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Trip Todo`;
  }

  menuItems = computed<MenuConfig[]>(() => [
    {
      label: `${this.itineraryPartVisible() ? 'Hide' : 'Show'} Itinerary Part`,
      icon: 'map',
      action: () => {
        const nextValue = !this.itineraryPartVisible();
        this.itineraryPartVisible.set(nextValue);
        this.localStorageService.setComponentKey('trip-todo-form', 'showItineraryPart', nextValue);
      },
    },
  ]);

  ngOnInit(): void {
    this.tripId = this.route.snapshot.params['tripId'];
    if (!this.tripId) {
      throw new Error('Trip Id is required to create or edit a trip todo');
    }

    this.lookupCategories$ = combineLatest([
      this.lookupService.todoCategories$,
      this.todoService.getAll(),
      this.service.getAll(this.tripId),
    ]).pipe(
      map(([defaultCategories, todos, tripTodos]) => {
        const resultNames = [
          ...defaultCategories.map(x => x.name).filter(x => !!x),
          ...todos.map(x => x.category).filter((x): x is string => !!x),
          ...tripTodos.map(x => x.category).filter((x): x is string => !!x),
        ].filter((item, index, self) => index === self.findIndex(t => t.toLowerCase() === item.toLowerCase()));
        return resultNames.sort((a, b) => a.localeCompare(b));
      })
    );

    this.lookupTripTodos$ = combineLatest([this.todoService.getAll(), this.service.getAll(this.tripId)]).pipe(
      map(([todos, tripTodos]) => {
        const todoNames = Array.from(new Set(todos.map(x => x.name).filter(x => !!x)));
        const tripTodoNames = Array.from(new Set(tripTodos.map(x => x.name).filter(x => !!x)));
        let resultNames: any = todoNames.filter(x => !tripTodoNames.some(y => y.toLowerCase() === x.toLowerCase()));

        const searchCategory = (name: string): string => {
          return todos.find(x => x.name?.toLowerCase() === name?.toLowerCase())?.category || '';
        };

        resultNames = resultNames.map(x => {
          const todo = todos.find(item => item.name?.toLowerCase() === x.toLowerCase());
          return {
            name: x,
            category: searchCategory(x),
            address: todo?.address ?? null,
            latitude: todo?.latitude ?? null,
            longitude: todo?.longitude ?? null,
            notes: todo?.notes ?? null,
          };
        });
        return resultNames.sort((a, b) => a.name.localeCompare(b.name));
      })
    );

    this.lookupItineraryParts$ = this.itineraryService.getAll(this.tripId).pipe(
      map((parts: ItineraryPartDto[]) => {
        return [...parts].sort((a, b) => {
          const startDateComparison = (a.startDate || '').localeCompare(b.startDate || '');
          return startDateComparison !== 0 ? startDateComparison : a.name.localeCompare(b.name);
        });
      })
    );

    this.mode = this.route.snapshot.data['mode'];
    this.initForm();

    const itineraryPartVisible = this.localStorageService.getComponentBooleanKey('trip-todo-form', 'showItineraryPart', false);
    this.itineraryPartVisible.set(itineraryPartVisible);

    if (this.isAddMode) {
      return;
    }
    this.id = this.route.snapshot.params['id'];
    if (!this.id) {
      throw new Error('Id is required to edit a trip todo');
    }
    this.loadTodo();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: new FormControl('', Validators.required),
      category: new FormControl(''),
      startDate: new FormControl<string | null>(null),
      endDate: new FormControl<string | null>(null),
      address: new FormControl(''),
      latitude: new FormControl<number | null>(null, [Validators.min(-90), Validators.max(90)]),
      longitude: new FormControl<number | null>(null, [Validators.min(-180), Validators.max(180)]),
      notes: new FormControl(''),
      itineraryPartId: new FormControl<string | null>(null),
    }, {
      validators: [
        allTogetherValidator(['startDate', 'endDate'], 'datePairRequired'),
        dateRangeValidator,
        allTogetherValidator(['latitude', 'longitude'], 'coordinatesPairRequired'),
      ],
    });
  }

  private loadTodo(): void {
    if (!this.id) {
      return;
    }

    this.service.getById(this.id, this.tripId!).subscribe({
      next: (todo: TripTodoDto) => {
        this.form.patchValue({
          name: todo.name,
          category: todo.category,
          startDate: this.toDateInputValue(todo.startDate),
          endDate: this.toDateInputValue(todo.endDate),
          address: todo.address,
          latitude: todo.latitude,
          longitude: todo.longitude,
          notes: todo.notes,
          itineraryPartId: todo.itineraryPartId ?? null,
        });

        if (todo.itineraryPartId) {
          this.itineraryPartVisible.set(true);
        }
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
      this.addTodo();
      return;
    }
    this.updateTodo();
  }

  private addTodo() {
    const formValue = this.form.value;
    const request: CreateTripTodoRequest = {
      tripId: this.tripId!,
      name: formValue.name.trim(),
      itineraryPartId: formValue.itineraryPartId || null,
      category: formValue.category?.trim() || undefined,
      startDate: formValue.startDate || null,
      endDate: formValue.endDate || null,
      address: formValue.address?.trim() || null,
      latitude: formValue.latitude ?? null,
      longitude: formValue.longitude ?? null,
      notes: formValue.notes?.trim() || undefined,
    };

    this.service.add(request).subscribe({
      next: (todo: TripTodoDto) => {
        this.localStorageService.setComponentKey('trip-todos', 'selectedId', todo.id);
        this.messagesService.showInfo('Todo added successfully');
        this.router.navigate([this.tripTodosUrl]);
      },
    });
  }

  private updateTodo(): void {
    if (!this.id) {
      return;
    }

    const formValue = this.form.getRawValue();
    const request: UpdateTripTodoRequest = {
      id: this.id,
      tripId: this.tripId!,
      name: formValue.name.trim(),
      itineraryPartId: formValue.itineraryPartId || null,
      category: formValue.category?.trim() || undefined,
      startDate: formValue.startDate || null,
      endDate: formValue.endDate || null,
      address: formValue.address?.trim() || null,
      latitude: formValue.latitude ?? null,
      longitude: formValue.longitude ?? null,
      notes: formValue.notes?.trim() || undefined,
    };

    this.service.update(request).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('trip-todos', 'selectedId', this.id!);
        this.messagesService.showInfo('Todo updated successfully');
        this.router.navigate([this.tripTodosUrl]);
      },
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.tripTodosUrl]);
  }

  get tripTodosUrl(): string {
    return `/trips/${this.tripId}/trip-todos`;
  }

  onChangeName(event: SelectChangeEvent) {
    if (event.value == null) {
      return;
    }
    if (typeof event.value === 'object') {
      this.form.patchValue({
        name: event.value.name,
        category: event.value.category,
        address: event.value.address,
        latitude: event.value.latitude,
        longitude: event.value.longitude,
        notes: event.value.notes,
      });
      return;
    }
    this.form.controls['name'].patchValue(event.value);
  }
}