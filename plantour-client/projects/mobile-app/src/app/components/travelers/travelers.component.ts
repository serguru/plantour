import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ToolbarAware } from '../toolbar-aware';

@Component({
  selector: 'app-travelers',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './travelers.component.html',
  styleUrl: './travelers.component.scss'
})
export class TravelersComponent extends ToolbarAware implements OnInit {

  ngOnInit(): void {
    this.setupToolbarButtons();
  }

  private setupToolbarButtons(): void {
    this.setToolbarButtons([
      {
        icon: 'pi pi-user-plus',
        tooltip: 'Add Traveler',
        command: () => console.log('Add traveler clicked')
      }
    ]);
  }
}
