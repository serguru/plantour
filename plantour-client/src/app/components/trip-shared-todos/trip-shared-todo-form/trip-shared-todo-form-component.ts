import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, finalize, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select, SelectChangeEvent } from 'primeng/select';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader, MenuConfig } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { LookupService } from '../../../services/lookup-service';
import { ComponentService } from '../../../services/component-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { MessagesService } from '../../../services/messages-service';
import { CreateTripSharedTodoRequest, TripSharedTodoDto, TripSharedTodoService, UpdateTripSharedTodoRequest } from '../../../services/trip-shared-todo-service';
import { TodoService } from '../../../services/todo-service';

@Component({
  selector: 'app-trip-shared-todo-form',
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
    FormsModule,
  ],
  templateUrl: './trip-shared-todo-form-component.html',
  styleUrl: './trip-shared-todo-form-component.scss',
})
export class TripSharedTodoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  service = inject(TripSharedTodoService);
  todoService = inject(TodoService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);
  componentService = inject(ComponentService);
  lookupService = inject(LookupService);

  isLoading = toSignal(this.componentService.loading$);
  lookupCategories$;
  lookupTripTodos$;

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
    return `${capitalizeFirstLetter(this.mode)} Trip Shared Todo`;
  }

  ngOnInit(): void {
    this.tripId = this.route.snapshot.params['tripId'];
    if (!this.tripId) {
      throw new Error('Trip Id is required to create or edit a trip shared todo');
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

        resultNames = resultNames.map(x => ({ name: x, category: searchCategory(x) }));
        return resultNames.sort((a, b) => a.name.localeCompare(b.name));
      })
    );

    this.mode = this.route.snapshot.data['mode'];
    this.initForm();
    if (this.isAddMode) {
      return;
    }
    this.id = this.route.snapshot.params['id'];
    if (!this.id) {
      throw new Error('Id is required to edit a trip shared todo');
    }
    this.loadTodo();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: new FormControl('', Validators.required),
      category: new FormControl(''),
      notes: new FormControl(''),
    });
  }

  private loadTodo(): void {
    if (!this.id) {
      return;
    }

    this.componentService.updateLoading(true);
    this.service.getById(this.id, this.tripId!).pipe(
      finalize(() => this.componentService.updateLoading(false))
    ).subscribe({
      next: (todo: TripSharedTodoDto) => {
        this.form.patchValue({
          name: todo.name,
          category: todo.category,
          notes: todo.notes,
        });
      },
    });
  }

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }
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
    const request: CreateTripSharedTodoRequest = {
      tripId: this.tripId!,
      name: formValue.name.trim(),
      category: formValue.category?.trim() || undefined,
      notes: formValue.notes?.trim() || undefined,
    };

    this.componentService.updateLoading(true);
    this.service.add(request).pipe(
      finalize(() => this.componentService.updateLoading(false))
    ).subscribe({
      next: (todo: TripSharedTodoDto) => {
        this.localStorageService.setComponentKey('trip-shared-todos', 'selectedId', todo.id);
        this.messagesService.showInfo('Shared todo added successfully');
        this.router.navigate([this.tripSharedUrl]);
      },
    });
  }

  private updateTodo(): void {
    if (!this.id) {
      return;
    }

    const formValue = this.form.getRawValue();
    const request: UpdateTripSharedTodoRequest = {
      id: this.id,
      tripId: this.tripId!,
      name: formValue.name.trim(),
      category: formValue.category?.trim() || undefined,
      notes: formValue.notes?.trim() || undefined,
    };

    this.componentService.updateLoading(true);
    this.service.update(request).pipe(
      finalize(() => this.componentService.updateLoading(false))
    ).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('trip-shared-todos', 'selectedId', this.id!);
        this.messagesService.showInfo('Shared todo updated successfully');
        this.router.navigate([this.tripSharedUrl]);
      },
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.tripSharedUrl]);
  }

  get tripSharedUrl(): string {
    return `/trips/${this.tripId}/trip-shared-todos`;
  }

  onChangeName(event: SelectChangeEvent) {
    if (event.value == null) {
      return;
    }
    if (typeof event.value === 'object') {
      this.form.controls['name'].patchValue(event.value.name);
      this.form.controls['category'].patchValue(event.value.category);
      return;
    }
    this.form.controls['name'].patchValue(event.value);
  }
}