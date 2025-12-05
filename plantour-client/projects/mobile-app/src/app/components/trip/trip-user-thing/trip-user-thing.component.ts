import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { MessagesService, TripUserThingService, TripUserThingDto } from 'shared-lib';
import { ToolbarAware } from '../../toolbar-aware';

@Component({
  selector: 'app-trip-user-thing',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ListboxModule, ButtonModule],
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
}
