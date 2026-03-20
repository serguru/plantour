import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UsersService } from '../../../../services/users-service';

@Component({
  selector: 'app-help-get-started-guest-access-answer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="help-block" id="answer">
      @if (!usersService.isAuthenticatedSignal()) {
        <p>Yes. You can explore Plantour without creating a regular account.</p>
        <p>Use the Start temporary account button below to start guest access with prefilled demo data.</p>
        <p>It creates a temporary user and opens Plantour in the seeded demo trip so you can test the main flow immediately.</p>
      } @else {
        <p>Yes, with automatically created temporary account</p>
      }
    </section>

    @if (!usersService.isAuthenticatedSignal()) {
      <div class="help-answer-action" aria-label="Guest access">
        <button type="button" class="help-hero__guest-button" (click)="startTemporaryUser()">
          Start temporary account
        </button>
      </div>
    }
  `,
  styleUrl: '../../help-component.scss'
})
export class HelpGetStartedGuestAccessAnswerComponent {
  readonly usersService = inject(UsersService);

  startTemporaryUser(): void {
    this.usersService.createTemporaryUser();
  }
}