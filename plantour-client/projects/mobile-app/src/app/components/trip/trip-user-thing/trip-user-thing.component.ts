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
  tripUserThings: TripUserThingDto[] = [];
  selectedThing: TripUserThingDto | null = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tripId = params['id'];
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
      },
      error: (error) => {
        console.error('Error loading trip user things:', error);
        this.messagesService.showError('Failed to load things');
      }
    });
  }

  onSelectionChange(): void {
    // Currently no actions based on selection
  }

  onBack(): void {
    this.router.navigate(['/trips']);
  }
}
