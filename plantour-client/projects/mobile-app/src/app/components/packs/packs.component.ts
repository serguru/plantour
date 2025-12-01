import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-packs',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './packs.component.html',
  styleUrl: './packs.component.scss'
})
export class PacksComponent implements OnInit {
  private navigationService = inject(NavigationService);

  ngOnInit(): void {
    this.navigationService.setCustomBackPath('/landing-registered', true);
  }
}
