import { Component, signal } from '@angular/core';
import { Users } from '../../../services/users';
import { ButtonModule } from 'primeng/button';
import { map } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  items = signal<string[]>([]);

  constructor(private readonly usersService: Users) {

  }

  click() {
    this.usersService.getWeather()
      .pipe(
        map(data => data.map(item => JSON.stringify(item)))
      )
      .subscribe(x => this.items.set(x));
  }
}
