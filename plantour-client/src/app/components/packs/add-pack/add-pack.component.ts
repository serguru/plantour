import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { UserPackageService } from '../../../services/user-package-service';
import { BaseFormComponent } from '../../base-form/base-form-component';

@Component({
  selector: 'app-add-pack',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, BaseFormComponent],
  templateUrl: './add-pack.component.html',
  styleUrl: './add-pack.component.scss'
})
export class AddPackComponent {
  service = inject(UserPackageService);
  fieldsConfig = {
    name: new FormControl('', Validators.required),
  };
  //@ViewChild('fieldsTemplate') fieldsTemplate!: TemplateRef<any>;
}  
