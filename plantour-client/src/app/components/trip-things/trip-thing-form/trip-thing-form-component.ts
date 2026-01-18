import { Component, inject, OnInit } from '@angular/core';
import { TripThingService } from '../../../services/trip-thing-service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent, BaseFormMode } from '../../base-form/base-form-component';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LookupService } from '../../../services/lookup-service';
import { MessagePanel } from '../../message-panel/message-panel-component/message-panel-component';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { FormHeader } from '../../form/form-header/form-header';
import { FormActions } from '../../form/form-actions/form-actions';
import { Checkbox } from 'primeng/checkbox';
import { InputNumber } from 'primeng/inputnumber';
import { PackageService } from '../../../services/package-service';
import { UsersService } from '../../../services/users-service';
import { MessagesService } from '../../../services/messages-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { ComponentService } from '../../../services/component-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-trip-thing-form-component',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    MessagePanel,
    AutoFocusDirective,
    FormHeader,
    FormActions,
    Checkbox,
    InputNumber,
    Select
  ],
  templateUrl: './trip-thing-form-component.html',
  styleUrl: './trip-thing-form-component.scss',
})
export class TripThingFormComponent implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  fieldsConfig = {
    name: new FormControl('', Validators.required),
    category: new FormControl(''),
    notes: new FormControl(''),
    units: new FormControl(''),
    value: new FormControl(''),
    tripUserPackageId: new FormControl(''),
    packedAt: new FormControl('')
  };


}

