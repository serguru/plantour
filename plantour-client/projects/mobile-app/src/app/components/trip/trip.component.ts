import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { NavigationService } from '../../services/navigation.service';
import { MessagesService, TripService } from 'shared-lib';

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ListboxModule, ButtonModule],
  templateUrl: './trip.component.html',
  styleUrl: './trip.component.scss'
})
export class TripComponent implements OnInit {
  private navigationService = inject(NavigationService);
  private tripService = inject(TripService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);

  trips: any[] = [];
  selectedTrip: any = null;

  ngOnInit(): void {
    this.navigationService.setCustomBackPath('/landing-registered', true);
    this.loadTrips();
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

  onAddTrip(): void {
    this.router.navigate(['/trip/add']);
  }

  onEditTrip(trip: any): void {
    this.router.navigate(['/trip/edit', trip.id]);
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
