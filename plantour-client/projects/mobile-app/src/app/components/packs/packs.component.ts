import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { MessagesService, UserPackageService } from 'shared-lib';

@Component({
  selector: 'app-packs',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ListboxModule, ButtonModule],
  templateUrl: './packs.component.html',
  styleUrl: './packs.component.scss'
})
export class PacksComponent implements OnInit {
  private userPackageService = inject(UserPackageService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);

  userPackages: any[] = [];
  selectedPack: any = null;

  ngOnInit(): void {
    this.loadUserPackages();
  }

  private loadUserPackages(): void {
    this.userPackageService.getAll().subscribe({
      next: (packages) => {
        // packages are automatically updated in the service
        this.userPackages = packages;
      },
      error: (error) => {
        console.error('Error loading user packages:', error);
      }
    });
  }

  onAddPack(): void {
    this.router.navigate(['/packs/add']);
  }

  onEditPack(pack: any): void {
    this.router.navigate(['/packs/edit', pack.id]);
  }

  async onDeletePack(pack: any): Promise<void> {
    const result = await this.messagesService.openOkCancel({
      title: 'Delete Pack',
      message: `Are you sure you want to delete "${pack.shortDescription}"?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    });

    if (result === 'ok') {
      this.userPackageService.delete(pack.id).subscribe({
        next: () => {
          this.loadUserPackages();
          this.messagesService.showInfo('Pack deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting pack:', error);
          this.messagesService.showError('Failed to delete pack');
        }
      });
    }
  }
}
