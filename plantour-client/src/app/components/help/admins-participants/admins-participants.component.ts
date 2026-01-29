import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admins-participants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admins-participants.component.html',
  styleUrls: ['./admins-participants.component.scss']
})
export class AdminsParticipantsComponent {
  content = {
    mainHeading: 'Admins and Participants',
    intro: 'Plantour supports both trip organizers (Admins) and invitees (Participants) with clear roles and responsibilities.',
    admin: {
      title: 'Admins (Registered Users)',
      points: [
        'Admins are registered Plantour users who create trips and manage participant lists.',
        'Admins can include participants in any of their trips.',
        'Admins control shared items, assignments, and overall trip setup.',
        'Only Admin accounts are billed in paid plans.'
      ]
    },
    participant: {
      title: 'Participants (No Registration Required)',
      points: [
        'Participants do not need to register as Plantour users.',
        'An Admin sends an invitation email with a secure access link or access code.',
        'Invitees can open the email link or enter the access code to join the trip.',
        'Participants use Plantour for free and focus on their packing tasks.'
      ]
    },
    sharedLists: {
      title: 'Shared Items and Responsibility',
      points: [
        'Admins create shared item lists for group essentials.',
        'Each shared item can be assigned to a responsible participant.',
        'Completion status shows whether each item has been packed.'
      ]
    }
  };
}
