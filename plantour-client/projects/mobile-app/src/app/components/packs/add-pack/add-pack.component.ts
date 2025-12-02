import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NavigationService } from '../../../services/navigation.service';
import { UserPackageService, UsersService, MessagesService } from 'shared-lib';

@Component({
  selector: 'app-add-pack',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, ButtonModule],
  templateUrl: './add-pack.component.html',
  styleUrl: './add-pack.component.scss'
})
export class AddPackComponent implements OnInit {
  private navigationService = inject(NavigationService);
  private userPackageService = inject(UserPackageService);
  private usersService = inject(UsersService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);

  shortDescription: string = '';
  description: string = '';
  categoryId: string | null = null;
  categories: any[] = [];
  isSubmitting: boolean = false;

  ngOnInit(): void {
    this.navigationService.setCustomBackPath('/packs', true);
  }

  onSubmit(): void {
    if (!this.shortDescription || !this.shortDescription.trim()) {
      this.messagesService.showError('Short description is required');
      return;
    }

    const currentUser = this.usersService.currentUser();
    if (!currentUser || !currentUser.user_id) {
      this.messagesService.showError('User not found');
      return;
    }

    this.isSubmitting = true;

    const request = {
      userId: currentUser.user_id,
      categoryId: this.categoryId || null,
      shortDescription: this.shortDescription.trim(),
      description: this.description?.trim() || null
    };

    this.userPackageService.add(request).subscribe({
      next: () => {
        this.messagesService.showInfo('Pack created successfully');
        this.router.navigate(['/packs']);
      },
      error: (error) => {
        console.error('Error creating pack:', error);
        this.messagesService.showError('Failed to create pack');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/packs']);
  }
}
