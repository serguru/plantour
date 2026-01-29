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

interface Warning {
  warning: string;
  details: string[];
}

@Component({
  selector: 'app-delete-trip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-trip.component.html',
  styleUrls: ['./delete-trip.component.scss']
})
export class DeleteTripComponent {
  mainHeading = 'How to Delete a Trip';
  intro = 'Deleting a trip permanently removes it from Plantour along with all its associated data (participants, items, bags, assignments). Before deleting, consider alternatives like archiving or marking the trip as Completed. This guide explains how to safely delete trips and what to expect.';

  importantWarning: Warning = {
    warning: 'Deleting a trip is usually permanent and cannot be undone!',
    details: [
      'All participants associated with the trip will be removed',
      'All items assigned to the trip will be unassigned (but remain in your master items list)',
      'All bags created for this trip will be deleted',
      'All packing progress and assignments within this trip will be lost',
      'Trip history, notes, and any other trip-specific data will be permanently deleted'
    ]
  };

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to Your Trips',
      description: 'Go to the Trips section.',
      details: [
        'Click "Trips" in the main navigation',
        'You\'ll see your list of all trips',
        'Find the trip you want to delete'
      ]
    },
    {
      stepNumber: 2,
      title: 'Select the Trip',
      description: 'Open the trip details.',
      details: [
        'Click on the trip to open its detail view',
        'Look for options menu, actions button, or delete icon',
        'Usually found in the trip header or toolbar'
      ]
    },
    {
      stepNumber: 3,
      title: 'Find the Delete Option',
      description: 'Locate the delete button or menu item.',
      details: [
        'May be labeled "Delete Trip", "Remove Trip", or have a trash icon',
        'Often in an actions menu (three dots or "More" button)',
        'Sometimes in trip settings or edit mode'
      ],
      note: 'Delete options are often placed away from common actions to prevent accidental deletion.'
    },
    {
      stepNumber: 4,
      title: 'Click "Delete"',
      description: 'Initiate the deletion process.',
      details: [
        'A confirmation dialog will likely appear',
        'Read the warning carefully',
        'Note what data will be deleted'
      ],
      warning: 'Do not proceed unless you\'re certain you want to permanently delete this trip.'
    },
    {
      stepNumber: 5,
      title: 'Confirm Deletion',
      description: 'Verify you want to delete the trip.',
      details: [
        'You may need to type the trip name or click "Yes, Delete"',
        'Some systems require checking a box: "I understand this cannot be undone"',
        'Double-check you\'re deleting the correct trip'
      ]
    },
    {
      stepNumber: 6,
      title: 'Trip is Deleted',
      description: 'The trip is removed from your account.',
      details: [
        'You\'ll be redirected to your trips list',
        'The deleted trip will no longer appear',
        'Associated data (participants, bags) is also removed'
      ],
      note: 'Items assigned to the trip return to your master items list unassigned.'
    }
  ];

  alternatives: Alternative[] = [
    {
      option: 'Mark as Completed',
      description: 'Change the trip status to "Completed" instead of deleting it.',
      whenToUse: 'When the trip is over but you want to keep it for reference. Useful for reviewing past packing lists before future trips.'
    },
    {
      option: 'Archive the Trip',
      description: 'Move the trip to an archived state where it\'s hidden from your main list but not deleted.',
      whenToUse: 'For old trips you rarely reference but don\'t want to permanently lose. Keeps your active trips list clean.'
    },
    {
      option: 'Export or Save Data',
      description: 'Before deleting, export trip data, take screenshots, or note important information.',
      whenToUse: 'When you need some trip details for future reference but don\'t need the full trip in Plantour anymore.'
    },
    {
      option: 'Remove Participants Instead',
      description: 'Keep the trip but remove specific participants if they\'re the issue.',
      whenToUse: 'When the trip structure is useful but you no longer need certain travelers included.'
    }
  ];

  whenToDelete: string[] = [
    'You created a test or duplicate trip by mistake',
    'The trip was canceled and you won\'t reschedule it',
    'You have too many old trips and want to clean up permanently',
    'The trip was created incorrectly and starting fresh is easier than editing',
    'You\'re sure you\'ll never reference this trip\'s data again'
  ];

  whenNotToDelete: string[] = [
    'The trip is completed but you might want to reference it later (use "Completed" status instead)',
    'You\'re just trying to hide it from your current list (use "Archive" if available)',
    'You might travel to the same destination again (keep it as a template)',
    'You\'re unsure - better to archive or complete than delete',
    'Participants or others might need access to trip history'
  ];

  tips: string[] = [
    'Always read the confirmation dialog carefully before confirming deletion.',
    'Consider exporting or screenshotting important trip data before deleting.',
    'Check if your system offers an "Archive" feature instead of permanent deletion.',
    'Remember: Items assigned to deleted trips return to your master items list unassigned.',
    'If you accidentally delete a trip, contact support immediately - some systems may be able to recover it briefly.',
    'Regularly review and clean up old test or duplicate trips to keep your trips list organized.',
    'When in doubt, mark the trip as "Completed" or "Archived" rather than deleting it.'
  ];
}
