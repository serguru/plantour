import { Component, inject, OnInit } from '@angular/core';
import { AdminsParticipantService } from '../../services/admins-participant-service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent, BaseFormMode } from '../base-form/base-form-component';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { AsyncPipe } from '@angular/common';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-traveler-form-component',
  standalone: true,
  imports: [
    BaseFormComponent,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    AsyncPipe,
    Select
  ],
  templateUrl: './traveler-form-component.html',
  styleUrl: './traveler-form-component.scss'
})
export class TravelerFormComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public mode!: BaseFormMode;
  public id: string | null = null;

  service = inject(AdminsParticipantService);
  fieldsConfig = {};

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];
    if (this.isEditMode) {
      this.id = this.route.snapshot.paramMap.get('id');
    }
    this.fieldsConfig = {
      email: new FormControl({ value: '', disabled: this.isEditMode }, [Validators.required, Validators.email]),
      firstName: new FormControl({ value: '', disabled: this.isEditMode }, Validators.required),
      lastName: new FormControl({ value: '', disabled: this.isEditMode }, Validators.required),
      phone: new FormControl({ value: '', disabled: this.isEditMode }),
      notes: new FormControl(''),
      participantStatusId: new FormControl(''),
    };

  }

  toolBarButtons = [
    {
      id: 'back-button',
      icon: 'pi pi-chevron-left',
      tooltip: 'Back',
      command: () => {
        if (this.mode === 'add') {
          this.router.navigate(["travelers"]);
          return;
        }
        this.router.navigate(["travelers"], {
          queryParams: { selectId: this.id }
        });
      }
    }
  ];
}
