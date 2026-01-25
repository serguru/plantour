import { Component, inject, OnInit } from '@angular/core';
import { CreatePackageRequest, PackageDto, PackageService, UpdatePackageRequest } from '../../../services/package-service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { UsersService } from '../../../services/users-service';
import { MessagesService } from '../../../services/messages-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { ComponentService } from '../../../services/component-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { catchError, EMPTY, finalize } from 'rxjs';
import { FormActions } from '../../form/form-actions/form-actions';
import { FormHeader } from '../../form/form-header/form-header';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { MessagePanel } from '../../message-panel/message-panel-component/message-panel-component';

@Component({
  selector: 'app-pack-form-component',
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    AutoFocusDirective,
    FormHeader,
    FormActions
  ],
  templateUrl: './pack-form-component.html',
  styleUrl: './pack-form-component.scss',
})
export class PackFormComponent implements OnInit {

  private route: ActivatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  service = inject(PackageService);
  usersService = inject(UsersService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);
  componentService = inject(ComponentService);

  isLoading = toSignal(this.componentService.loading$);

  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Bag`;
  }

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];
    if (!this.isAddMode) {
      this.id = this.route.snapshot.paramMap.get('id');
      this.loadPack();
    }
    this.form = this.fb.group({
      name: new FormControl('', Validators.required),
      notes: new FormControl('')
    });
  }

  private loadPack(): void {
    if (!this.id) return;

    this.componentService.updateLoading(true);
    this.service.getById(this.id).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    ).subscribe({
      next: (pack: PackageDto) => {
        this.form.patchValue({
          name: pack.name,
          notes: pack.notes
        });
      }
    });
  }

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messagesService.showWarning('Please fill in all required fields correctly');
      return;
    }


    if (this.isAddMode) {
      this.addPackage();
    } else {
      this.updatePackage();
    }
  }

  private addPackage() {
    const formValue = this.form.value;
    const request: CreatePackageRequest = {
      name: formValue.name?.trim(),
      notes: formValue.notes?.trim() || undefined
    };

    this.componentService.updateLoading(true);
    this.service.add(request).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    )
      .subscribe({
        next: (pack: PackageDto) => {
          this.localStorageService.setComponentKey('packs', 'selectedId', pack.id);
          this.messagesService.showInfo('Bag added successfully');
          this.router.navigate(['/packs']);
        }
      });
  }


  private updatePackage(): void {
    if (!this.id) return;

    const formValue = this.form.value;
    const request: UpdatePackageRequest = {
      id: this.id,
      name: formValue.name?.trim(),
      notes: formValue.notes?.trim() || undefined
    };

    this.componentService.updateLoading(true);
    this.service.update(request).pipe(
      finalize(() => {
        this.componentService.updateLoading(false);
      })
    )
      .subscribe({
        next: () => {
          this.localStorageService.setComponentKey('packs', 'selectedId', this.id!);
          this.messagesService.showInfo('Bag updated successfully');
          this.router.navigate(['/packs']);
        }
      });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/packs']);
  }
}
