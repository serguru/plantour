import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent, BaseFormMode } from '../../base-form/base-form-component';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LookupService } from '../../../services/lookup-service';
import { TripPackageService } from '../../../services/trip-package-service';

@Component({
  selector: 'app-trip-pack-form-component',
  standalone: true,
  imports: [
    BaseFormComponent,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    CommonModule
  ],
  templateUrl: './trip-pack-form-component.html',
  styleUrl: './trip-pack-form-component.scss',
})
export class TripPackFormComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public mode!: BaseFormMode;
  public id: string | null = null;

  service = inject(TripPackageService);
  private lookupService = inject(LookupService);

  fieldsConfig = {
    name: new FormControl('', Validators.required),
    label: new FormControl(''),
    notes: new FormControl(''),
    packedAt: new FormControl(''),
    packingListIncluded: new FormControl(false),
    weightValue: new FormControl(''),
    weightUnit: new FormControl(''),
  };
  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];
    if (this.mode === 'edit') {
      this.id = this.route.snapshot.paramMap.get('id');
    }
  }
}
