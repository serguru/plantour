import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-in-to-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sign-in-to-account.component.html',
  styleUrls: ['./sign-in-to-account.component.scss']
})
export class SignInToAccountComponent {
  content = {
    mainHeading: 'Sign In to Your Account',
    intro: 'Admins and Participants sign in differently. Follow the steps below based on your role.',
    admin: {
      title: 'Admins (Registered Users)',
      steps: [
        'Open Plantour and click "Sign In".',
        'Enter your email and password.',
        'Click "Sign In" to access your dashboard and manage trips.'
      ]
    },
    participant: {
      title: 'Participants (Invited Users)',
      steps: [
        'Open the invitation email from the Admin.',
        'Click the secure access link, or copy the access code.',
        'If using the access code, open Plantour and enter the code to sign in.',
        'You will be taken directly to the trip you were invited to.'
      ]
    },
    tips: {
      title: 'Helpful Tips',
      items: [
        'If you forgot your password (Admins), use the "Forgot Password" link on the sign-in screen.',
        'Participants do not need to create a Plantour account.',
        'If an invitation link expires, ask the Admin to resend it.'
      ]
    }
  };
}
