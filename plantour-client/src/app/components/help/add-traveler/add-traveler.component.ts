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
  selector: 'app-add-traveler',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-traveler.component.html',
  styleUrls: ['./add-traveler.component.scss']
})
export class AddTravelerComponent {
  mainHeading = 'How to Add a Traveler';
  intro = 'Adding travelers to your Plantour account is quick and easy. Once added, you can assign them to any trip and track items they need to pack. Follow these step-by-step instructions to add your first traveler.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to the Travelers Module',
      description: 'From the main dashboard or navigation menu, click on "Travelers" to open the Travelers module.',
      details: [
        'Look for the Travelers icon in the sidebar or top navigation',
        'The icon typically looks like a group of people or user profiles',
        'You can also use the keyboard shortcut if enabled'
      ]
    },
    {
      stepNumber: 2,
      title: 'Click the "Add Traveler" Button',
      description: 'Once in the Travelers module, locate and click the "Add Traveler" or "New Traveler" button.',
      details: [
        'Usually found in the top-right corner of the screen',
        'May be labeled as "+", "Add New", or "Create Traveler"',
        'The button is typically styled in your primary theme color'
      ]
    },
    {
      stepNumber: 3,
      title: 'Fill in Traveler Information',
      description: 'A form will appear where you can enter the traveler\'s details. Fill in the required and optional fields.',
      details: [
        'Name (Required): Enter the traveler\'s first and last name',
        'Email (Optional): Add their email address if you plan to invite them to trips',
        'Phone Number (Optional): Include contact information for reference',
        'Notes (Optional): Add any additional information about the traveler'
      ],
      note: 'Only the name field is required. You can always add or edit the other information later.'
    },
    {
      stepNumber: 4,
      title: 'Choose a Role (if applicable)',
      description: 'Depending on your setup, you may need to specify whether this traveler is an adult, child, or has a specific role.',
      details: [
        'This helps with organizing travelers in larger groups',
        'Some trips may have age-specific packing requirements',
        'Role information can be edited later if needed'
      ]
    },
    {
      stepNumber: 5,
      title: 'Save the Traveler',
      description: 'Click the "Save", "Create", or "Add Traveler" button to add the traveler to your list.',
      details: [
        'The new traveler will appear in your Travelers list immediately',
        'You\'ll see a confirmation message',
        'The traveler is now available to assign to any trip'
      ]
    },
    {
      stepNumber: 6,
      title: 'Verify the Traveler Was Added',
      description: 'After saving, you should see the new traveler in your Travelers list.',
      details: [
        'Check that the name and information are correct',
        'You can edit the traveler\'s details by clicking on their entry',
        'The traveler can now be selected when creating or editing trips'
      ]
    }
  ];

  tips = [
    'Add yourself first: If you haven\'t already, make sure you\'re listed as a traveler so you can assign items to yourself.',
    'Add frequently used travelers: Include family members or regular travel companions to save time on future trips.',
    'Keep information updated: Regularly update email addresses and phone numbers to ensure accurate contact information.',
    'Use descriptive names: If you have multiple people with similar names, include last names or nicknames to distinguish them.',
    'Don\'t worry about mistakes: You can always edit or delete travelers later if needed.'
  ];

  commonIssues = [
    {
      problem: 'Can\'t find the Add Traveler button',
      solution: 'Make sure you\'re in the Travelers module, not within a specific trip. The button should be clearly visible at the top of the page.'
    },
    {
      problem: 'Email validation error',
      solution: 'Ensure the email address is in the correct format (e.g., name@example.com). If it\'s optional, you can leave it blank.'
    },
    {
      problem: 'Traveler already exists',
      solution: 'Check if you\'ve already added this person. Use the search or filter feature to find existing travelers before adding duplicates.'
    }
  ];

  nextSteps = [
    'After adding travelers, you can assign them to trips in the Trip Participants section',
    'Learn how to edit traveler information if details change',
    'Explore how to organize travelers using filters and sorting options',
    'Discover how to assign items to specific travelers within a trip'
  ];
}
