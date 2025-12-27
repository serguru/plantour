import { Component, inject, OnInit } from '@angular/core';
import { ThingService } from '../../services/thing-service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent, BaseFormMode } from '../base-form/base-form-component';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AsyncPipe } from '@angular/common';
import { UsersService } from '../../services/users-service';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-thing-form-component',
  imports: [
    BaseFormComponent,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    Select,
    AsyncPipe,
    CheckboxModule
  ],
  templateUrl: './thing-form-component.html'
})
export class ThingFormComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public mode!: BaseFormMode;
  public id: string | null = null;

  service = inject(ThingService);
  useService = inject(UsersService); 

  fieldsConfig = {
    name: new FormControl('', Validators.required),
    category: new FormControl(''),
    notes: new FormControl(''),
    units: new FormControl(''),
    value: new FormControl(''),
    common: new FormControl<boolean>(false)
  };

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];

    if (this.mode === 'edit') {
      this.id = this.route.snapshot.paramMap.get('id');
    }
  }
}
