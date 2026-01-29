import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  stepNumber: number;
  title: string;
  description: string;
  details?: string[];
  warning?: string;
}

interface Consequence {
  title: string;
  description: string;
}

@Component({
  selector: 'app-delete-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-item.component.html',
  styleUrls: ['./delete-item.component.scss']
})
export class DeleteItemComponent {
  mainHeading = 'How to Delete an Item';
  intro = 'Deleting an item removes it from your master items library. This action is permanent and cannot be undone. However, items that have already been added to trips will remain in those trips unaffected.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to the Items Module',
      description: 'Go to the Items section to access your items library.',
      details: [
        'Click on "Items" or "Things" in the main menu',
        'Your full list of items will be displayed',
        'Use search or filters to locate items faster'
      ]
    },
    {
      stepNumber: 2,
      title: 'Find the Item to Delete',
      description: 'Locate the specific item you want to remove from your library.',
      details: [
        'Browse through your items list',
        'Use the search function to find specific items',
        'Apply category filters if needed',
        'Double-check you have the correct item before proceeding'
      ],
      warning: 'Make sure you\'ve selected the right item - deletion is permanent!'
    },
    {
      stepNumber: 3,
      title: 'Access the Delete Option',
      description: 'Open the item\'s menu or options to find the delete function.',
      details: [
        'Look for a "Delete" button or trash can icon',
        'Some systems use a three-dot menu with a delete option',
        'Right-click might also show delete in context menu',
        'The delete option is usually marked with red or warning colors'
      ]
    },
    {
      stepNumber: 4,
      title: 'Confirm the Deletion',
      description: 'A confirmation dialog will appear to prevent accidental deletions.',
      details: [
        'Read the confirmation message carefully',
        'Understand what will happen (see "What Happens" section below)',
        'Click "Confirm," "Delete," or "Yes" to proceed',
        'Click "Cancel" or "No" if you change your mind'
      ],
      warning: 'This is your last chance to cancel before the item is permanently removed.'
    },
    {
      stepNumber: 5,
      title: 'Verify the Deletion',
      description: 'Confirm that the item has been removed from your library.',
      details: [
        'The item should no longer appear in your items list',
        'Search for the item name to verify it\'s gone',
        'Check related categories to ensure removal',
        'You cannot undo this action'
      ]
    }
  ];

  whatHappens: Consequence[] = [
    {
      title: 'Master item is permanently deleted',
      description: 'The item is removed from your items library and cannot be recovered. You\'ll need to recreate it if you want it back.'
    },
    {
      title: 'No longer available for new trips',
      description: 'You won\'t be able to add this item to future trips from your master list. It simply won\'t appear as an option anymore.'
    },
    {
      title: 'Existing trips remain unaffected',
      description: 'Items already added to trips stay in those trips. Deleting the master item doesn\'t remove it from trips where it\'s already used.'
    },
    {
      title: 'No warning in active trips',
      description: 'The system won\'t notify you about existing uses of the item. Check your trips manually if you need to track where it was used.'
    },
    {
      title: 'Statistics may be affected',
      description: 'If you have usage statistics or item history, the deleted item\'s data may no longer be visible or accessible.'
    }
  ];

  alternatives = [
    {
      instead: 'Archive or deactivate instead',
      reason: 'If you might need the item later, check if your system supports archiving or deactivating items without deleting them permanently.'
    },
    {
      instead: 'Edit the item name',
      reason: 'If the problem is just the name or details, edit the item instead of deleting and recreating it.'
    },
    {
      instead: 'Create a new category',
      reason: 'If you want to hide certain items, consider moving them to a "Unused" or "Archive" category instead of deleting.'
    },
    {
      instead: 'Remove from trips only',
      reason: 'If you want to stop using an item, simply don\'t add it to future trips. You don\'t have to delete the master item.'
    }
  ];

  beforeDeleting = [
    'Verify you have the correct item selected',
    'Check if the item is used in any active or upcoming trips',
    'Consider if you might need this item in the future',
    'Decide if editing or archiving would be better than deleting',
    'Make sure no one else on your team needs this item',
    'Remember that deletion is permanent and cannot be undone',
    'Take note of the item\'s details if you might want to recreate it later'
  ];

  whenToDelete = [
    {
      scenario: 'Duplicate items',
      reason: 'You created the same item twice and need to remove the duplicate'
    },
    {
      scenario: 'Outdated equipment',
      reason: 'You no longer own or use this item (e.g., sold your tent, switched phone models)'
    },
    {
      scenario: 'Mistake or test item',
      reason: 'The item was created by accident or for testing purposes'
    },
    {
      scenario: 'Irrelevant items',
      reason: 'The item doesn\'t fit your travel style anymore (e.g., you stopped camping)'
    },
    {
      scenario: 'Cleaning up the library',
      reason: 'You\'re reorganizing and want to remove clutter from your items list'
    }
  ];

  commonIssues = [
    {
      problem: 'Delete button is disabled or missing',
      solution: 'Check if you have the necessary permissions. Some items might be protected from deletion. Try refreshing the page or checking system settings.'
    },
    {
      problem: 'Item deleted but still appears in search',
      solution: 'Refresh your browser or clear the cache. The search index might take a moment to update. If it persists, log out and log back in.'
    },
    {
      problem: 'Accidentally deleted the wrong item',
      solution: 'Unfortunately, deletions are permanent. You\'ll need to recreate the item with the same details. Take this as a reminder to double-check before confirming deletions.'
    },
    {
      problem: 'Can\'t delete an item that\'s used in trips',
      solution: 'This is actually expected behavior in some systems - they protect items that are actively used. You may need to remove the item from all trips first, or the system simply won\'t allow deletion of in-use items.'
    }
  ];
}
