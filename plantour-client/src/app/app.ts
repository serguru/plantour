import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UsersService } from './services/users-service';
import { ErrorToastComponent } from './components/error-toast-component/error-toast-component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorToastComponent ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  protected readonly title = signal('plantour-client');
  protected readonly profile = signal<string>('');


  constructor(private readonly usersService: UsersService) {
    
    
  }

  getProfile = () => {
      this.usersService.getProfile().subscribe(p => this.profile.set(JSON.stringify(p)))
  }

  throwException = () => {
    throw new Error("An error thrown!");
  }

}

