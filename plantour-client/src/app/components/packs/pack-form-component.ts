import { Component, inject, OnInit } from '@angular/core';
import { UserPackageService } from '../../services/user-package-service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent, BaseFormMode } from '../base-form/base-form-component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pack-form-component',
  imports: [
    BaseFormComponent,
    ReactiveFormsModule
  ],
  templateUrl: './pack-form-component.html',
  styleUrl: './pack-form-component.scss',
})
export class PackFormComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  public mode!: BaseFormMode;
  public id: string | null = null;

  service = inject(UserPackageService);
  fieldsConfig = {
    name: new FormControl('', Validators.required),
  };

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];

    if (this.mode === 'edit') {
      this.id = this.route.snapshot.paramMap.get('id');
    }
  }

}
