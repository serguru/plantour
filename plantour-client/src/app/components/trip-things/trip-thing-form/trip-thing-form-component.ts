import { Component, inject, OnInit } from '@angular/core';
import { TripThingService } from '../../../services/trip-thing-service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent, BaseFormMode } from '../../base-form/base-form-component';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LookupService } from '../../../services/lookup-service';

@Component({
  selector: 'app-trip-thing-form-component',
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
  templateUrl: './trip-thing-form-component.html',
  styleUrl: './trip-thing-form-component.scss',
})
export class TripThingFormComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public mode!: BaseFormMode;
  public id: string | null = null;
  public tripId: string | null = null;

  service = inject(TripThingService);
  private lookupService = inject(LookupService);

  thingCategories$ = this.lookupService.getThingCategories();

  fieldsConfig = {
    name: new FormControl('', Validators.required),
    category: new FormControl(''),
    notes: new FormControl(''),
    units: new FormControl(''),
    value: new FormControl(''),
    tripUserPackageId: new FormControl(''),
    packedAt: new FormControl('')
  };

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];
    this.tripId = this.route.snapshot.paramMap.get('tripId');

    if (this.mode === 'edit') {
      this.id = this.route.snapshot.paramMap.get('id');
    }
  }
}
