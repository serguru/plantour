import { Component, inject, OnInit } from '@angular/core';
import { UserPackageService } from '../../services/package-service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent, BaseFormMode } from '../base-form/base-form-component';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-pack-form-component',
  imports: [
    BaseFormComponent,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule
  ],
  templateUrl: './pack-form-component.html',
  styleUrl: './pack-form-component.scss',
})
export class PackFormComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public mode!: BaseFormMode;
  public id: string | null = null;

  service = inject(UserPackageService);
  fieldsConfig = {
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
  };

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];

    if (this.mode === 'edit') {
      this.id = this.route.snapshot.paramMap.get('id');
    }
  }

  toolBarButtons =
    [
      {
        id: 'back-button',
        icon: 'pi pi-chevron-left',
        tooltip: 'Back',
        command: () => {
          if (this.mode === 'add') {
            this.router.navigate(["packs"]);
            return;
          }
          this.router.navigate(["packs"], {
            queryParams: { selectId: this.id }
          });
        }



      }
    ]


}
