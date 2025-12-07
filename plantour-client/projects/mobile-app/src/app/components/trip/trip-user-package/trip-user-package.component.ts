import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { MessagesService, TripUserPackageService, TripUserPackageDto, ThingsUtilsComponent } from 'shared-lib';
import { ToolbarAware } from '../../toolbar-aware';
import { ContentLayoutComponent } from '../../layouts/content-layout.component';

@Component({
  selector: 'app-trip-user-package',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ListboxModule, ButtonModule, ThingsUtilsComponent, ContentLayoutComponent],
  templateUrl: './trip-user-package.component.html',
  styleUrl: './trip-user-package.component.scss'
})
export class TripUserPackageComponent extends ToolbarAware implements OnInit {
  private tripUserPackageService = inject(TripUserPackageService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tripId: string = '';
  tripUserId: string = '';
  tripUserPackages: TripUserPackageDto[] = [];
  selectedPackage: TripUserPackageDto | null = null;
  showToolbar: boolean = false;
  sortOrder: 'asc' | 'desc' | 'none' = 'none';
  filterText: string = '';
  selectedPackingStatus: string | null = null;

  get packingStatuses(): string[] {
    const uniquePackingStatuses = new Set<string>();
    
    this.tripUserPackages.forEach(pkg => {
      if (pkg.packingStatus) {
        uniquePackingStatuses.add(pkg.packingStatus);
      }
    });
    
    const sortedPackingStatuses = Array.from(uniquePackingStatuses).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    
    return ['(No Status)', ...sortedPackingStatuses];
  }

  get sortedPackages(): TripUserPackageDto[] {
    let result = this.tripUserPackages;
    
    // Apply packingStatus filter
    if (this.selectedPackingStatus !== null) {
      if (this.selectedPackingStatus === '(No Status)') {
        result = result.filter(pkg => !pkg.packingStatus);
      } else {
        result = result.filter(pkg => pkg.packingStatus === this.selectedPackingStatus);
      }
    }
    
    // Apply text filter
    if (this.filterText.trim()) {
      const filterLower = this.filterText.toLowerCase();
      result = result.filter(pkg => 
        pkg.name.toLowerCase().includes(filterLower) ||
        (pkg.label && pkg.label.toLowerCase().includes(filterLower)) ||
        (pkg.notes && pkg.notes.toLowerCase().includes(filterLower))
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
    this.route.params.subscribe(params => {
      this.tripId = params['id'];
      this.tripUserId = params['tripUserId'] || '';
      if (this.tripId) {
        this.loadTripUserPackages();
      }
    });
    this.setupToolbarButtons();
  }

  private setupToolbarButtons(): void {
    this.setToolbarButtons([
      {
        id: 'back',
        icon: 'pi pi-arrow-left',
        tooltip: 'Back to Trips',
        command: () => this.onBack()
      },
      {
        id: 'add-package',
        icon: 'pi pi-plus',
        tooltip: 'Add Package',
        command: () => this.onAddPackage()
      },
      {
        id: 'edit-package',
        icon: 'pi pi-pencil',
        tooltip: 'Edit Package',
        command: () => this.onEditPackage(),
        disabled: !this.selectedPackage
      },
      {
        id: 'delete-package',
        icon: 'pi pi-trash',
        tooltip: 'Delete Package',
        command: () => this.onDeletePackage(),
        disabled: !this.selectedPackage
      },
      {
        id: 'refresh-packages',
        icon: 'pi pi-refresh',
        tooltip: 'Refresh',
        command: () => this.loadTripUserPackages()
      }
    ]);
  }

  private loadTripUserPackages(): void {
    this.tripUserPackageService.getAll(this.tripId).subscribe({
      next: (packages) => {
        this.tripUserPackages = packages;
        // Try to get tripUserId from existing packages for the current user
        // This is a simplification - in a real app, we'd query the TripUser table
        if (packages.length > 0 && !this.tripUserId) {
          // For now, use the first package's tripUserId as a default
          // TODO: This should be retrieved from a TripUser service based on current user + tripId
          this.tripUserId = packages[0].tripUserId;
        }
      },
      error: (error) => {
        console.error('Error loading trip user packages:', error);
        this.messagesService.showError('Failed to load packages');
      }
    });
  }

  onSelectionChange(): void {
    this.setupToolbarButtons();
  }

  onBack(): void {
    this.router.navigate(['/trips']);
  }

  onAddPackage(): void {
    this.router.navigate(['/trips', this.tripId, 'packages', 'add']);
  }

  onEditPackage(): void {
    if (this.selectedPackage) {
      this.router.navigate(['/trips', this.tripId, 'packages', 'edit', this.selectedPackage.id]);
    }
  }

  onDeletePackage(): void {
    if (!this.selectedPackage) {
      return;
    }

    this.messagesService.openOkCancel({
      title: 'Delete Package',
      message: `Are you sure you want to delete "${this.selectedPackage.name}"?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    }).then(result => {
      if (result === 'ok' && this.selectedPackage) {
        this.tripUserPackageService.delete(this.selectedPackage.id).subscribe({
          next: () => {
            this.messagesService.showInfo('Package deleted successfully');
            this.selectedPackage = null;
            this.loadTripUserPackages();
          },
          error: (error) => {
            console.error('Error deleting package:', error);
            this.messagesService.showError('Failed to delete package');
          }
        });
      }
    });
  }

  toggleToolbar(): void {
    this.showToolbar = !this.showToolbar;
  }
}
