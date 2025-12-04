import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToolbarAware } from '../toolbar-aware';

@Component({
  selector: 'app-landing-registered-user',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './landing-registered-user.component.html',
  styleUrl: './landing-registered-user.component.scss'
})
export class LandingRegisteredUserComponent extends ToolbarAware {

  // Stub data for user statistics
  userData = {
    travelersCount: 5,
    thingsCount: 42,
    packsCount: 8,
    trips: {
      planning: 2,
      packing: 1,
      inProgress: 3,
      completed: 7
    }
  };

  constructor(private router: Router) {
    super();
  }

  navigateToTravelers(): void {
    this.router.navigate(['/travelers']);
  }

  navigateToThings(): void {
    this.router.navigate(['/things']);
  }

  navigateToPacks(): void {
    this.router.navigate(['/packs']);
  }

  navigateToTrips(): void {
    this.router.navigate(['/trips']);
  }
}
