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
  selector: 'app-edit-traveler',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-traveler.component.html',
  styleUrls: ['./edit-traveler.component.scss']
})
export class EditTravelerComponent {
  mainHeading = 'How to Edit Traveler Information';
  intro = 'Keeping traveler information up to date is important for accurate trip planning and communication. You can easily edit any traveler\'s details at any time, and the changes will be reflected across all trips where they\'re assigned.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to the Travelers Module',
      description: 'From your dashboard or main menu, click on "Travelers" to view your list of travelers.',
      details: [
        'The Travelers module shows all people you\'ve added to your account',
        'You can use the search function to quickly find a specific traveler',
        'The list displays basic information like name and email'
      ]
    },
    {
      stepNumber: 2,
      title: 'Locate the Traveler to Edit',
      description: 'Find the traveler whose information you want to update. You can browse the list or use search/filter features.',
      details: [
        'Use the search bar to find travelers by name',
        'Apply filters if you have many travelers',
        'Sort the list by name or other criteria for easier navigation'
      ]
    },
    {
      stepNumber: 3,
      title: 'Open the Edit Form',
      description: 'Click on the traveler\'s entry or click the "Edit" button (usually represented by a pencil icon) to open the editing form.',
      details: [
        'Some interfaces allow you to click directly on the traveler\'s name',
        'Look for an "Edit" button, pencil icon, or three-dot menu',
        'The form will open showing the traveler\'s current information'
      ]
    },
    {
      stepNumber: 4,
      title: 'Update the Information',
      description: 'Modify any of the traveler\'s details as needed. You can update name, email, phone number, notes, and other fields.',
      details: [
        'Name: Update first name, last name, or full name',
        'Email: Change or add an email address',
        'Phone: Update contact phone number',
        'Notes: Add or modify any additional information',
        'Role/Category: Update traveler classification if applicable'
      ],
      note: 'All fields except the name are usually optional. Make sure to keep at least the name field filled in.'
    },
    {
      stepNumber: 5,
      title: 'Save Your Changes',
      description: 'Click the "Save" or "Update" button to save your modifications.',
      details: [
        'You\'ll see a confirmation message when changes are saved',
        'The updated information appears immediately in the travelers list',
        'Changes are automatically reflected in all trips where this traveler is assigned'
      ],
      note: 'If you change your mind, use the "Cancel" button to discard changes without saving.'
    },
    {
      stepNumber: 6,
      title: 'Verify the Updates',
      description: 'After saving, check that the changes were applied correctly.',
      details: [
        'The traveler\'s entry should show the updated information',
        'If the traveler is assigned to trips, verify the changes appear there too',
        'You can edit the traveler again anytime if needed'
      ]
    }
  ];

  editableFields = [
    {
      field: 'Name',
      description: 'Update the traveler\'s full name, first name, or last name',
      impact: 'Changes appear everywhere the traveler is referenced'
    },
    {
      field: 'Email Address',
      description: 'Add, update, or remove email contact information',
      impact: 'Important if you plan to invite them as participants to trips'
    },
    {
      field: 'Phone Number',
      description: 'Update contact phone number',
      impact: 'Useful for keeping contact information current'
    },
    {
      field: 'Notes',
      description: 'Add personal notes or reminders about the traveler',
      impact: 'Only visible to you, helpful for organizing information'
    },
    {
      field: 'Role/Category',
      description: 'Change traveler classification (adult, child, etc.)',
      impact: 'May affect how they\'re grouped or sorted in lists'
    }
  ];

  tips = [
    'Edit anytime: You can modify traveler information at any point, even if they\'re already assigned to active trips.',
    'Changes propagate automatically: Updates to a traveler\'s information are reflected across all trips where they\'re assigned.',
    'Keep email current: If you plan to invite travelers as participants, make sure their email addresses are accurate.',
    'Use notes field: The notes section is great for storing additional context like dietary restrictions, passport numbers, or preferences.',
    'Don\'t worry about mistakes: If you make an error while editing, you can always go back and fix it.'
  ];

  commonIssues = [
    {
      problem: 'Can\'t find the Edit button',
      solution: 'Look for a pencil icon, "Edit" text, or three-dot menu next to the traveler\'s name. Some interfaces require clicking directly on the traveler\'s entry.'
    },
    {
      problem: 'Changes not saving',
      solution: 'Ensure all required fields (usually just name) are filled in correctly. Check your internet connection and try again. Look for error messages near specific fields.'
    },
    {
      problem: 'Email validation error',
      solution: 'Make sure the email address is in proper format (name@domain.com). If you want to remove the email, try clearing the field completely.'
    },
    {
      problem: 'Changes don\'t appear in trips',
      solution: 'Refresh the page or navigate away and back. Changes should appear immediately, but sometimes a page refresh helps.'
    }
  ];

  importantNotes = [
    'Editing a traveler doesn\'t affect their assignment to trips - they remain assigned to the same trips.',
    'If you change a traveler\'s email and they were already invited as a participant, the invitation remains valid with the old email.',
    'Changes to traveler information are instant and don\'t require trip-level updates.',
    'You can\'t edit travelers who were added by other users (if they shared a trip with you).'
  ];
}
