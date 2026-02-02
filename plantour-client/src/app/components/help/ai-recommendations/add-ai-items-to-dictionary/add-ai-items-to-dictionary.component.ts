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
  selector: 'app-add-ai-items-to-dictionary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-ai-items-to-dictionary.component.html',
  styleUrls: ['./add-ai-items-to-dictionary.component.scss']
})
export class AddAiItemsToDictionaryComponent {
  mainHeading = 'How to Add AI-Recommended Items to Your Items Dictionary';
  intro = 'After getting AI recommendations, you can save them to your personal Items Dictionary. This builds your master list of reusable items that you can quickly add to any future trip. Adding items to your dictionary is the best way to speed up trip planning on subsequent trips.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Review Your AI Recommendations',
      description: 'Start with your list of AI-recommended items.',
      details: [
        'You should already have the AI recommendation list open',
        'The items are currently in "recommendation" status and not yet saved anywhere',
        'Take a moment to review and confirm which items you want to keep',
        'You can search, filter, or sort the list as needed'
      ]
    },
    {
      stepNumber: 2,
      title: 'Select Items for Your Dictionary',
      description: 'Choose which items you want to add to your personal Items Dictionary.',
      details: [
        'Look for checkboxes next to each item',
        'Check the items you want to add to your dictionary',
        'Uncheck items that you don\'t want to save',
        'You can select items individually or use "Select All" if available',
        'Focus on items you\'ll actually use and want to reuse on future trips'
      ]
    },
    {
      stepNumber: 3,
      title: 'Choose "Add to Items Dictionary" as the Target',
      description: 'Select the target destination for the items you\'ve chosen.',
      details: [
        'Look for a dropdown or radio button labeled "Target" or "Add to"',
        'Select "Items Dictionary" or "My Items" from the options',
        'Other options might include "Trip Own Items" or "Shared Items", but we\'re focusing on the dictionary here',
        'Confirm your selection is correct before proceeding'
      ],
      note: 'Your personal Items Dictionary is the master list you build over time. Items in your dictionary can be added to any trip in the future.'
    },
    {
      stepNumber: 4,
      title: 'Review Item Details Before Adding',
      description: 'Optionally review or edit items before they\'re added to your dictionary.',
      details: [
        'Most systems allow you to edit item names, descriptions, and categories',
        'Check that the item name is clear and will be easy to recognize later',
        'Verify the category is correct (Clothing, Toiletries, Electronics, etc.)',
        'Add any relevant notes or specifications (size, color, model, etc.)',
        'If you\'re happy with the defaults, you can skip this step'
      ]
    },
    {
      stepNumber: 5,
      title: 'Click "Add Items" or "Save to Dictionary"',
      description: 'Execute the action to add your selected items to your Items Dictionary.',
      details: [
        'Look for a button labeled "Add Items", "Add to Dictionary", or "Save"',
        'Make sure "Items Dictionary" is selected as your target',
        'Click the button to add all selected items at once',
        'The system will process the items and add them to your dictionary'
      ]
    },
    {
      stepNumber: 6,
      title: 'Confirm Items Were Added',
      description: 'Verify that the items were successfully added to your dictionary.',
      details: [
        'You should see a success message or notification',
        'The added items may disappear from the recommendation list or be marked as "added"',
        'Navigate to your Items module to see the new items in your dictionary',
        'You can search for the items by name to confirm they\'re there'
      ]
    },
    {
      stepNumber: 7,
      title: 'Continue Using Your Dictionary',
      description: 'Your newly added items are now part of your personal Items Dictionary.',
      details: [
        'You can add these items to any future trip without re-entering details',
        'The items will appear in your Items list with all the details you saved',
        'You can edit or delete items from your dictionary at any time',
        'Build your dictionary gradually as you discover items you like to pack'
      ]
    }
  ];

  benefits = [
    {
      title: 'Faster Future Planning',
      description: 'Once items are in your dictionary, you can quickly add them to any new trip.'
    },
    {
      title: 'Consistency',
      description: 'Having a master list ensures you pack the same high-quality items across all trips.'
    },
    {
      title: 'Less Work',
      description: 'You won\'t have to re-enter item details each time - they\'re ready to reuse.'
    },
    {
      title: 'Better Organization',
      description: 'A well-organized dictionary makes it easy to find and manage your packing items.'
    }
  ];

  tips = [
    'Only add items to your dictionary that you actually use and want to reuse on future trips',
    'Use clear, descriptive names so you recognize items months later when planning a new trip',
    'Categorize items correctly - proper categories make filtering and searching faster',
    'Add descriptions with useful details like size, color, or specific features',
    'Start small and build your dictionary gradually rather than trying to add everything at once',
    'Review your dictionary periodically and remove items you no longer pack',
    'Consider seasonal items - you might have winter and summer versions of the same item'
  ];

  commonIssues = [
    {
      problem: 'Items don\'t appear in my dictionary after adding them',
      solution: 'Refresh your browser or navigate to the Items module to see the updated list. Sometimes changes take a moment to appear.'
    },
    {
      problem: 'I added duplicate items accidentally',
      solution: 'You can edit the item details to combine them, or delete one duplicate from your dictionary. Your Items Dictionary is fully editable.'
    },
    {
      problem: 'I want to edit an item after adding it to my dictionary',
      solution: 'Navigate to your Items Dictionary and click on the item to edit. You can change the name, category, description, or any other details.'
    },
    {
      problem: 'I added an item I didn\'t want to keep',
      solution: 'Go to your Items Dictionary and delete the unwanted item. This won\'t affect any trips you\'ve already created - only the dictionary entry is removed.'
    },
    {
      problem: 'Some items have the same name - how do I keep them separate?',
      solution: 'Use descriptive names and add details in the description field. For example, "Black hiking boots size 10" vs "Brown casual shoes size 10".'
    }
  ];
}
