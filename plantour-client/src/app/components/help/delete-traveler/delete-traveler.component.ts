import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  stepNumber: number;
  title: string;
  description: string;
  details?: string[];
  warning?: string;
}

@Component({
  selector: 'app-delete-traveler',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-traveler.component.html',
  styleUrls: ['./delete-traveler.component.scss']
})
export class DeleteTravelerComponent {
  mainHeading = 'How to Delete a Traveler';
  intro = 'Sometimes you need to remove a traveler from your list. This guide explains how to delete travelers safely and what happens when you do. Important: Deleting a traveler is permanent and cannot be undone, so make sure you really want to remove them.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to the Travelers Module',
      description: 'Open the Travelers section from your main dashboard or navigation menu.',
      details: [
        'Click on the "Travelers" link in the sidebar or top menu',
        'You\'ll see your complete list of travelers',
        'Use search or filters to find travelers more quickly'
      ]
    },
    {
      stepNumber: 2,
      title: 'Locate the Traveler to Delete',
      description: 'Find the specific traveler you want to remove from your list.',
      details: [
        'Browse through your travelers list',
        'Use the search bar to find them by name',
        'Apply filters if you have many travelers',
        'Make absolutely sure this is the correct traveler'
      ],
      warning: 'Double-check you\'ve selected the right person. Deletion is permanent!'
    },
    {
      stepNumber: 3,
      title: 'Open the Delete Option',
      description: 'Access the delete function for the selected traveler.',
      details: [
        'Look for a "Delete" button, trash icon, or three-dot menu',
        'The delete option might be in an action menu next to the traveler',
        'Some interfaces require clicking "Edit" first, then finding "Delete" in the form',
        'Common icon representations: trash can, X, or "Remove"'
      ]
    },
    {
      stepNumber: 4,
      title: 'Review the Deletion Warning',
      description: 'A confirmation dialog will appear explaining what will happen when you delete this traveler.',
      details: [
        'Read the warning message carefully',
        'Check if the traveler is assigned to any active trips',
        'Understand that all associations will be removed',
        'Note: You may not be able to delete travelers assigned to active trips'
      ],
      warning: 'If the traveler is assigned to trips, you might need to remove them from those trips first.'
    },
    {
      stepNumber: 5,
      title: 'Confirm the Deletion',
      description: 'If you\'re certain you want to proceed, confirm the deletion.',
      details: [
        'Click "Delete", "Confirm", or "Yes" in the confirmation dialog',
        'Some systems require typing the traveler\'s name to confirm',
        'The traveler will be permanently removed from your list',
        'You\'ll see a success message confirming the deletion'
      ],
      warning: 'This action cannot be undone. The traveler will be permanently deleted.'
    },
    {
      stepNumber: 6,
      title: 'Verify the Deletion',
      description: 'Check that the traveler has been successfully removed.',
      details: [
        'The traveler should no longer appear in your list',
        'Search for them to confirm they\'re gone',
        'Check any trips where they were assigned - they should be removed',
        'If you deleted by mistake, you\'ll need to add them again from scratch'
      ]
    }
  ];

  whatHappens = [
    {
      action: 'Traveler Record Deleted',
      description: 'The traveler\'s name, email, phone, and all associated information are permanently removed from your account.'
    },
    {
      action: 'Trip Assignments Removed',
      description: 'The traveler is automatically unassigned from all trips where they were listed. Items assigned to them become unassigned.'
    },
    {
      action: 'Item Assignments Cleared',
      description: 'Any packing items that were assigned to this traveler will lose that assignment and may need to be reassigned to someone else.'
    },
    {
      action: 'Participant Status Unaffected',
      description: 'If this traveler was also invited as a Participant (with a Plantour account), their participant access to trips remains unchanged. They can still access shared trips.'
    },
    {
      action: 'Cannot Be Recovered',
      description: 'Once deleted, the traveler cannot be restored. You would need to add them again as a new traveler if needed.'
    }
  ];

  beforeYouDelete = [
    'Check if the traveler is assigned to any active or upcoming trips',
    'Consider if you might need this traveler information in the future',
    'Make a note of their contact details if you might want to re-add them later',
    'Verify you\'re deleting the correct person (not someone with a similar name)',
    'Consider editing their information instead if the issue is outdated details',
    'Remove them from active trips first if the system requires it'
  ];

  alternatives = [
    {
      title: 'Edit Instead of Delete',
      description: 'If the traveler\'s information is just outdated, consider editing their details instead of deleting them entirely.'
    },
    {
      title: 'Keep for Historical Records',
      description: 'Even if you won\'t travel with them again, keeping their record doesn\'t hurt and preserves trip history.'
    },
    {
      title: 'Add Notes',
      description: 'Use the notes field to mark a traveler as "inactive" or "do not use" instead of deleting them.'
    },
    {
      title: 'Remove from Trips Only',
      description: 'You can unassign a traveler from specific trips without deleting them from your master list.'
    }
  ];

  commonIssues = [
    {
      problem: 'Can\'t delete traveler',
      solution: 'The traveler might be assigned to active trips. Remove them from all trips first, then try deleting again. Some systems prevent deletion of travelers currently in use.'
    },
    {
      problem: 'Delete button is missing',
      solution: 'Check if you have permission to delete travelers. Look in the three-dot menu or "Edit" screen. You may need admin privileges.'
    },
    {
      problem: 'Accidentally deleted wrong traveler',
      solution: 'Unfortunately, deletions are permanent. You\'ll need to add the traveler back as a new entry with all their information.'
    },
    {
      problem: 'Traveler still appears in trips',
      solution: 'Refresh the page or log out and back in. If they still appear, there may be a syncing issue - contact support.'
    }
  ];
}
