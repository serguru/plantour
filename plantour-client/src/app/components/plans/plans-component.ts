import { Component, inject } from '@angular/core';
import { PlansPanelComponent } from '../plans-panel/plans-panel.component';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users-service';

@Component({
  selector: 'app-plans-component',
  imports: [CommonModule],
  templateUrl: './plans-component.html',
  styleUrl: './plans-component.scss',
})
export class PlansComponent {
  plansPanelComponent = PlansPanelComponent;
}
