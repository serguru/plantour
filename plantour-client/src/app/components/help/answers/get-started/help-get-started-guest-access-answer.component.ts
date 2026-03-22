import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UsersService } from '../../../../services/users-service';

@Component({
  selector: 'app-help-get-started-guest-access-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-get-started-guest-access-answer.component.html',
  styleUrl: '../../help-component.scss'
})
export class HelpGetStartedGuestAccessAnswerComponent {
  readonly usersService = inject(UsersService);

  startTemporaryUser(): void {
    this.usersService.createTemporaryUser();
  }
}