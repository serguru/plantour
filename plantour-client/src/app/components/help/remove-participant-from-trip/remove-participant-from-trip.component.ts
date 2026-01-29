import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  stepNumber: number;
  title: string;
  description: string;
  details?: string[];
  note?: string;
  warning?: string;
}

interface Alternative {
  option: string;
  description: string;
  whenToUse: string;
}

@Component({
  selector: 'app-remove-participant-from-trip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './remove-participant-from-trip.component.html',
  styleUrls: ['./remove-participant-from-trip.component.scss']
})
export class RemoveParticipantFromTripComponent {
  mainHeading = 'Remove Participant from Trip';
  intro = 'Removing a participant takes them off the trip roster. Any items or bags assigned to them may become unassigned or need reassignment. Use this when someone is no longer part of the trip.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Open the Trip',
      description: 'Go to the trip you want to manage.',
      details: [
        'Navigate to the Trips section',
        'Select the trip from the list',
        'Open the Participants or People tab'
      ]
    },
    {
      stepNumber: 2,
      title: 'Locate the Participant',
      description: 'Find the person you want to remove.',
      details: [
        'Scroll the participant list',
        'Use search if the list is long',
        'Confirm you have the correct person'
      ]
    },
    {
      stepNumber: 3,
      title: 'Click Remove',
      description: 'Initiate the removal action.',
      details: [
        'Click the trash icon, remove button, or actions menu',
        'A confirmation dialog may appear',
        'Read the warning carefully'
      ],
      warning: 'Removing a participant may unassign items and bags. Be ready to reassign.'
    },
    {
      stepNumber: 4,
      title: 'Confirm Removal',
      description: 'Finalize the removal.',
      details: [
        'Click "Remove" or "Confirm" in the dialog',
        'The participant disappears from the list',
        'Review assignments to ensure everything is covered'
      ]
    }
  ];

  alternatives: Alternative[] = [
    {
      option: 'Change Role Instead',
      description: 'If you only want to reduce access, change their role to a more limited permission level.',
      whenToUse: 'When the person is still involved but should have fewer permissions.'
    },
    {
      option: 'Mark as Inactive (If Available)',
      description: 'Keep them listed but inactive or hidden.',
      whenToUse: 'When you want a record of who was involved but they are no longer active.'
    },
    {
      option: 'Reassign Items First',
      description: 'Move all assigned items to another participant before removing.',
      whenToUse: 'When you want to avoid unassigned items after removal.'
    }
  ];

  reassignmentChecklist: string[] = [
    'Review items assigned to the participant',
    'Reassign bags that belong to the participant',
    'Check shared items or responsibilities',
    'Notify other participants if responsibilities changed'
  ];

  tips: string[] = [
    'Reassign items and bags before removal to avoid gaps in responsibility.',
    'If the participant may rejoin later, consider keeping them and changing their role.',
    'Double-check you are removing the correct person.',
    'After removal, scan the trip for unassigned items.',
    'Only trip admins can remove participants.'
  ];
}
