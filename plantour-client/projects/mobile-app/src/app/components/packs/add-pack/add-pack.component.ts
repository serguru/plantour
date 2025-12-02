import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { NavigationService } from '../../../services/navigation.service';

@Component({
  selector: 'app-add-pack',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './add-pack.component.html',
  styleUrl: './add-pack.component.scss'
})
export class AddPackComponent implements OnInit {
  private navigationService = inject(NavigationService);

  ngOnInit(): void {
    this.navigationService.setCustomBackPath('/packs', true);
  }
}
