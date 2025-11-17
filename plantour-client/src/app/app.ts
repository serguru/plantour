import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UsersService } from './services/users-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('plantour-client');
  protected readonly profile = signal<string>('');
  public usersService = inject(UsersService);

  getProfile = () => {
      this.usersService.getProfile().subscribe(p => this.profile.set(JSON.stringify(p)))
  }
}

