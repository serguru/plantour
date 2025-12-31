import { Component, inject, OnInit } from '@angular/core';
import { TripSharedService } from '../../../services/trip-shared-service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent, BaseFormMode } from '../../base-form/base-form-component';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LookupService } from '../../../services/lookup-service';
import { TripUserService } from '../../../services/trip-user-service';
import { Observable } from 'rxjs';
import { AppService } from '../../../services/app-service';

@Component({
  selector: 'app-trip-shared-form',
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
  templateUrl: './trip-shared-form-component.html',
  styleUrl: './trip-shared-form-component.scss'
})
export class TripSharedFormComponent implements OnInit {
  appService = inject(AppService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public mode!: BaseFormMode;
  public id: string | null = null;
  //public tripId: string | null = null;

  service = inject(TripSharedService);
  private lookupService = inject(LookupService);
  private tripUserService = inject(TripUserService);

  thingCategories$ = this.lookupService.getThingCategories();
  tripUsers$!: Observable<any[]>;

  fieldsConfig = {
    name: new FormControl('', Validators.required),
    category: new FormControl(''),
    notes: new FormControl(''),
    units: new FormControl(''),
    value: new FormControl(''),
    assignedToId: new FormControl(''),
    assignedDeadline: new FormControl('')
  };

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];
    const tripId = this.appService.tripSelectedValue()?.id || null;
    this.tripUsers$ = this.tripUserService.getAll(tripId || '');

    if (this.mode === 'edit') {
      this.id = this.route.snapshot.paramMap.get('id');
    }
  }

}

