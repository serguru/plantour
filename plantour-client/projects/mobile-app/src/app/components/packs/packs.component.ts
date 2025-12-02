import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { NavigationService } from '../../services/navigation.service';
import { UserPackageService, MessagesService } from 'shared-lib';

@Component({
  selector: 'app-packs',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ListboxModule, ButtonModule],
  templateUrl: './packs.component.html',
  styleUrl: './packs.component.scss'
})
export class PacksComponent implements OnInit {
  private navigationService = inject(NavigationService);
  private userPackageService = inject(UserPackageService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  
  userPackages$ = this.userPackageService.userPackages$;
  selectedPack: any = null;

  ngOnInit(): void {
    this.navigationService.setCustomBackPath('/landing-registered', true);
    this.loadUserPackages();
  }

  private loadUserPackages(): void {
    this.userPackageService.getAll().subscribe({
      next: (packages) => {
        // packages are automatically updated in the service
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
