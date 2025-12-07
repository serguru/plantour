import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { MessagesService, TripService } from 'shared-lib';
import { ToolbarAware } from '../toolbar-aware';
import { ContentLayoutComponent } from '../layouts/content-layout.component';

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ListboxModule, ButtonModule, ContentLayoutComponent],
  templateUrl: './trip.component.html',
  styleUrl: './trip.component.scss'
})
export class TripComponent extends ToolbarAware implements OnInit {
  private tripService = inject(TripService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);

  trips: any[] = [];
  selectedTrip: any = null;

  ngOnInit(): void {
    this.loadTrips();
    this.setupToolbarButtons();
  }

  private setupToolbarButtons(): void {
    this.setToolbarButtons([
      {
        id: 'add-trip',
        icon: 'pi pi-plus',
        tooltip: 'Add Trip',
        command: () => this.onAddTrip()
      },
      {
        id: 'edit-trip',
        icon: 'pi pi-pencil',
        tooltip: 'Edit Trip',
        command: () => this.onEditSelectedTrip(),
        disabled: true
      },
      {
        id: 'delete-trip',
        icon: 'pi pi-trash',
        tooltip: 'Delete Trip',
        command: () => this.onDeleteSelectedTrip(),
        disabled: true
      },
      {
        id: 'view-things',
        icon: 'pi pi-box',
        tooltip: 'View Things',
        command: () => this.onViewThings(),
        disabled: true
      },
      {
        id: 'view-packages',
        icon: 'pi pi-briefcase',
        tooltip: 'View Packages',
        command: () => this.onViewPackages(),
        disabled: true
      },
      {
        id: 'view-users',
        icon: 'pi pi-users',
        tooltip: 'View Users',
        command: () => this.onViewUsers(),
        disabled: true
      },
      {
        id: 'refresh-trips',
        icon: 'pi pi-refresh',
        tooltip: 'Refresh',
        command: () => this.loadTrips()
      }
    ]);
  }

  private loadTrips(): void {
    this.tripService.getAll().subscribe({
      next: (trips) => {
        this.trips = trips;
      },
      error: (error) => {
        console.error('Error loading trips:', error);
      }
    });
  }

  onSelectionChange(): void {
    const hasSelection = this.selectedTrip != null;
    
    this.updateToolbarButtons({
      'edit-trip': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `Edit "${this.selectedTrip?.name}"` : 'Edit Trip'
      },
      'delete-trip': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `Delete "${this.selectedTrip?.name}"` : 'Delete Trip'
      },
      'view-things': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `View Things for "${this.selectedTrip?.name}"` : 'View Things'
      },
      'view-packages': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `View Packages for "${this.selectedTrip?.name}"` : 'View Packages'
      },
      'view-users': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `View Users for "${this.selectedTrip?.name}"` : 'View Users'
      }
    });
  }

  onAddTrip(): void {
    this.router.navigate(['/trips/add']);
  }

  onEditSelectedTrip(): void {
    if (this.selectedTrip) {
      this.router.navigate(['/trips/edit', this.selectedTrip.id]);
    }
  }

  onEditTrip(trip: any): void {
    this.router.navigate(['/trips/edit', trip.id]);
  }

  onViewThings(): void {
    if (this.selectedTrip) {
      this.router.navigate(['/trips', this.selectedTrip.id, 'things']);
    }
  }

  onViewPackages(): void {
    if (this.selectedTrip) {
      this.router.navigate(['/trips', this.selectedTrip.id, 'packages']);
    }
  }

  onViewUsers(): void {
    if (this.selectedTrip) {
      this.router.navigate(['/trips', this.selectedTrip.id, 'users']);
    }
  }

  async onDeleteSelectedTrip(): Promise<void> {
    if (!this.selectedTrip) {
      return;
    }

    const result = await this.messagesService.openOkCancel({
      title: 'Delete Trip',
      message: `Are you sure you want to delete "${this.selectedTrip.name}"?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    });

    if (result === 'ok') {
      this.tripService.delete(this.selectedTrip.id).subscribe({
        next: () => {
          this.selectedTrip = null;
          this.onSelectionChange();
          this.loadTrips();
          this.messagesService.showInfo('Trip deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting trip:', error);
          this.messagesService.showError('Failed to delete trip');
        }
      });
    }
  }

  async onDeleteTrip(trip: any): Promise<void> {
    const result = await this.messagesService.openOkCancel({
      title: 'Delete Trip',
      message: `Are you sure you want to delete "${trip.name}"?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    });

    if (result === 'ok') {
      this.tripService.delete(trip.id).subscribe({
        next: () => {
          if (this.selectedTrip?.id === trip.id) {
            this.selectedTrip = null;
            this.onSelectionChange();
          }
          this.loadTrips();
          this.messagesService.showInfo('Trip deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting trip:', error);
          this.messagesService.showError('Failed to delete trip');
        }
      });
    }
  }
}
