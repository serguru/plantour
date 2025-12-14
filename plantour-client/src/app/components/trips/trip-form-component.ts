import { Component, inject, OnInit } from '@angular/core';
import { TripService, CreateTripRequest, UpdateTripRequest } from '../../services/trip-service';
import { FormControl, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { BaseFormComponent, BaseFormMode } from '../base-form/base-form-component';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AsyncPipe } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { LookupService } from '../../services/lookup-service';
import { MessagesService } from '../../services/messages-service';

@Component({
  selector: 'app-trip-form-component',
  imports: [
    BaseFormComponent,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    Select,
    AsyncPipe,
    DatePickerModule
  ],
  standalone: true,
  templateUrl: './trip-form-component.html'
})
export class TripFormComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public mode!: BaseFormMode;
  public id: string | null = null;

  service = inject(TripService);
  lookupService = inject(LookupService);
  messages = inject(MessagesService);

  tripStatuses$ = this.lookupService.tripStatuses$;

  fieldsConfig: { [key: string]: FormControl } = {
    name: new FormControl('', Validators.required),
    tripStatus: new FormControl('', []),
    description: new FormControl('', []),
    startDate: new FormControl<string | null>(null, []),
    endDate: new FormControl<string | null>(null, []),
  };

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];
    if (this.mode === 'edit') {
      this.id = this.route.snapshot.paramMap.get('id');
    }
  }

  toolBarButtons = [
    {
      id: 'back-button',
      icon: 'pi pi-chevron-left',
      tooltip: 'Back',
      command: () => {
        if (this.mode === 'add') {
          this.router.navigate(["trips"]);
          return;
        }
        this.router.navigate(["trips"], {
          queryParams: { selectId: this.id }
        });
      }
    }
  ];

  onSubmit = (form: FormGroup) => {
    const value = form.value as CreateTripRequest & UpdateTripRequest;
    // Validate dates: startDate <= endDate if both are present
    if (value.startDate && value.endDate) {
      const s = new Date(value.startDate);
      const e = new Date(value.endDate);
      if (s > e) {
        this.messages.showError('Validation error', 'Start date must be before end date');
        return;
      }
    }
  };
}
