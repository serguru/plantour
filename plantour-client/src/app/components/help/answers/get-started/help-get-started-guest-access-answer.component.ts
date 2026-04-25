
import { Component, inject } from '@angular/core';
import { UsersService } from '../../../../services/users-service';
import { YoutubeComponent } from '../../../youtube/youtube-component';

@Component({
  selector: 'app-help-get-started-guest-access-answer',
  standalone: true,
  imports: [YoutubeComponent],
  templateUrl: './help-get-started-guest-access-answer.component.html',
  styleUrl: '../../help-component.scss'
})
export class HelpGetStartedGuestAccessAnswerComponent {
  readonly usersService = inject(UsersService);

  startTemporaryUser(): void {
    this.usersService.createTemporaryUser();
  }
}