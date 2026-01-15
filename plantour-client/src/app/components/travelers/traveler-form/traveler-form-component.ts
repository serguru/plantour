import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AdminsParticipantService, AdminsParticipantDto, UpdateAdminsParticipantRequest } from '../../../services/admins-participant-service';
import { UsersService } from '../../../services/users-service';
import { MessagesService } from '../../../services/messages-service';
import { LookupService } from '../../../services/lookup-service';
import { SignUpParticipantRequest } from '../../../models/auth.models';
import { catchError, EMPTY, finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessagePanel } from '../../message-panel/message-panel-component/message-panel-component';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { AppButton } from '../../button/button-component';
import { EntitiesHeader } from '../../entities/entities-header-component/entities-header-component';
import { FormHeader } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { ComponentService } from '../../../services/component-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-traveler-form-component',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    ButtonModule,
    MessagePanel,
    AutoFocusDirective,
    
    FormHeader,
    FormActions
  ],
  templateUrl: './traveler-form-component.html',
  styleUrl: './traveler-form-component.scss',
})
export class TravelerFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  service = inject(AdminsParticipantService);
  usersService = inject(UsersService);
  messagesService = inject(MessagesService);
  lookupsService = inject(LookupService);

  componentService = inject(ComponentService);

  isLoading = toSignal(this.componentService.loading$);
  
  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  form!: FormGroup;
  
  errorMessage = '';
  participantId = '';

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${this.isAddMode ? 'Add' : 'Edit'} Traveler`;
  }

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];
    
    if (this.isAddMode) {
      this.initAddForm();
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
      this.initEditForm();
      this.loadTraveler();
    }
  }

  private initAddForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      phone: [''],
      notes: [''],
    });
  }

  private initEditForm(): void {
    // In edit mode, only notes can be updated based on UpdateAdminsParticipantRequest
    this.form = this.fb.group({
      email: [{ value: '', disabled: true }],
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      phone: [{ value: '', disabled: true }],
      notes: ['']
    });
  }

  private loadTraveler(): void {
    if (!this.id) return;

    this.componentService.updateLoading(true);
    this.errorMessage = '';

    this.service.getById(this.id).pipe(
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Failed to load traveler. Please try again.';
        return EMPTY;
      }),
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: (traveler: AdminsParticipantDto) => {
        this.participantId = traveler.id;
        this.form.patchValue({
          email: traveler.email,
          firstName: traveler.firstName,
          lastName: traveler.lastName,
          phone: traveler.phone,
          notes: traveler.notes
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
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    this.componentService.updateLoading(true);
    this.errorMessage = '';

    if (this.isAddMode) {
      this.addTraveler();
    } else {
      this.updateTraveler();
    }
  }

  private addTraveler(): void {
    const formValue = this.form.value;
    const request: SignUpParticipantRequest = {
      email: formValue.email?.trim(),
      firstName: formValue.firstName?.trim() || undefined,
      lastName: formValue.lastName?.trim() || undefined,
      phone: formValue.phone?.trim() || undefined,
      notes: formValue.notes?.trim() || undefined
    };

    this.service.add(request).pipe(
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Failed to add traveler. Please try again.';
        return EMPTY;
      }),
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: () => {
        this.messagesService.showInfo('Traveler added successfully');
        this.router.navigate(['/travelers']);
      }
    });
  }

  private updateTraveler(): void {
    if (!this.id) return;

    const formValue = this.form.getRawValue();
    const request: UpdateAdminsParticipantRequest = {
      id: this.id,
      participantId: this.participantId,
      notes: formValue.notes?.trim() || null
    };

    this.service.update(request).pipe(
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Failed to update traveler. Please try again.';
        return EMPTY;
      }),
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: () => {
        this.messagesService.showInfo('Traveler updated successfully');
        this.router.navigate(['/travelers']);
      }
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/travelers']);
  }
}
