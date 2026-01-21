import { Component, inject, OnInit, signal } from '@angular/core';
import { CreateTripSharedRequest, TripSharedDto, TripSharedService, UpdateTripSharedRequest } from '../../../services/trip-shared-service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LookupService } from '../../../services/lookup-service';
import { combineLatest, finalize, map, Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormHeader } from '../../form/form-header/form-header';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormActions } from '../../form/form-actions/form-actions';
import { InputNumber } from 'primeng/inputnumber';
import { ThingService } from '../../../services/thing-service';
import { UsersService } from '../../../services/users-service';
import { MessagesService } from '../../../services/messages-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { ComponentService } from '../../../services/component-service';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { allTogetherValidator } from '../../../helpers/all-together-validator';


// TODO: having spear time add 4-th memeber to categories lookup, here and in trip things
@Component({
  selector: 'app-trip-shared-form',
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
    InputNumber
  ],
  templateUrl: './trip-shared-form-component.html',
  styleUrl: './trip-shared-form-component.scss'
})
export class TripSharedFormComponent implements OnInit {

  fieldsConfig = {
    name: new FormControl('', Validators.required),
    category: new FormControl(''),
    notes: new FormControl(''),
    units: new FormControl(''),
    value: new FormControl(''),
    assignedToId: new FormControl(''),
    assignedDeadline: new FormControl('')
  };


  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  service = inject(TripSharedService);
  thingService = inject(ThingService);

  usersService = inject(UsersService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);
  componentService = inject(ComponentService);
  lookupService = inject(LookupService);

  isLoading = toSignal(this.componentService.loading$);

  lookupCategories$;
  lookupTripThings$;
  lookupUnits$;

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


  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Trip Shared Thing`;
  }

  ngOnInit(): void {

    this.tripId = this.route.snapshot.params['tripId'];

    // This should be ensured by the route guard
    if (!this.tripId) {
      throw new Error('Trip Id is required to create or edit a trip pack');
    }

    this.lookupCategories$ = combineLatest([
      this.lookupService.thingCategories$,
      this.thingService.getAll(),
      this.service.getAll(this.tripId)
    ]).pipe(
      map(([defaultCategories, thingCategories, tripCategories]) => {
        const defaultCategoryNames = Array.from(new Set(defaultCategories.map(x => x.name).filter(x => !!x)));
        const thingCategoryNames = Array.from(new Set(thingCategories.map(x => x.category).filter(x => !!x)));
        const tripCategoryNames = Array.from(new Set(tripCategories.map(x => x.category).filter(x => !!x)));

        const resultNames = [...defaultCategoryNames, ...thingCategoryNames, ...tripCategoryNames].filter((item, index, self) =>
          index === self.findIndex(t => t!.toLowerCase() === item!.toLowerCase())
        );
        return resultNames.sort((a, b) => a!.localeCompare(b!));
      })
    );

    this.lookupTripThings$ = combineLatest([this.thingService.getAll(), this.service.getAll(this.tripId)]).pipe(
      map(([things, tripThings]) => {
        const thingNames = Array.from(new Set(things.map(x => x.name).filter(x => !!x)));
        const tripThingNames = Array.from(new Set(tripThings.map(x => x.name).filter(x => !!x)));
        const resultNames = thingNames.filter(x => !tripThingNames.some(y => y.toLowerCase() === x.toLowerCase()));
        return resultNames.sort((a, b) => a.localeCompare(b));
      })
    );

    this.lookupUnits$ = combineLatest([
      this.lookupService.units$, 
      this.thingService.getAll(),
      this.service.getAll(this.tripId!),
    ]).pipe(
      map(([units, thingUnits, tripThings]) => {
        const unitNames = Array.from(new Set(units.map(x => x.name).filter(x => !!x)));
        const thingUnitNames = Array.from(new Set(thingUnits.map(x => x.units).filter(x => !!x)));
        const tripThingUnits = Array.from(new Set(tripThings.map(x => x.units).filter(x => !!x)));
        const resultNames = [...unitNames, ...thingUnitNames, ...tripThingUnits].filter((item, index, self) =>
          index === self.findIndex(t => t!.toLowerCase() === item!.toLowerCase())
        );
        return resultNames.sort((a, b) => a!.localeCompare(b!));
      })
    );

    this.mode = this.route.snapshot.data['mode'];
    this.initForm();
    if (this.isAddMode) {
      return;
    }
    this.id = this.route.snapshot.params['id'];
    if (!this.id) {
      throw new Error('Id is required to edit a trip shared thing');
    }
    this.loadThing();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: new FormControl('', Validators.required),
      category: new FormControl(''),
      notes: new FormControl(''),
      value: new FormControl(null),
      units: new FormControl(''),
      tripUserPackageId: new FormControl(''),
    }, { validators: allTogetherValidator(['value', 'units']) });
  }

  private loadThing(): void {
    if (!this.id) return;

    this.componentService.updateLoading(true);
    this.service.getById(this.id, this.tripId!).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: (pack: TripSharedDto) => {
        this.form.patchValue({
          name: pack.name,
          category: pack.category,
          notes: pack.notes,
          value: pack.value,
          units: pack.units
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
    const request: CreateTripSharedRequest = {
      tripId: this.tripId!,
      name: formValue.name.trim(),
      category: formValue.category?.trim() || undefined,
      notes: formValue.notes?.trim() || undefined,
      units: formValue.units?.trim() || null,
      value: formValue.value || null
    };

    this.componentService.updateLoading(true);
    this.service.add(request).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: (thing: TripSharedDto) => {
        this.localStorageService.setComponentKey('trip-shared', 'selectedId', thing.id);
        this.messagesService.showInfo('Shared Thing added successfully');
        this.router.navigate([this.tripSharedUrl]);
      }
    });
  }

  private updateThing(): void {
    if (!this.id) return;

    const formValue = this.form.getRawValue();
    const request: UpdateTripSharedRequest = {
      id: this.id,
      tripId: this.tripId!,
      name: formValue.name.trim(),
      category: formValue.category?.trim() || undefined,
      notes: formValue.notes?.trim() || undefined,
      units: formValue.units?.trim() || null,
      value: formValue.value || null
    };

    this.componentService.updateLoading(true);
    this.service.update(request).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('trip-shared', 'selectedId', this.id!);
        this.messagesService.showInfo('Shared Thing updated successfully');
        this.router.navigate([this.tripSharedUrl]);
      }
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.tripSharedUrl]);
  }

  get tripSharedUrl(): string {
    const url = `/trips/${this.tripId}/trip-shared`;
    return url;
  }
}

