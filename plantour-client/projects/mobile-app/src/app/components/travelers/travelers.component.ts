import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-travelers',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './travelers.component.html',
  styleUrl: './travelers.component.scss'
})
export class TravelersComponent implements OnInit {
  private navigationService = inject(NavigationService);

  ngOnInit(): void {
    this.navigationService.setCustomBackPath('/landing-registered', true);
  }
}
