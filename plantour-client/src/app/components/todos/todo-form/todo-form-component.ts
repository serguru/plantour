import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader, MenuConfig } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { LookupService } from '../../../services/lookup-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { MessagesService } from '../../../services/messages-service';
import { CreateTodoRequest, TodoDto, TodoService, UpdateTodoRequest } from '../../../services/todo-service';
import { dateRangeValidator } from '../../../helpers/date-range-validator';
import { allTogetherValidator } from '../../../helpers/all-together-validator';

@Component({
  selector: 'app-todo-form-component',
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
  templateUrl: './todo-form-component.html',
  styleUrl: './todo-form-component.scss',
})
export class TodoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  service = inject(TodoService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);
  lookupService = inject(LookupService);

  lookupValues$ = combineLatest([
    this.lookupService.todoCategories$,
    this.service.getAll(),
  ]).pipe(
    map(([lookupCategories, todos]) => {
      const categories = new Set([
        ...lookupCategories.map(x => x.name),
        ...todos.map(x => x.category).filter((x): x is string => !!x),
      ]);
      return Array.from(categories).sort((a, b) => a.localeCompare(b));
    })
  );

  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Todo`;
  }

  menuItems = computed<MenuConfig[]>(() => []);

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];
    this.initForm();
    if (this.isAddMode) {
      return;
    }
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadTodo();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      category: [''],
      startDate: [null as string | null],
      endDate: [null as string | null],
      address: [''],
      latitude: [null as number | null, [Validators.min(-90), Validators.max(90)]],
      longitude: [null as number | null, [Validators.min(-180), Validators.max(180)]],
      notes: [''],
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

    this.service.getById(this.id).subscribe({
      next: (todo: TodoDto) => {
        this.form.patchValue({
          name: todo.name,
          category: todo.category,
          startDate: this.toDateInputValue(todo.startDate),
          endDate: this.toDateInputValue(todo.endDate),
          address: todo.address,
          latitude: todo.latitude,
          longitude: todo.longitude,
          notes: todo.notes,
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
      this.addTodo();
      return;
    }
    this.updateTodo();
  }

  private addTodo() {
    const formValue = this.form.value;
    const request: CreateTodoRequest = {
      name: formValue.name?.trim(),
      category: formValue.category?.trim() || undefined,
      startDate: formValue.startDate || null,
      endDate: formValue.endDate || null,
      address: formValue.address?.trim() || null,
      latitude: formValue.latitude ?? null,
      longitude: formValue.longitude ?? null,
      notes: formValue.notes?.trim() || undefined,
    };

    this.service.add(request).subscribe({
      next: (todo: TodoDto) => {
        this.localStorageService.setComponentKey('todos', 'selectedId', todo.id);
        this.messagesService.showInfo('Todo added successfully');
        this.router.navigate(['/todos']);
      },
    });
  }

  private updateTodo(): void {
    if (!this.id) {
      return;
    }

    const formValue = this.form.value;
    const request: UpdateTodoRequest = {
      id: this.id,
      name: formValue.name?.trim(),
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
        this.localStorageService.setComponentKey('todos', 'selectedId', this.id!);
        this.messagesService.showInfo('Todo updated successfully');
        this.router.navigate(['/todos']);
      },
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/todos']);
  }
}