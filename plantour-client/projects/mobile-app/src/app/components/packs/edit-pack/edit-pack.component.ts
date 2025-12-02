import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { NavigationService } from '../../../services/navigation.service';

@Component({
  selector: 'app-edit-pack',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './edit-pack.component.html',
  styleUrl: './edit-pack.component.scss'
})
export class EditPackComponent implements OnInit {
  private navigationService = inject(NavigationService);

  ngOnInit(): void {
    this.navigationService.setCustomBackPath('/packs', true);
  }
}
