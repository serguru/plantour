import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsersService } from '../services/users-service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {
  private readonly usersService = inject(UsersService);

  protected readonly currentUser = this.usersService.currentUser;
  protected readonly isAuthenticated = this.usersService.isAuthenticated;
}
