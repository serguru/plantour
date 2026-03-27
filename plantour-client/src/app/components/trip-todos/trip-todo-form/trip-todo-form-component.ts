import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select, SelectChangeEvent } from 'primeng/select';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { LookupService } from '../../../services/lookup-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { MessagesService } from '../../../services/messages-service';
import { CreateTripTodoRequest, TripTodoDto, TripTodoService, UpdateTripTodoRequest } from '../../../services/trip-todo-service';
import { TodoService } from '../../../services/todo-service';

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
  ],
  templateUrl: './trip-todo-form-component.html',
  styleUrl: './trip-todo-form-component.scss',
})
export class TripTodoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  service = inject(TripTodoService);
  todoService = inject(TodoService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);
  lookupService = inject(LookupService);

  lookupCategories$;
  lookupTripTodos$;

  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  tripId: string | null = null;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Trip Todo`;
  }

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
            notes: todo?.notes ?? null,
          };
        });

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
      throw new Error('Id is required to edit a trip todo');
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

    this.service.getById(this.id, this.tripId!).subscribe({
      next: (todo: TripTodoDto) => {
        this.form.patchValue({
          name: todo.name,
          category: todo.category,
          notes: todo.notes,
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
      this.addTodo();
      return;
    }

    this.updateTodo();
  }

  private addTodo(): void {
    const formValue = this.form.value;
    const request: CreateTripTodoRequest = {
      tripId: this.tripId!,
      name: formValue.name.trim(),
      category: formValue.category?.trim() || undefined,
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
      category: formValue.category?.trim() || undefined,
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

  onChangeName(event: SelectChangeEvent): void {
    if (event.value == null) {
      return;
    }

    if (typeof event.value === 'object') {
      this.form.patchValue({
        name: event.value.name,
        category: event.value.category,
        notes: event.value.notes,
      });
      return;
    }

    this.form.controls['name'].patchValue(event.value);
  }
}