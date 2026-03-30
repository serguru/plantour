import { Component, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { AutoFocusDirective } from '../../../helpers/auto-focus-directive';
import { capitalizeFirstLetter } from '../../../helpers/utils';
import { CreateKeyRequest, KeyDto, KeyService, UpdateKeyRequest } from '../../../services/key-service';
import { LocalStorageService } from '../../../services/local-storage-service';
import { MessagesService } from '../../../services/messages-service';
import { UsersService } from '../../../services/users-service';
import { FormActions } from '../../form/form-actions/form-actions';
import { FormHeader, MenuConfig } from '../../form/form-header/form-header';

@Component({
  selector: 'app-key-form-component',
  imports: [
    CheckboxModule,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    AutoFocusDirective,
    FormHeader,
    FormActions,
  ],
  templateUrl: './key-form-component.html',
  styleUrl: './key-form-component.scss',
})
export class KeyFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  service = inject(KeyService);
  usersService = inject(UsersService);
  messagesService = inject(MessagesService);
  localStorageService = inject(LocalStorageService);

  mode: 'add' | 'edit' = 'add';
  id: string | null = null;
  form!: FormGroup;

  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  get title(): string {
    return `${capitalizeFirstLetter(this.mode)} Key`;
  }

  menuItems = computed<MenuConfig[]>(() => []);

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];
    this.form = this.fb.group({
      name: new FormControl('', Validators.required),
      key: new FormControl('', Validators.required),
      active: new FormControl(true),
      notes: new FormControl('')
    });

    if (this.isAddMode) {
      return;
    }

    this.id = this.route.snapshot.paramMap.get('id');
    this.loadKey();
  }

  private loadKey(): void {
    if (!this.id) {
      return;
    }

    this.service.getById(this.id).subscribe({
      next: (key: KeyDto) => {
        this.form.patchValue({
          name: key.name,
          key: key.key,
          active: key.active,
          notes: key.notes,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messagesService.showWarning('Please fill in all required fields correctly');
      return;
    }

    if (this.isAddMode) {
      this.addKey();
      return;
    }

    this.updateKey();
  }

  private addKey(): void {
    const formValue = this.form.value;
    const request: CreateKeyRequest = {
      name: formValue.name?.trim(),
      key: formValue.key?.trim(),
      active: !!formValue.active,
      notes: formValue.notes?.trim() || undefined,
    };

    this.service.add(request).subscribe({
      next: (key: KeyDto) => {
        this.localStorageService.setComponentKey('keys', 'selectedId', key.id);
        this.messagesService.showInfo('Key added successfully');
        this.router.navigate(['/keys']);
      }
    });
  }

  private updateKey(): void {
    if (!this.id) {
      return;
    }

    const formValue = this.form.value;
    const request: UpdateKeyRequest = {
      id: this.id,
      name: formValue.name?.trim(),
      key: formValue.key?.trim(),
      active: !!formValue.active,
      notes: formValue.notes?.trim() || undefined,
    };

    this.service.update(request).subscribe({
      next: () => {
        this.localStorageService.setComponentKey('keys', 'selectedId', this.id!);
        this.messagesService.showInfo('Key updated successfully');
        this.router.navigate(['/keys']);
      }
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/keys']);
  }
}