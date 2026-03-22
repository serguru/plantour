import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { CreateTripUserRequest, TripUserDto, TripUserService, UpdateTripUserRequest } from '../../../services/trip-user-service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LookupService } from '../../../services/lookup-service';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader, MenuConfig } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { InputNumber } from 'primeng/inputnumber';
import { ThingService } from '../../../services/thing-service';
import { UsersService } from '../../../services/users-service';
import { MessagesService } from '../../../services/messages-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ComponentService } from '../../../services/component-service';
import { capitalizeFirstLetter, findDuplicates, getFullName } from '../../../helpers/utils';
import { AdminsParticipantDto, AdminsParticipantService } from '../../../services/admins-participant-service';
import { combineLatest, finalize, map, Observable, of, tap } from 'rxjs';
import { Checkbox } from 'primeng/checkbox';
import { CurrentTripService } from '../../../services/current-trip-service';

@Component({
  selector: 'app-trip-participants-form-component',
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
    InputNumber,
    Checkbox
  ],
  templateUrl: './trip-user-form-component.html',
  styleUrl: './trip-user-form-component.scss',
})
export class TripUserFormComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  service = inject(TripUserService);
  usersService = inject(UsersService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);
  componentService = inject(ComponentService);
  lookupService = inject(LookupService);
  adminsParticipantService = inject(AdminsParticipantService);
  currentTripService = inject(CurrentTripService);

  isLoading = toSignal(this.componentService.loading$);

  lookupTravelers: AdminsParticipantDto[] = [];
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

  participantId = '';

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Trip User`;
  }

  menuItems = computed<MenuConfig[]>(() => []);

  onTravelerChange(value: any): void {
    const selectedUser = this.lookupTravelers.find(x => x.id === value);
    if (selectedUser) {
      this.form.patchValue({
        email: selectedUser.email,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        phone: selectedUser.phone
      });
    };
  }

  ngOnInit(): void {
    this.tripId = this.route.snapshot.params['tripId'];
    // This should be ensured by the route guard
    if (!this.tripId) {
      throw new Error('Trip Id is required to create or edit a trip bag');
    }

    this.lookupUnits$ = combineLatest([
      this.lookupService.units$,
      this.service.getAll(this.tripId)
    ]).pipe(
      map(([lookupUnits, tripUsers]) => {
        const lookupUnitNames = new Set(lookupUnits.map(x => x.name));
        const tripUnits = new Set(tripUsers.map(x => x.nopackWeightUnit).filter(x => !!x));
        const combined = new Set<string>([...lookupUnitNames, ...tripUnits].filter((x): x is string => x !== null && x !== undefined));
        return Array.from(combined).sort((a, b) => a.localeCompare(b));
      })
    );

    this.mode = this.route.snapshot.data['mode'];

    if (this.isAddMode) {
      combineLatest([this.adminsParticipantService.getAll(), this.service.getAll(this.tripId)]).pipe(
        map(([users, tripUsers]) => {
          const userNames = Array.from(new Set(users.map(x => x.email).filter(x => !!x)));
          const tripUserNames = Array.from(new Set(tripUsers.map(x => x.email).filter(x => !!x)));
          let resultNames = userNames.filter(x => !tripUserNames.some(y => y.toLowerCase() === x.toLowerCase()));
          resultNames = resultNames.sort((a, b) => a.localeCompare(b));

          const resultUserDtos = resultNames.map(name => {
            const user = users.find(x => x.email?.toLowerCase() === name.toLowerCase())!;
            return user;
          });

          const duplicates = findDuplicates(resultUserDtos);

          resultUserDtos.forEach((x: any) => {
            x.fullName = getFullName(x.firstName ?? null, x.lastName ?? null, x.email, duplicates.some(y => y === x.id));
          });
          return resultUserDtos;
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(users => this.lookupTravelers = users);

    }


    this.initForm();

    if (!this.isAddMode) {
      this.id = this.route.snapshot.params['id'];
      if (!this.id) {
        throw new Error('Id is required to load a trip user');
      }
      this.loadTraveler();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      adminParticipantId: ['', [Validators.required]],
      fullName: [''],
      notes: [''],
      email: [''],
      firstName: [''],
      lastName: [''],
      phone: [''],
      packagingComplete: [false],
      nopackWeightValue: [null],
      nopackWeightUnit: ['']
    },);
  }

  private loadTraveler(): void {

    this.componentService.updateLoading(true);
    this.service.getByIdForAll(this.tripId!, this.id!).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: (user: TripUserDto) => {
        this.form.patchValue({
          adminParticipantId: user.adminParticipantId,
          fullName: getFullName(user.firstName ?? null, user.lastName ?? null, user.email, true),
          notes: user.notes,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          packagingComplete: user.packagingComplete,
          nopackWeightValue: user.nopackWeightValue,
          nopackWeightUnit: user.nopackWeightUnit,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.isLoading() || this.isViewMode) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messagesService.showWarning('Please fill in all required fields correctly');
      return;
    }
    if (this.isAddMode) {
      this.addTraveler();
    } else {
      this.updateTraveler();
    }
  }

  private addTraveler() {
    const formValue = this.form.value;
    const request: CreateTripUserRequest = {
      tripId: this.tripId!,
      adminParticipantId: formValue.adminParticipantId,
      notes: formValue.notes?.trim() || undefined,
      packagingComplete: formValue.packagingComplete,
      nopackWeightValue: formValue.nopackWeightValue || undefined,
      nopackWeightUnit: formValue.nopackWeightUnit?.trim() || undefined
    };

    this.componentService.updateLoading(true);
    this.service.add(request).pipe(
      tap(_ => {
        this.currentTripService.refreshCurrentTrip();
      }),
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: (user: TripUserDto) => {
        this.localStorageService.setComponentKey('trip-users', 'selectedId', user.id);
        this.messagesService.showInfo('User added successfully');
        this.router.navigate([this.tripUsersUrl]);
      }
    });
  }

  private updateTraveler(): void {
    if (!this.id) return;

    const formValue = this.form.getRawValue();
    const request: UpdateTripUserRequest = {
      id: this.id,
      tripId: this.tripId!,
      adminParticipantId: formValue.adminParticipantId,
      notes: formValue.notes?.trim() || undefined,
      packagingComplete: formValue.packagingComplete,
      nopackWeightValue: formValue.nopackWeightValue || undefined,
      nopackWeightUnit: formValue.nopackWeightUnit?.trim() || undefined
    };

    this.componentService.updateLoading(true);
    this.service.update(request).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('trip-users', 'selectedId', this.id!);
        this.messagesService.showInfo('User updated successfully');
        this.router.navigate([this.tripUsersUrl]);
      }
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.tripUsersUrl]);
  }

  get tripUsersUrl(): string {
    const url = `/trips/${this.tripId}/trip-participants`;
    return url;
  }
}

