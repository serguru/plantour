import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './trips.component.html',
  styleUrl: './trips.component.scss'
})
export class TripsComponent implements OnInit {
  private navigationService = inject(NavigationService);

  ngOnInit(): void {
    this.navigationService.setCustomBackPath('/landing-registered', true);
  }
}
