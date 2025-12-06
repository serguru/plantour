import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { MessagesService, UserPackageDto, UserPackageService, ThingsUtilsComponent } from 'shared-lib';
import { ToolbarAware } from '../toolbar-aware';

@Component({
  selector: 'app-packs',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ListboxModule, ButtonModule, ThingsUtilsComponent],
  templateUrl: './packs.component.html',
  styleUrl: './packs.component.scss'
})
export class PacksComponent extends ToolbarAware implements OnInit {
  private userPackageService = inject(UserPackageService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);

  userPackages: UserPackageDto[] = [];
  selectedPack: UserPackageDto | null = null;
  showToolbar: boolean = false;
  sortOrder: 'asc' | 'desc' | 'none' = 'none';
  filterText: string = '';

  get sortedPacks(): UserPackageDto[] {
    let result = this.userPackages;
    
    // Apply text filter
    if (this.filterText.trim()) {
      const filterLower = this.filterText.toLowerCase();
      result = result.filter(pack => 
        pack.name.toLowerCase().includes(filterLower) ||
        (pack.description && pack.description.toLowerCase().includes(filterLower))
      );
    }
    
    // Apply sort
    if (this.sortOrder !== 'none') {
      result = [...result].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        
        if (this.sortOrder === 'asc') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    }
    
    return result;
  }

  highlightText(text: string): string {
    if (!this.filterText.trim() || !text) {
      return text;
    }
    
    const filterLower = this.filterText.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(filterLower);
    
    if (index === -1) {
      return text;
    }
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + this.filterText.length);
    const after = text.substring(index + this.filterText.length);
    
    return `${before}<mark>${match}</mark>${after}`;
  }

  ngOnInit(): void {
    this.loadUserPackages();
    this.setupToolbarButtons();
  }

  private setupToolbarButtons(): void {
    this.setToolbarButtons([
      {
        id: 'add-pack',
        icon: 'pi pi-plus',
        tooltip: 'Add Pack',
        command: () => this.onAddPack()
      },
      {
        id: 'edit-pack',
        icon: 'pi pi-pencil',
        tooltip: 'Edit Pack',
        command: () => this.onEditSelectedPack(),
        disabled: true
      },
      {
        id: 'delete-pack',
        icon: 'pi pi-trash',
        tooltip: 'Delete Pack',
        command: () => this.onDeleteSelectedPack(),
        disabled: true
      },
      {
        id: 'refresh-packs',
        icon: 'pi pi-refresh',
        tooltip: 'Refresh',
        command: () => this.loadUserPackages()
      }
    ]);
  }

  private loadUserPackages(): void {
    this.userPackageService.getAll().subscribe({
      next: (packages) => {
        this.userPackages = packages;
      },
      error: (error) => {
        console.error('Error loading user packages:', error);
      }
    });
  }

  onSelectionChange(): void {
    const hasSelection = this.selectedPack != null;
    
    this.updateToolbarButtons({
      'edit-pack': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `Edit "${this.selectedPack?.name}"` : 'Edit Pack'
      },
      'delete-pack': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `Delete "${this.selectedPack?.name}"` : 'Delete Pack'
      }
    });
  }

  onAddPack(): void {
    this.router.navigate(['/packs/add']);
  }

  onEditSelectedPack(): void {
    if (this.selectedPack) {
      this.router.navigate(['/packs/edit', this.selectedPack.id]);
    }
  }

  onEditPack(pack: any): void {
    this.router.navigate(['/packs/edit', pack.id]);
  }

  async onDeleteSelectedPack(): Promise<void> {
    if (!this.selectedPack) {
      return;
    }

    const result = await this.messagesService.openOkCancel({
      title: 'Delete Pack',
      message: `Are you sure you want to delete "${this.selectedPack.name}"?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    });

    if (result === 'ok') {
      this.userPackageService.delete(this.selectedPack.id).subscribe({
        next: () => {
          this.selectedPack = null;
          this.onSelectionChange();
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

  async onDeletePack(pack: any): Promise<void> {
    const result = await this.messagesService.openOkCancel({
      title: 'Delete Pack',
      message: `Are you sure you want to delete "${pack.name}"?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    });

    if (result === 'ok') {
      this.userPackageService.delete(pack.id).subscribe({
        next: () => {
          if (this.selectedPack?.id === pack.id) {
            this.selectedPack = null;
            this.onSelectionChange();
          }
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

  toggleToolbar(): void {
    this.showToolbar = !this.showToolbar;
  }
}
