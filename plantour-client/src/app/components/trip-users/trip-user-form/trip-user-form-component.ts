import { Component, inject, OnInit } from '@angular/core';
import { TripUserService } from '../../../services/trip-user-service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent, BaseFormMode } from '../../base-form/base-form-component';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LookupService } from '../../../services/lookup-service';

@Component({
  selector: 'app-trip-participants-form-component',
  standalone: true,
  imports: [
    BaseFormComponent,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    Select,
    AsyncPipe,
    CommonModule
  ],
  templateUrl: './trip-user-form-component.html',
  styleUrl: './trip-user-form-component.scss',
})
export class TripUserFormComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public mode!: BaseFormMode;
  public id: string | null = null;

  service = inject(TripUserService);
  private lookupService = inject(LookupService);

  participantStatuses$ = this.lookupService.getParticipantStatuses();

  fieldsConfig = {
    email: new FormControl('', [Validators.required, Validators.email]),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    phone: new FormControl(''),
    notes: new FormControl(''),
    participantStatus: new FormControl(''),
    adminParticipantId: new FormControl('')
  };

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];

    if (this.mode === 'edit') {
      this.id = this.route.snapshot.paramMap.get('id');
    }
  }

}
