import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { MessagesService, TripUserThingService, TripUserThingDto, ThingsUtilsComponent } from 'shared-lib';
import { ToolbarAware } from '../../toolbar-aware';

@Component({
  selector: 'app-trip-user-thing',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ListboxModule, ButtonModule, ThingsUtilsComponent],
  templateUrl: './trip-user-thing.component.html',
  styleUrl: './trip-user-thing.component.scss'
})
export class TripUserThingComponent extends ToolbarAware implements OnInit {
  private tripUserThingService = inject(TripUserThingService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tripId: string = '';
  tripUserId: string = '';
  tripUserThings: TripUserThingDto[] = [];
  selectedThing: TripUserThingDto | null = null;
  showToolbar: boolean = false;
  sortOrder: 'asc' | 'desc' | 'none' = 'none';
  filterText: string = '';
  selectedCategory: string | null = null;
  selectedPackageName: string | null = null;
  selectedPackingStatus: string | null = null;

  get categories(): string[] {
    const uniqueCategories = new Set<string>();
    
    this.tripUserThings.forEach(thing => {
      if (thing.category) {
        uniqueCategories.add(thing.category);
      }
    });
    
    const sortedCategories = Array.from(uniqueCategories).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    
    return ['(No Category)', ...sortedCategories];
  }

  get packageNames(): string[] {
    const uniquePackageNames = new Set<string>();
    
    this.tripUserThings.forEach(thing => {
      if (thing.packageName) {
        uniquePackageNames.add(thing.packageName);
      }
    });
    
    const sortedPackageNames = Array.from(uniquePackageNames).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    
    return ['(No Package)', ...sortedPackageNames];
  }

  get packingStatuses(): string[] {
    const uniquePackingStatuses = new Set<string>();
    
    this.tripUserThings.forEach(thing => {
      if (thing.packingStatus) {
        uniquePackingStatuses.add(thing.packingStatus);
      }
    });
    
    const sortedPackingStatuses = Array.from(uniquePackingStatuses).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    
    return ['(No Status)', ...sortedPackingStatuses];
  }

  get sortedThings(): TripUserThingDto[] {
    let result = this.tripUserThings;
    
    // Apply category filter
    if (this.selectedCategory !== null) {
      if (this.selectedCategory === '(No Category)') {
        result = result.filter(thing => !thing.category);
      } else {
        result = result.filter(thing => thing.category === this.selectedCategory);
      }
    }
    
    // Apply packageName filter
    if (this.selectedPackageName !== null) {
      if (this.selectedPackageName === '(No Package)') {
        result = result.filter(thing => !thing.packageName);
      } else {
        result = result.filter(thing => thing.packageName === this.selectedPackageName);
      }
    }
    
    // Apply packingStatus filter
    if (this.selectedPackingStatus !== null) {
      if (this.selectedPackingStatus === '(No Status)') {
        result = result.filter(thing => !thing.packingStatus);
      } else {
        result = result.filter(thing => thing.packingStatus === this.selectedPackingStatus);
      }
    }
    
    // Apply text filter
    if (this.filterText.trim()) {
      const filterLower = this.filterText.toLowerCase();
      result = result.filter(thing => 
        thing.name.toLowerCase().includes(filterLower) ||
        (thing.notes && thing.notes.toLowerCase().includes(filterLower))
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
        this.loadTripUserThings();
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
        id: 'add-thing',
        icon: 'pi pi-plus',
        tooltip: 'Add Thing',
        command: () => this.onAddThing()
      },
      {
        id: 'edit-thing',
        icon: 'pi pi-pencil',
        tooltip: 'Edit Thing',
        command: () => this.onEditThing(),
        disabled: !this.selectedThing
      },
      {
        id: 'delete-thing',
        icon: 'pi pi-trash',
        tooltip: 'Delete Thing',
        command: () => this.onDeleteThing(),
        disabled: !this.selectedThing
      },
      {
        id: 'refresh-things',
        icon: 'pi pi-refresh',
        tooltip: 'Refresh',
        command: () => this.loadTripUserThings()
      }
    ]);
  }

  private loadTripUserThings(): void {
    this.tripUserThingService.getAll(this.tripId).subscribe({
      next: (things) => {
        this.tripUserThings = things;
        // Try to get tripUserId from existing things for the current user
        // This is a simplification - in a real app, we'd query the TripUser table
        if (things.length > 0 && !this.tripUserId) {
          // For now, use the first thing's tripUserId as a default
          // TODO: This should be retrieved from a TripUser service based on current user + tripId
          this.tripUserId = things[0].tripUserId;
        }
      },
      error: (error) => {
        console.error('Error loading trip user things:', error);
        this.messagesService.showError('Failed to load things');
      }
    });
  }

  onSelectionChange(): void {
    this.setupToolbarButtons();
  }

  onBack(): void {
    this.router.navigate(['/trips']);
  }

  onAddThing(): void {
    this.router.navigate(['/trips', this.tripId, 'things', 'add']);
  }

  onEditThing(): void {
    if (this.selectedThing) {
      this.router.navigate(['/trips', this.tripId, 'things', 'edit', this.selectedThing.id]);
    }
  }

  onDeleteThing(): void {
    if (!this.selectedThing) {
      return;
    }

    this.messagesService.openOkCancel({
      title: 'Delete Thing',
      message: `Are you sure you want to delete "${this.selectedThing.name}"?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    }).then(result => {
      if (result === 'ok' && this.selectedThing) {
        this.tripUserThingService.delete(this.selectedThing.id).subscribe({
          next: () => {
            this.messagesService.showInfo('Thing deleted successfully');
            this.selectedThing = null;
            this.loadTripUserThings();
          },
          error: (error) => {
            console.error('Error deleting thing:', error);
            this.messagesService.showError('Failed to delete thing');
          }
        });
      }
    });
  }

  toggleToolbar(): void {
    this.showToolbar = !this.showToolbar;
  }
}
