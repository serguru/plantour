import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsersService } from '../services/users-service';

@Component({
  selector: 'app-sign-out-page',
  imports: [RouterLink],
  templateUrl: './sign-out-page.html',
  styleUrl: './sign-out-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignOutPage implements OnInit {
  private readonly usersService = inject(UsersService);

  ngOnInit(): void {
    this.usersService.signOut();
  }
}
