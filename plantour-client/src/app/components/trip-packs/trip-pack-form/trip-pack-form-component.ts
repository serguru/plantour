import { Component, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LookupService } from '../../../services/lookup-service';
import { CreateTripPackageRequest, TripPackageDto, TripPackageService, UpdateTripPackageRequest } from '../../../services/trip-package-service';
import { MessagePanel } from '../../message-panel/message-panel-component/message-panel-component';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader, MenuConfig } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { TripThingService } from '../../../services/trip-thing-service';
import { UsersService } from '../../../services/users-service';
import { MessagesService } from '../../../services/messages-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { combineLatest, map } from 'rxjs';
import { CreatePackageRequest, PackageService } from '../../../services/package-service';
import { Checkbox } from 'primeng/checkbox';
import { InputNumber } from 'primeng/inputnumber';
import { allTogetherValidator } from '../../../helpers/all-together-validator';

@Component({
  selector: 'app-trip-pack-form-component',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    AutoFocusDirective,
    FormHeader,
    FormActions,
    Checkbox,
    InputNumber,
    Select
  ],
  templateUrl: './trip-pack-form-component.html',
  styleUrl: './trip-pack-form-component.scss',
})
export class TripPackFormComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  service = inject(TripPackageService);
  packageService = inject(PackageService);
  usersService = inject(UsersService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);
  lookupService = inject(LookupService);

  lookupPackNames$;
  lookupUnits$;

  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  tripId: string | null = null;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Trip Bag`;
  }

  menuItems = computed<MenuConfig[]>(() => []);

  ngOnInit(): void {

    this.tripId = this.route.snapshot.params['tripId'];

    // This should be ensured by the route guard
    if (!this.tripId) {
      throw new Error('Trip Id is required to create or edit a trip bag');
    }

    this.lookupPackNames$ = combineLatest([this.packageService.getAll(), this.service.getAll(this.tripId!)]).pipe(
      map(([packages, tripPacks]) => {
        const packageNames = Array.from(new Set(packages.map(x => x.name).filter(x => !!x)));
        const tripPackNames = Array.from(new Set(tripPacks.map(x => x.name).filter(x => !!x)));
        const resultNames = packageNames.filter(x => !tripPackNames.some(y => y.toLowerCase() === x.toLowerCase()));
        return resultNames.sort((a, b) => a.localeCompare(b));
      })
    );

    this.lookupUnits$ = combineLatest([this.lookupService.units$, this.service.getAll(this.tripId!)]).pipe(
      map(([units, tripPacks]) => {
        const unitNames = Array.from(new Set(units.map(x => x.name).filter(x => !!x)));
        const tripPackNames = Array.from(new Set(tripPacks.map(x => x.weightUnit).filter(x => !!x)));
        const resultNames = [...unitNames, ...tripPackNames].filter((item, index, self) =>
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
      throw new Error('Id is required to edit a trip bag');
    }
    this.loadPack();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: new FormControl('', Validators.required),
      label: new FormControl(''),
      notes: new FormControl(''),
      packingListIncluded: new FormControl(false),
      weightValue: new FormControl(null),
      weightUnit: new FormControl(''),
    },{validators: allTogetherValidator(['weightValue', 'weightUnit'])});
  }

  private loadPack(): void {
    if (!this.id) return;

    this.service.getById(this.id, this.tripId!).subscribe({
      next: (pack: TripPackageDto) => {
        this.form.patchValue({
          name: pack.name,
          label: pack.label,
          packingListIncluded: pack.packingListIncluded,
          weightValue: pack.weightValue,
          weightUnit: pack.weightUnit,
          notes: pack.notes
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messagesService.showWarning('Please fill in all required fields correctly');
      return;
    }


    if (this.isAddMode) {
      this.addPack();
    } else {
      this.updatePack();
    }
  }

  private addPack() {
    const formValue = this.form.value;
    const request: CreateTripPackageRequest = {
      tripId: this.tripId!,
      name: formValue.name?.trim(),
      notes: formValue.notes?.trim() || undefined,
      label: formValue.label?.trim() || undefined,
      packingListIncluded: formValue.packingListIncluded,
      weightValue: formValue.weightValue || null,
      weightUnit: formValue.weightUnit || null
    };

    this.service.add(request).subscribe({
      next: (pack: TripPackageDto) => {
        this.localStorageService.setComponentKey('trip-packs', 'selectedId', pack.id);
        this.messagesService.showInfo('Bag added successfully');
        this.router.navigate([this.tripPacksUrl]);
      }
    });
  }

  private updatePack(): void {
    if (!this.id) return;

    const formValue = this.form.getRawValue();
    const request: UpdateTripPackageRequest = {
      id: this.id,
      tripId: this.tripId!,
      name: formValue.name?.trim(),
      label: formValue.label?.trim() || undefined,
      weightValue: formValue.weightValue || null,
      weightUnit: formValue.weightUnit || null,
      packingListIncluded: formValue.packingListIncluded,
      notes: formValue.notes?.trim() || undefined
    };

    this.service.update(request).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('trip-packs', 'selectedId', this.id!);
        this.messagesService.showInfo('Bag updated successfully');
        this.router.navigate([this.tripPacksUrl]);
      }
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.tripPacksUrl]);
  }

  get tripPacksUrl(): string {
    const url = `/trips/${this.tripId}/trip-packs`;
    return url;
  }
}
