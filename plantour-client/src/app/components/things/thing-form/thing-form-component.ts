import { Component, inject, OnInit } from '@angular/core';
import { CreateThingRequest, ThingDto, ThingService, UpdateThingRequest } from '../../../services/thing-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AsyncPipe, CommonModule } from '@angular/common';
import { UsersService } from '../../../services/users-service';
import { CheckboxModule } from 'primeng/checkbox';
import { FormActions } from '../../form/form-actions/form-actions';
import { ButtonModule } from 'primeng/button';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { MessagePanel } from '../../message-panel/message-panel-component/message-panel-component';
import { FormHeader } from '../../form/form-header/form-header';
import { MessagesService } from '../../../services/messages-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { ComponentService } from '../../../services/component-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { catchError, combineLatest, EMPTY, finalize, map } from 'rxjs';
import { LookupService } from '../../../services/lookup-service';
import { InputNumber } from 'primeng/inputnumber';


// TODO: add together validators for value and units (both or none)
@Component({
  selector: 'app-item-form-component',
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    ButtonModule,
    AutoFocusDirective,
    FormHeader,
    FormActions,
    Select,
    InputNumber
  ],
  templateUrl: './thing-form-component.html',
  styleUrls: ['./thing-form-component.scss']
})
export class ThingFormComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  service = inject(ThingService);
  usersService = inject(UsersService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);
  componentService = inject(ComponentService);
  lookupService = inject(LookupService);

  lookupValues$ = combineLatest([
    this.lookupService.units$,
    this.lookupService.thingCategories$,
    this.service.getAll()
  ]).pipe(
    map(([lookupUnits, lookupCategories, thingsCategories]) => {

      const result: any = {};

      let lc = new Set(lookupCategories.map(x => x.name));
      let tc = new Set(thingsCategories.map(x => x.category).filter(x => !!x));
      let c = new Set<string>([...lc, ...tc].filter((x): x is string => x !== null && x !== undefined));

      result.categories = Array.from(c).sort((a,b) => a.localeCompare(b));


      lc = new Set(lookupUnits.map(x => x.name));
      tc = new Set(thingsCategories.map(x => x.units).filter(x => !!x));
      c = new Set<string>([...lc, ...tc].filter((x): x is string => x !== null && x !== undefined));

      result.units = Array.from(c).sort((a,b) => a.localeCompare(b));

      return result;

    }
    )
  );

  isLoading = toSignal(this.componentService.loading$);

  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Item`;
  }

  ngOnInit(): void {

    this.mode = this.route.snapshot.data['mode'];
    this.initForm();
    if (this.isAddMode) {
      return;
    }
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadThing();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      category: [''],
      notes: [''],
      units: [''],
      value: [null],
    });
  }


  private loadThing(): void {
    if (!this.id) return;

    this.componentService.updateLoading(true);
    this.service.getById(this.id).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: (thing: ThingDto) => {
        this.form.patchValue({
          name: thing.name,
          category: thing.category,
          notes: thing.notes,
          units: thing.units,
          value: thing.value
        });
      }
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
      this.addThing();
    } else {
      this.updateThing();
    }
  }


  private addThing() {
    const formValue = this.form.value;
    const request: CreateThingRequest = {
      name: formValue.name?.trim(),
      category: formValue.category?.trim() || undefined,
      notes: formValue.notes?.trim() || undefined,
      units: formValue.units?.trim() || undefined,
      value: formValue.value || undefined
    };


    this.componentService.updateLoading(true);
    this.service.add(request).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: (traveler: ThingDto) => {
        this.localStorageService.setComponentKey('things', 'selectedId', traveler.id);
        this.messagesService.showInfo('Item added successfully');
        this.router.navigate(['/things']);
      }
    });
  }

  private updateThing(): void {
    if (!this.id) return;

    const formValue = this.form.value;
    const request: UpdateThingRequest = {
      id: this.id,
      name: formValue.name?.trim(),
      category: formValue.category?.trim() || undefined,
      notes: formValue.notes?.trim() || undefined,
      units: formValue.units?.trim() || undefined,
      value: formValue.value || undefined
    };

    this.componentService.updateLoading(true);
    this.service.update(request).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('things', 'selectedId', this.id!);
        this.messagesService.showInfo('Item updated successfully');
        this.router.navigate(['/things']);
      }
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/things']);
  }
}

