import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  stepNumber: number;
  title: string;
  description: string;
  details?: string[];
  note?: string;
}

interface Warning {
  title: string;
  description: string;
}

interface Issue {
  problem: string;
  solution: string;
}

@Component({
  selector: 'app-delete-bag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-bag.component.html',
  styleUrls: ['./delete-bag.component.scss']
})
export class DeleteBagComponent {
  mainHeading = 'How to Delete a Bag';
  intro = 'Sometimes you need to remove a bag from your trip - maybe you\'re consolidating luggage, corrected a duplicate, or plans changed. Deleting a bag is straightforward, but it\'s important to understand what happens to the items inside before you proceed.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to Your Bags List',
      description: 'Open the trip and go to the bags section.',
      details: [
        'Select your trip from the trips list',
        'Navigate to the "Bags", "Packages", or "Luggage" section',
        'View the list of all bags in your trip'
      ]
    },
    {
      stepNumber: 2,
      title: 'Find the Bag to Delete',
      description: 'Locate the specific bag you want to remove.',
      details: [
        'Browse through your bags list',
        'Use search or filter features if available',
        'Make sure it\'s the correct bag before proceeding'
      ],
      note: 'Double-check you have the right bag selected. Deletion is typically permanent.'
    },
    {
      stepNumber: 3,
      title: 'Check Bag Contents',
      description: 'Before deleting, verify what items (if any) are packed in the bag.',
      details: [
        'Click on the bag to see its contents',
        'Note how many items are inside',
        'Decide what to do with these items before deletion'
      ],
      note: 'Many systems prevent deletion of bags containing items. You may need to empty it first.'
    },
    {
      stepNumber: 4,
      title: 'Empty the Bag (If Required)',
      description: 'Remove or reassign items packed in the bag.',
      details: [
        'Unpack items one by one to "not packed" status',
        'Or reassign items to different bags',
        'Continue until the bag is empty',
        'Some systems may offer a "move all items" feature'
      ],
      note: 'This step might not be necessary if the bag is already empty or if your system allows deletion with items inside (which will unpack them automatically).'
    },
    {
      stepNumber: 5,
      title: 'Initiate Deletion',
      description: 'Access the delete function for the bag.',
      details: [
        'Look for a "Delete" button, trash icon, or three-dot menu',
        'Click the delete option',
        'The interface might be on the bag card itself or in the bag\'s detail view'
      ]
    },
    {
      stepNumber: 6,
      title: 'Confirm Deletion',
      description: 'Confirm that you want to permanently delete the bag.',
      details: [
        'A confirmation dialog will typically appear',
        'Read the warning message carefully',
        'Understand what will happen to items (if any remain)',
        'Click "Delete", "Confirm", or "Yes" to proceed',
        'Or click "Cancel" if you change your mind'
      ],
      note: 'This is your last chance to cancel. Once confirmed, the bag is removed from your trip.'
    },
    {
      stepNumber: 7,
      title: 'Verify Deletion',
      description: 'Check that the bag has been successfully removed.',
      details: [
        'The bag should disappear from your bags list',
        'If items were in the bag, check their status',
        'Verify your trip\'s bag count has decreased'
      ]
    }
  ];

  warnings: Warning[] = [
    {
      title: 'Permanent Action',
      description: 'Deleting a bag is usually permanent. You cannot undo it. If you might need the bag later, consider editing its name or marking it inactive instead of deleting.'
    },
    {
      title: 'Items Handling',
      description: 'What happens to items in the bag varies by system. They might be automatically unpacked (moved to "not packed"), require manual removal first, or be deleted along with the bag. Always check before confirming deletion.'
    },
    {
      title: 'Reassignment Not Possible',
      description: 'Once a bag is deleted, any historical data about what was packed in it may be lost. If you need to track packing history, keep the bag and empty it instead.'
    }
  ];

  whenToDelete: string[] = [
    'You created a duplicate bag by mistake',
    'You\'re consolidating multiple bags into one and no longer need the extras',
    'Plans changed and you\'re bringing fewer bags than originally thought',
    'You created a test bag and want to remove it',
    'A traveler dropped out and their bag is no longer needed',
    'You created a bag with the wrong information and it\'s easier to start over than edit'
  ];

  alternatives: { alternative: string; description: string }[] = [
    {
      alternative: 'Empty the Bag Instead',
      description: 'Remove all items but keep the bag structure. Useful if you might reuse it later in the trip or for another trip.'
    },
    {
      alternative: 'Rename the Bag',
      description: 'If the issue is just a wrong name, editing is safer than deleting and recreating.'
    },
    {
      alternative: 'Reassign Ownership',
      description: 'If the bag is fine but assigned to the wrong traveler, edit the owner rather than deleting.'
    },
    {
      alternative: 'Mark as "Not Using"',
      description: 'Some systems allow you to mark bags as inactive without deleting them, preserving history while cleaning up your active view.'
    }
  ];

  tips: string[] = [
    'Always empty a bag before deleting it to avoid confusion about where items went.',
    'If you\'re unsure, take a screenshot of the bag\'s contents before deletion.',
    'Consider if renaming or editing might solve your problem without deletion.',
    'For group trips, communicate with other travelers before deleting shared bags.',
    'If you delete a bag by mistake, immediately check if there\'s an "undo" feature.',
    'Before deleting, verify no one else is currently working with items in that bag.'
  ];

  commonIssues: Issue[] = [
    {
      problem: 'The delete button is grayed out or disabled',
      solution: 'The bag likely contains items. Empty the bag first by unpacking or reassigning all items, then try deleting again.'
    },
    {
      problem: 'I deleted a bag but items are still showing as packed',
      solution: 'The system may have automatically unpacked them. Check your "unpacked items" or "items without bag" list to find and reassign them.'
    },
    {
      problem: 'I accidentally deleted the wrong bag',
      solution: 'Check immediately for an "undo" button or feature. If not available, you\'ll need to recreate the bag and repack the items manually. Contact support if critical data was lost.'
    },
    {
      problem: 'The confirmation dialog doesn\'t appear',
      solution: 'Check if your browser is blocking pop-ups. Alternatively, the system might delete without confirmation - be extra careful with your clicks.'
    },
    {
      problem: 'I can\'t delete any bags at all',
      solution: 'You may not have permission to delete bags in this trip, especially if you\'re not the trip owner. Contact the trip organizer for assistance.'
    }
  ];

  importantNote = 'Before You Delete: Make absolutely certain you\'re deleting the correct bag. Check the bag name, owner, and contents. Deletion is typically permanent with no recovery option. When in doubt, edit or empty the bag instead of deleting it.';
}
