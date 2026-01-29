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
  tip: string;
  description: string;
}

interface Issue {
  problem: string;
  solution: string;
}

@Component({
  selector: 'app-create-trip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-trip.component.html',
  styleUrls: ['./create-trip.component.scss']
})
export class CreateTripComponent {
  mainHeading = 'How to Create a New Trip';
  intro = 'Creating a trip is the first step in organizing your journey with Plantour. Once you create a trip, you can add participants, items, and bags to fully plan your adventure. This guide walks you through the trip creation process.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to the Trips Module',
      description: 'From your dashboard, open the Trips section.',
      details: [
        'Click on "Trips" in the main navigation or sidebar',
        'You\'ll see your list of existing trips (if any)',
        'Look for the "Add Trip", "New Trip", or "Create Trip" button'
      ]
    },
    {
      stepNumber: 2,
      title: 'Click "Create New Trip"',
      description: 'Start the trip creation process.',
      details: [
        'Usually a prominent button marked with a + icon',
        'May be labeled "Add Trip", "New Trip", or similar',
        'A form or dialog will appear'
      ]
    },
    {
      stepNumber: 3,
      title: 'Enter Trip Name',
      description: 'Give your trip a clear, descriptive name.',
      details: [
        'Use names that help you identify the trip later',
        'Examples: "Summer Beach Vacation 2026", "Paris Business Trip", "Family Reunion Weekend"',
        'The name should be unique and meaningful to you'
      ],
      note: 'A good trip name includes the destination and/or purpose. Avoid generic names like "Trip 1".'
    },
    {
      stepNumber: 4,
      title: 'Add Trip Description (Optional)',
      description: 'Provide additional details about the trip.',
      details: [
        'Describe the purpose, activities, or special considerations',
        'Example: "Week-long beach vacation with family. Focus on water activities and relaxation."',
        'This helps when looking back at old trips or sharing with others'
      ],
      note: 'While optional, descriptions are valuable for trips you plan far in advance or complex group trips.'
    },
    {
      stepNumber: 5,
      title: 'Set Start Date',
      description: 'Choose when your trip begins.',
      details: [
        'Click the date picker or calendar icon',
        'Select the departure date',
        'This helps with timeline planning and organizing your trips list'
      ]
    },
    {
      stepNumber: 6,
      title: 'Set End Date',
      description: 'Choose when your trip ends.',
      details: [
        'Select the return or final date of your journey',
        'Must be the same as or after the start date',
        'Helps calculate trip duration and plan accordingly'
      ],
      note: 'For day trips, start and end dates can be the same.'
    },
    {
      stepNumber: 7,
      title: 'Choose Initial Status (If Available)',
      description: 'Set the trip\'s current stage.',
      details: [
        'Usually defaults to "Planning" for new trips',
        'Some systems let you choose: Planning, Active, Completed, Archived',
        'You can always change this later'
      ]
    },
    {
      stepNumber: 8,
      title: 'Add Destination (If Available)',
      description: 'Specify where you\'re going.',
      details: [
        'Enter city, country, or region',
        'Some systems may offer location search or autocomplete',
        'This field helps organize and categorize trips'
      ]
    },
    {
      stepNumber: 9,
      title: 'Save the Trip',
      description: 'Create your new trip.',
      details: [
        'Click "Save", "Create", or "Add Trip"',
        'Your trip will appear in the trips list',
        'You can now add participants, items, and bags to it'
      ],
      note: 'After creation, you typically land on the trip detail page where you can continue setup.'
    }
  ];

  quickAddTips: QuickTip[] = [
    {
      tip: 'Start Simple',
      description: 'Create the trip first with just basic info. Add details like participants and items afterward. Don\'t try to fill everything at once.'
    },
    {
      tip: 'Use Consistent Naming',
      description: 'Develop a naming pattern for your trips. Example: "[Destination] - [Month Year]" or "[Purpose] Trip [Date]".'
    },
    {
      tip: 'Plan Ahead',
      description: 'Create trips as soon as you know you\'re traveling, even if it\'s months away. This gives you time to build a complete packing list.'
    },
    {
      tip: 'Copy from Previous Trips',
      description: 'If available, use the "duplicate" or "copy from" feature to start with a similar trip\'s structure.'
    }
  ];

  whatNext: string[] = [
    'Add participants (travelers) to the trip',
    'Add items from your master items list',
    'Create bags for packing organization',
    'Assign items to bags and participants',
    'Track packing progress as you prepare',
    'Set the trip as your "Current Trip" for easy access'
  ];

  tips: string[] = [
    'Create trips early in your planning process, not just before departure.',
    'If traveling with others, add them as participants immediately so you can coordinate.',
    'For recurring trips (annual vacations, monthly business trips), keep old ones as reference.',
    'Use the description field to note special requirements: "Need winter gear" or "Check passport expiration".',
    'Group similar trips by using consistent naming (all business trips start with "Work:", etc.).',
    'Don\'t delete old trips - mark them as Completed or Archived for future reference.'
  ];

  commonIssues: Issue[] = [
    {
      problem: 'I can\'t create a trip - the button is missing or disabled',
      solution: 'Check if you\'ve reached any trip limits (some systems limit trip count for free accounts). Also ensure you\'re logged in and have proper permissions.'
    },
    {
      problem: 'I get an error: "Trip name already exists"',
      solution: 'Each trip needs a unique name. Add dates, destinations, or numbers to distinguish: "Beach Vacation 2026" vs "Beach Vacation 2027".'
    },
    {
      problem: 'The end date won\'t accept a date before the start date',
      solution: 'This is intentional. Make sure your start date comes before (or is the same as) your end date. For day trips, use the same date for both.'
    },
    {
      problem: 'I created the trip but can\'t find it in my list',
      solution: 'Check if filters are applied to your trips list. Look for "All Trips" or "Clear Filters". New trips usually appear at the top or are marked as "Planning".'
    },
    {
      problem: 'I want to add participants but don\'t see the option',
      solution: 'You usually add participants after creating the trip. Open the trip details and look for "Add Participant", "Manage Travelers", or a similar option.'
    }
  ];
}
