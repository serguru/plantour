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
  selector: 'app-add-ai-items-to-trip-own',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-ai-items-to-trip-own.component.html',
  styleUrls: ['./add-ai-items-to-trip-own.component.scss']
})
export class AddAiItemsToTripOwnComponent {
  mainHeading = 'How to Add AI-Recommended Items to Your Trip Own Items';
  intro = 'Trip Own Items are items that belong specifically to your trip - not shared with other travelers. After getting AI recommendations, you can directly add them to your current trip\'s own items list. This is a quick way to build a comprehensive packing list for your specific trip without manually adding each item.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Make Sure You Have a Trip Selected',
      description: 'Ensure that your current trip is selected before adding items.',
      details: [
        'Check the top of your screen or navigation - it should show "Current Trip: [Trip Name]"',
        'If no trip is selected, go to the Trips module and select your desired trip',
        'You can only add items to the trip you have selected',
        'If you want to add items to a different trip, select that trip first'
      ]
    },
    {
      stepNumber: 2,
      title: 'Navigate to AI Recommendations',
      description: 'Open the AI recommendation feature from your navigation.',
      details: [
        'Look for "AI Templates", "AI Recommendations", or similar option',
        'You can usually access this from the Items module or main navigation',
        'Some systems show it under the current trip\'s tools',
        'The AI recommendations interface should open'
      ]
    },
    {
      stepNumber: 3,
      title: 'Generate Your AI Recommendations',
      description: 'Submit your trip description to get AI recommendations.',
      details: [
        'Describe your trip in the prompt field (destination, activities, duration, climate)',
        'Click "Generate" or "Get Recommendations"',
        'The AI will analyze your trip and create a personalized items list',
        'Wait for the recommendations to load (usually a few seconds)'
      ]
    },
    {
      stepNumber: 4,
      title: 'Select Items for Your Trip',
      description: 'Choose which recommended items you want to add to your trip.',
      details: [
        'Review the AI-generated list of recommended items',
        'Check the boxes next to items you want to add to your trip own items',
        'Uncheck any items that don\'t apply to your specific trip',
        'You can filter, search, or sort the list to find items more easily',
        'Use "Select All" if you want to keep most items, then uncheck the ones you don\'t want'
      ]
    },
    {
      stepNumber: 5,
      title: 'Choose "Trip Own Items" as the Target',
      description: 'Select the correct destination for adding items to your trip.',
      details: [
        'Look for a target selector or dropdown',
        'The options should include: Items Dictionary, Trip Own Items, and Shared Items',
        'Select "Trip Own Items" or "Current Trip Items"',
        'This ensures items go to your trip, not to the shared list',
        'Confirm your selection is correct'
      ],
      note: 'Trip Own Items are items you\'re personally packing for this trip. They\'re not shared with other travelers.'
    },
    {
      stepNumber: 6,
      title: 'Click "Add Items" or "Add to Trip"',
      description: 'Execute the action to add your selected items to your trip.',
      details: [
        'Look for a button like "Add Items", "Add to Trip", or "Save"',
        'Verify that "Trip Own Items" is selected as the target',
        'Click the button to add all selected items at once',
        'The system will process and add the items to your current trip'
      ]
    },
    {
      stepNumber: 7,
      title: 'Verify Items Were Added to Your Trip',
      description: 'Confirm that the items successfully appear in your trip\'s packing list.',
      details: [
        'You should see a success notification or message',
        'The items should now appear in your trip\'s Items list',
        'Navigate to your current trip to view and manage the items',
        'The items are now part of your trip-specific packing list'
      ]
    },
    {
      stepNumber: 8,
      title: 'Manage Trip Items as Needed',
      description: 'You can now refine your trip packing list with additional actions.',
      details: [
        'Mark items as "packed" when you\'ve actually packed them',
        'Edit quantities if you need different amounts than suggested',
        'Delete items you decide you don\'t need',
        'Assign items to specific travelers if needed',
        'Add additional notes or reminders to specific items'
      ]
    }
  ];

  benefits = [
    {
      title: 'Fast Trip Setup',
      description: 'Get a complete, AI-generated packing list for your trip in minutes instead of hours.'
    },
    {
      title: 'Trip-Specific',
      description: 'Items are customized for YOUR trip - not generic lists. The AI considers your destination, activities, and climate.'
    },
    {
      title: 'Easy to Manage',
      description: 'You can quickly review, edit, and remove items after they\'re added to your trip.'
    },
    {
      title: 'Peace of Mind',
      description: 'Less likely to forget important items when you have an AI-generated comprehensive list.'
    }
  ];

  tips = [
    'Start with AI recommendations, then customize based on your actual needs and preferences',
    'If the initial list seems too large, remove items you definitely won\'t use rather than keeping unnecessary items',
    'Consider adding quantity for each item based on the trip length and number of people',
    'Mark items as "packed" as you actually pack them to track progress',
    'Add personal reminders or notes to items that need special attention',
    'Don\'t be afraid to edit or remove recommended items - you know your needs better than the AI',
    'After your trip, review what you actually used to refine future recommendations'
  ];

  commonIssues = [
    {
      problem: 'Items were added to my Items Dictionary instead of my trip',
      solution: 'Make sure you selected "Trip Own Items" as your target before clicking add. You can still add them to your trip manually, or delete the dictionary items you don\'t need.'
    },
    {
      problem: 'I want to add the same items to multiple trips',
      solution: 'Use your Items Dictionary instead of Trip Own Items. Add items to your dictionary once, then quickly add them to multiple trips from there.'
    },
    {
      problem: 'Some recommended items are already in my trip',
      solution: 'Uncheck duplicates before adding. Alternatively, you can delete duplicate items from your trip after they\'re added.'
    },
    {
      problem: 'I added items but my current trip didn\'t change',
      solution: 'Make sure the correct trip is selected. Refresh the page or navigate away and back to your trip to see the updated items.'
    },
    {
      problem: 'The quantity of an item doesn\'t match my trip length',
      solution: 'After adding items, edit each item\'s quantity in your trip to match your specific needs. For example, adjust socks quantity for a longer trip.'
    }
  ];
}
