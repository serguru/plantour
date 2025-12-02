import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NavigationService } from '../../../services/navigation.service';
import { UserPackageService, MessagesService } from 'shared-lib';

@Component({
  selector: 'app-edit-pack',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, ButtonModule],
  templateUrl: './edit-pack.component.html',
  styleUrl: './edit-pack.component.scss'
})
export class EditPackComponent implements OnInit {
  private navigationService = inject(NavigationService);
  private userPackageService = inject(UserPackageService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  packageId: string = '';
  shortDescription: string = '';
  description: string = '';
  categoryId: string | null = null;
  categories: any[] = [];
  isSubmitting: boolean = false;
  isLoading: boolean = true;

  ngOnInit(): void {
    this.navigationService.setCustomBackPath('/packs', true);
    
    this.packageId = this.route.snapshot.paramMap.get('id') || '';
    if (this.packageId) {
      this.loadPackage();
    } else {
      this.messagesService.showError('Package ID not found');
      this.router.navigate(['/packs']);
    }
  }

  private loadPackage(): void {
    this.userPackageService.getById(this.packageId).subscribe({
      next: (pack) => {
        this.shortDescription = pack.shortDescription || '';
        this.description = pack.description || '';
        this.categoryId = pack.categoryId || null;
        this.categories = pack.categoriesLookup || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pack:', error);
        this.messagesService.showError('Failed to load pack');
        this.router.navigate(['/packs']);
      }
    });
  }

  onSubmit(): void {
    if (!this.shortDescription || !this.shortDescription.trim()) {
      this.messagesService.showError('Short description is required');
      return;
    }

    this.isSubmitting = true;

    const request = {
      categoryId: this.categoryId || null,
      shortDescription: this.shortDescription.trim(),
      description: this.description?.trim() || null
    };

    this.userPackageService.update(this.packageId, request).subscribe({
      next: () => {
        this.messagesService.showInfo('Pack updated successfully');
        this.router.navigate(['/packs']);
      },
      error: (error) => {
        console.error('Error updating pack:', error);
        this.messagesService.showError('Failed to update pack');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/packs']);
  }
}
