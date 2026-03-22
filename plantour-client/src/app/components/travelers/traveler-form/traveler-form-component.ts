import { Component, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { AdminsParticipantService, AdminsParticipantDto, UpdateAdminsParticipantRequest, CheckParticipantResponse, CheckParticipantStatus } from '../../../services/admins-participant-service';
import { UsersService } from '../../../services/users-service';
import { MessagesService } from '../../../services/messages-service';
import { SignUpParticipantRequest } from '../../../models/auth.models';
import { EMPTY, switchMap, mergeMap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader, MenuConfig } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { LocalStorageService } from '../../../services/local-storage-service';

@Component({
  selector: 'app-traveler-form-component',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    ButtonModule,
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
  localStorageService = inject(LocalStorageService);

  mode: 'add' | 'edit' | 'view' = 'view';
  id: string | null = null;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  participantId = '';


  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Traveler`;
  }

  menuItems = computed<MenuConfig[]>(() => []);

  get isReadOnlyMode(): boolean {
    return this.mode === 'view';
  }

  private initForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      phone: [''],
      notes: [''],
    });
  }


  ngOnInit(): void {

    this.mode = this.route.snapshot.data['mode'];
    this.initForm();
    if (!this.isAddMode) {
      this.id = this.route.snapshot.paramMap.get('id');
        this.loadTraveler();
    }
  }

  private loadTraveler(): void {
    if (!this.id) {
      throw new Error('Traveler Id is required in edit/view mode');
    }

    this.service.getById(this.id).subscribe({
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
    if (this.isReadOnlyMode) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messagesService.showWarning('Please fill in all required fields correctly');
      return;
    }


    if (this.isAddMode) {
      this.addTraveler();
    } else if (!this.isReadOnlyMode) {
      this.updateTraveler();
    }
  }

  private addTraveler() {
    const formValue = this.form.value;
    const request: SignUpParticipantRequest = {
      email: formValue.email?.trim(),
      firstName: formValue.firstName?.trim() || undefined,
      lastName: formValue.lastName?.trim() || undefined,
      phone: formValue.phone?.trim() || undefined,
      notes: formValue.notes?.trim() || undefined
    };

    this.service.checkParticipantByEmail(request.email).pipe(
      switchMap(async (result: CheckParticipantResponse) => {
        let message: string;
        let showOkCancel = true;

        switch (result.status) {
          case CheckParticipantStatus.NotFound:
            message = "You're creating a new user in our database. Once added, they'll be added to your traveler list and receive an access code to your trips. Only they'll be able to edit their personal information. Continue?";
            break;
          case CheckParticipantStatus.UserExistsNotParticipant:
            message = `A user with the email address ${request.email} already exists in our database. They will be added to your traveler list and sent an access code to your trips. Continue?`;
            break;
          case CheckParticipantStatus.AlreadyParticipant:
            message = `A user with the email address ${request.email} already exists in your traveler list`;
            showOkCancel = false;
            break;
          default:
            throw new Error("Wrong CheckParticipantStatus");
        }

        if (showOkCancel) {
          const dialogResult = await this.messagesService.openOkCancel({
            title: `Add Traveler`,
            message: message,
            okLabel: 'Add',
            cancelLabel: 'Cancel'
          });

          if (dialogResult !== 'ok') {
            return EMPTY;
          }
        } else {
          this.messagesService.showInfo(message);
          return EMPTY;
        };

        return this.service.add(request);
      }),
      mergeMap(result => result),
    ).subscribe({
      next: (traveler: AdminsParticipantDto) => {
        this.localStorageService.setComponentKey('travelers', 'selectedId', traveler.id);
        this.messagesService.showInfoTime("Participant Added", 7000, `An invitation email has been sent on your behalf to address ${traveler.email}. If necessary, you can resend this email by selecting "Send Invitation" from the menu on this form.`);
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

    this.service.update(request).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('travelers', 'selectedId', this.id!);
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
