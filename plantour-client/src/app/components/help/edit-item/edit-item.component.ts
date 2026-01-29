import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  stepNumber: number;
  title: string;
  description: string;
  details?: string[];
  note?: string;
}

@Component({
  selector: 'app-edit-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.scss']
})
export class EditItemComponent {
  mainHeading = 'How to Edit Item Details';
  intro = 'Keeping your items library up to date ensures accurate packing lists. You can edit any item\'s details at any time, and changes to your master items don\'t affect items already added to trips (they remain unchanged in those trips).';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to the Items Module',
      description: 'Open the Items section from your main menu to view your items library.',
      details: [
        'Click on "Items" or "Things" in the navigation',
        'You\'ll see your complete list of items',
        'Use search to find specific items quickly'
      ]
    },
    {
      stepNumber: 2,
      title: 'Locate the Item to Edit',
      description: 'Find the specific item you want to modify.',
      details: [
        'Browse through your items list',
        'Use the search bar to find items by name',
        'Apply category filters if you have many items',
        'Sort the list to locate items more easily'
      ]
    },
    {
      stepNumber: 3,
      title: 'Open the Edit Form',
      description: 'Click on the item or the edit button to open the editing interface.',
      details: [
        'Click directly on the item name, or',
        'Look for an "Edit" button or pencil icon',
        'Some systems use a three-dot menu with an edit option',
        'The form opens showing current item details'
      ]
    },
    {
      stepNumber: 4,
      title: 'Update the Item Information',
      description: 'Modify any of the item\'s details as needed.',
      details: [
        'Name: Change or clarify the item name',
        'Category: Move to a different category',
        'Description: Update or add details',
        'Default quantity: Adjust the typical amount needed',
        'Notes: Add reminders or special instructions'
      ],
      note: 'Changes to master items don\'t affect items already in trips - those remain as they were when added.'
    },
    {
      stepNumber: 5,
      title: 'Save Your Changes',
      description: 'Click "Save" or "Update" to apply your modifications.',
      details: [
        'Confirm the changes are saved successfully',
        'The updated item appears in your items list',
        'Future trips will use the updated item details',
        'Use "Cancel" if you change your mind'
      ]
    },
    {
      stepNumber: 6,
      title: 'Verify the Updates',
      description: 'Check that your changes were applied correctly.',
      details: [
        'The item should display the updated information',
        'Search for the item to confirm changes',
        'You can edit again if needed'
      ]
    }
  ];

  editableFields = [
    {
      field: 'Item Name',
      description: 'Update the name to make it more descriptive or accurate',
      example: 'Change "Boots" to "Waterproof hiking boots"'
    },
    {
      field: 'Category',
      description: 'Move the item to a more appropriate category',
      example: 'Move sunscreen from "Miscellaneous" to "Toiletries"'
    },
    {
      field: 'Description',
      description: 'Add or modify details about the item',
      example: 'Add "Size 42, black, good for winter hiking"'
    },
    {
      field: 'Default Quantity',
      description: 'Change the typical amount you need',
      example: 'Update from 1 to 3 for "Pairs of socks"'
    },
    {
      field: 'Notes/Tags',
      description: 'Add special reminders or custom labels',
      example: 'Add note: "Must buy before trip" or tag "Essential"'
    }
  ];

  tips = [
    'Edit anytime: Changes to items don\'t affect trips where they\'re already used',
    'Be descriptive: Clear names and descriptions help you pack more efficiently',
    'Update after trips: Revise quantities or details based on actual use',
    'Fix mistakes immediately: Don\'t wait - edit items as soon as you spot errors',
    'Refine categories: Move items to better categories as your system evolves',
    'Add seasonal notes: Include details like "Summer only" or "Winter essential"'
  ];

  commonScenarios = [
    {
      scenario: 'Item name is too vague',
      solution: 'Edit to add specificity. "Jacket" becomes "Lightweight rain jacket" or "Heavy winter parka".'
    },
    {
      scenario: 'Wrong category assigned',
      solution: 'Simply change the category field to move the item to the correct group.'
    },
    {
      scenario: 'Quantity needs adjustment',
      solution: 'Update the default quantity based on your typical needs. You can still adjust per trip later.'
    },
    {
      scenario: 'Need to add size or color info',
      solution: 'Use the description field to add these details: "Blue, size M, quick-dry material".'
    },
    {
      scenario: 'Item details have changed',
      solution: 'If you replaced something (new phone model, different brand), update the item to reflect current details.'
    }
  ];

  importantNotes = [
    'Editing a master item doesn\'t change how it appears in trips where it\'s already been added',
    'Only future additions of this item to trips will use the updated information',
    'To update an item across all trips, you\'ll need to edit it in each trip individually',
    'Changes are instant - no need to refresh or wait for synchronization',
    'If you drastically change an item, consider creating a new item instead'
  ];

  commonIssues = [
    {
      problem: 'Changes not saving',
      solution: 'Ensure the item name is filled in (required field). Check for validation errors. Try refreshing the page and editing again.'
    },
    {
      problem: 'Can\'t find the edit button',
      solution: 'Try clicking directly on the item name. Look for a pencil icon, "Edit" text, or a three-dot menu next to the item.'
    },
    {
      problem: 'Updated item still shows old info in trip',
      solution: 'This is expected behavior. Master item edits don\'t affect trip items. Edit the item within the trip if you want to update it there.'
    },
    {
      problem: 'Lost track of what I changed',
      solution: 'Some systems show edit history. Otherwise, double-check the item details before saving to confirm your changes.'
    }
  ];
}
