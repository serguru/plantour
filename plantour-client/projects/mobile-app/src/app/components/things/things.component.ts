import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-things',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './things.component.html',
  styleUrl: './things.component.scss'
})
export class ThingsComponent implements OnInit {
  private navigationService = inject(NavigationService);

  ngOnInit(): void {
    this.navigationService.setCustomBackPath('/landing-registered', true);
  }
}
