import { Component, inject, OnInit } from '@angular/core';
import { CreateTripThingRequest, TripThingDto, TripThingService, UpdateTripThingRequest } from '../../../services/trip-thing-service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LookupService } from '../../../services/lookup-service';
import { MessagePanel } from '../../message-panel/message-panel-component/message-panel-component';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { Checkbox } from 'primeng/checkbox';
import { InputNumber } from 'primeng/inputnumber';
import { PackageService } from '../../../services/package-service';
import { UsersService } from '../../../services/users-service';
import { MessagesService } from '../../../services/messages-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { ComponentService } from '../../../services/component-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { combineLatest, finalize, map } from 'rxjs';
import { TripPackageService } from '../../../services/trip-package-service';
import { allTogetherValidator } from '../../../helpers/all-together-validator';
import { ThingService } from '../../../services/thing-service';

@Component({
  selector: 'app-trip-thing-form-component',
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
  templateUrl: './trip-thing-form-component.html',
  styleUrl: './trip-thing-form-component.scss',
})
export class TripThingFormComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  service = inject(TripThingService);
  thingService = inject(ThingService);
  tripPackageService = inject(TripPackageService);
  usersService = inject(UsersService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);
  componentService = inject(ComponentService);
  lookupService = inject(LookupService);

  isLoading = toSignal(this.componentService.loading$);

  lookupCategories$;
  lookupTripThings$;
  lookupTripPacks$;
  lookupUnits$;

  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  tripId: string | null = null;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Trip Item`;
  }

  ngOnInit(): void {

    this.tripId = this.route.snapshot.params['tripId'];

    // This should be ensured by the route guard
    if (!this.tripId) {
      throw new Error('Trip Id is required to create or edit a trip bag');
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

    this.lookupTripPacks$ = this.tripPackageService.getAll(this.tripId).pipe(
      map(packages => {
        return packages.sort((a, b) => a.name.localeCompare(b.name));
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
      throw new Error('Id is required to edit a trip item');
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
      next: (pack: TripThingDto) => {
        this.form.patchValue({
          name: pack.name,
          category: pack.category,
          notes: pack.notes,
          value: pack.value,
          units: pack.units,
          tripUserPackageId: pack.tripUserPackageId
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
    const request: CreateTripThingRequest = {
      tripId: this.tripId!,
      name: formValue.name.trim(),
      category: formValue.category?.trim() || undefined,
      notes: formValue.notes?.trim() || undefined,
      units: formValue.units?.trim() || null,
      value: formValue.value || null,
      tripUserPackageId: formValue.tripUserPackageId || null,
    };

    this.componentService.updateLoading(true);
    this.service.add(request).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: (thing: TripThingDto) => {
        this.localStorageService.setComponentKey('trip-things', 'selectedId', thing.id);
        this.messagesService.showInfo('Item added successfully');
        this.router.navigate([this.tripThingsUrl]);
      }
    });
  }

  private updateThing(): void {
    if (!this.id) return;

    const formValue = this.form.getRawValue();
    const request: UpdateTripThingRequest = {
      id: this.id,
      tripId: this.tripId!,
      name: formValue.name.trim(),
      category: formValue.category?.trim() || undefined,
      notes: formValue.notes?.trim() || undefined,
      units: formValue.units?.trim() || null,
      value: formValue.value || null,
      tripUserPackageId: formValue.tripUserPackageId || null,
    };

    this.componentService.updateLoading(true);
    this.service.update(request).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('trip-things', 'selectedId', this.id!);
        this.messagesService.showInfo('Item updated successfully');
        this.router.navigate([this.tripThingsUrl]);
      }
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.tripThingsUrl]);
  }

  get tripThingsUrl(): string {
    const url = `/trips/${this.tripId}/trip-things`;
    return url;
  }
}

