import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  stepNumber: number;
  title: string;
  description: string;
  details?: string[];
  note?: string;
}

interface QuickTip {
  title: string;
  description: string;
}

interface Issue {
  problem: string;
  solution: string;
}

@Component({
  selector: 'app-add-participant-to-trip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-participant-to-trip.component.html',
  styleUrls: ['./add-participant-to-trip.component.scss']
})
export class AddParticipantToTripComponent {
  mainHeading = 'Add Participant to Trip';
  intro = 'Participants are the people who will travel or help coordinate the trip. Adding participants allows you to assign items, bags, and responsibilities for better collaboration.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Open the Trip',
      description: 'Go to the trip you want to manage.',
      details: [
        'Open the Trips section',
        'Select the trip from the list',
        'Navigate to the Participants or People tab'
      ]
    },
    {
      stepNumber: 2,
      title: 'Click "Add Participant"',
      description: 'Start the add participant flow.',
      details: [
        'Look for a button with a + icon or "Add Participant"',
        'Some screens may show "Invite" or "Add Person" instead',
        'A form or modal will open'
      ]
    },
    {
      stepNumber: 3,
      title: 'Select an Existing Traveler or Create New',
      description: 'Pick a person from your Traveler list or add someone new.',
      details: [
        'Search for an existing Traveler by name',
        'If they don\'t exist, create a new participant profile',
        'Enter basic details like name and email (if required)'
      ],
      note: 'Using existing Travelers helps keep consistency across trips.'
    },
    {
      stepNumber: 4,
      title: 'Assign Role or Permissions (If Available)',
      description: 'Set what the participant can see or edit.',
      details: [
        'Assign as Admin or Participant',
        'Some systems allow custom permissions',
        'You can update roles later if needed'
      ]
    },
    {
      stepNumber: 5,
      title: 'Save the Participant',
      description: 'Confirm and add them to the trip.',
      details: [
        'Click "Add", "Save", or "Invite"',
        'The participant appears in the trip participant list',
        'You can now assign items and bags to them'
      ]
    }
  ];

  quickTips: QuickTip[] = [
    {
      title: 'Add Everyone Early',
      description: 'Add participants as soon as the trip roster is known so you can assign responsibilities sooner.'
    },
    {
      title: 'Use Clear Names',
      description: 'Use full names to avoid confusion, especially in group trips with similar names.'
    },
    {
      title: 'Assign Roles Thoughtfully',
      description: 'Admins can edit trip details. Participants typically manage only their own packing.'
    },
    {
      title: 'Keep It Updated',
      description: 'Remove or update participants when plans change to keep lists accurate.'
    }
  ];

  whatNext: string[] = [
    'Assign items to the participant for packing responsibilities',
    'Assign a bag to the participant if they have their own luggage',
    'Share trip details if collaboration is enabled',
    'Review permissions to ensure correct access',
    'Track packing progress for each participant'
  ];

  commonIssues: Issue[] = [
    {
      problem: 'I can\'t find the person in my traveler list',
      solution: 'Create a new participant profile directly or add them to your Travelers list first, then select them.'
    },
    {
      problem: 'The Add Participant button is disabled',
      solution: 'Check if you have permission to edit the trip. Only admins can add participants.'
    },
    {
      problem: 'I accidentally added the wrong person',
      solution: 'Remove the participant from the trip and add the correct person. No data is lost.'
    },
    {
      problem: 'The participant can\'t see the trip',
      solution: 'Verify they were added with the correct permissions and that they\'re logged into the correct account.'
    }
  ];
}
