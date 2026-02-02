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
  selector: 'app-add-ai-items-to-trip-shared',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-ai-items-to-trip-shared.component.html',
  styleUrls: ['./add-ai-items-to-trip-shared.component.scss']
})
export class AddAiItemsToTripSharedComponent {
  mainHeading = 'How to Add AI-Recommended Items to Your Trip Shared Items';
  intro = 'Trip Shared Items are items that belong to the group and are shared among trip participants. After getting AI recommendations, you can add them directly to your trip\'s shared items list. This is a quick way to create a group packing inventory that everyone can see and collaborate on.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Make Sure You Have a Trip Selected',
      description: 'Ensure that your current trip is selected before adding shared items.',
      details: [
        'Check the top of your screen - it should show "Current Trip: [Trip Name]"',
        'If no trip is selected, go to the Trips module and select your desired trip',
        'You must have a trip selected to add shared items',
        'Shared items belong to this specific trip, not to your personal dictionary'
      ]
    },
    {
      stepNumber: 2,
      title: 'Verify You Have Permission to Add Shared Items',
      description: 'Check that you have the authorization to create or add shared items in your trip.',
      details: [
        'Trip admins can always add shared items',
        'Some trips allow all participants to add shared items - check your trip permissions',
        'If you\'re a participant but not admin, you may not be able to create shared items',
        'Contact the trip admin if you need permission'
      ]
    },
    {
      stepNumber: 3,
      title: 'Navigate to AI Recommendations',
      description: 'Open the AI recommendation feature from your navigation.',
      details: [
        'Look for "AI Templates", "AI Recommendations", or similar option',
        'You can usually access this from the Shared Items module or main navigation',
        'Some systems show it under the current trip\'s tools',
        'The AI recommendations interface should open'
      ]
    },
    {
      stepNumber: 4,
      title: 'Generate Your AI Recommendations',
      description: 'Submit your trip description to get AI recommendations.',
      details: [
        'Describe your trip in the prompt field (destination, activities, duration, climate)',
        'Focus on group needs: shared supplies, communal items, group equipment',
        'Click "Generate" or "Get Recommendations"',
        'The AI will create a personalized items list for your trip'
      ]
    },
    {
      stepNumber: 5,
      title: 'Select Items for Shared Use',
      description: 'Choose which recommended items should be shared among your group.',
      details: [
        'Review the AI-generated list of recommended items',
        'Think about which items the group will use collectively',
        'Examples: sunscreen, coolers, tents, cooking equipment, group snacks',
        'Check boxes next to items that are truly group items, not individual items',
        'Uncheck items that should be personal (clothing, toiletries, medications)'
      ]
    },
    {
      stepNumber: 6,
      title: 'Choose "Trip Shared Items" as the Target',
      description: 'Select the correct destination for shared items in your trip.',
      details: [
        'Look for a target selector or dropdown',
        'The options should include: Items Dictionary, Trip Own Items, and Shared Items',
        'Select "Trip Shared Items", "Shared Items", or "Group Items"',
        'This ensures items go to the shared list, not to personal items or the dictionary',
        'Confirm your selection is correct'
      ],
      note: 'Trip Shared Items are owned by the group and visible to all trip participants. All travelers can see and manage these items.'
    },
    {
      stepNumber: 7,
      title: 'Click "Add Items" or "Add to Shared Items"',
      description: 'Execute the action to add your selected items to your trip\'s shared list.',
      details: [
        'Look for a button like "Add Items", "Add to Trip", or "Create Shared Items"',
        'Verify that "Trip Shared Items" is selected as the target',
        'Click the button to add all selected items at once',
        'The system will process and add the items to your trip\'s shared inventory'
      ]
    },
    {
      stepNumber: 8,
      title: 'Verify Items Were Added to Shared List',
      description: 'Confirm that the items successfully appear in your trip\'s shared items list.',
      details: [
        'You should see a success notification or message',
        'The items should now appear in your trip\'s Shared Items section',
        'Navigate to Shared Items to view and manage the group inventory',
        'Other participants should see these items in their view of the trip'
      ]
    },
    {
      stepNumber: 9,
      title: 'Collaborate with Other Travelers',
      description: 'Your shared items are now visible and editable by all trip participants.',
      details: [
        'Other travelers can see what shared items are in the trip',
        'They can mark items as assigned or as their responsibility',
        'You can edit quantities or other details together',
        'Use comments to discuss shared items and logistics',
        'Assign specific shared items to specific people for carrying responsibility'
      ]
    }
  ];

  benefits = [
    {
      title: 'Group Transparency',
      description: 'All participants see the same shared items list. Everyone knows what group equipment is being brought.'
    },
    {
      title: 'Avoid Duplicates',
      description: 'By tracking shared items, you prevent multiple people from bringing the same communal supplies.'
    },
    {
      title: 'Fair Distribution',
      description: 'Shared items can be assigned to different people, distributing the weight and responsibility fairly.'
    },
    {
      title: 'Easy Collaboration',
      description: 'Everyone can contribute to managing the group\'s shared items and equipment.'
    }
  ];

  tips = [
    'Focus shared items on things the GROUP will use together: shelter, cooking equipment, first aid, group snacks, entertainment',
    'Individual items like clothing, toiletries, and medications should stay as personal items, not shared',
    'Assign each shared item to someone responsible for bringing it to ensure nothing gets forgotten',
    'Use shared items to include expensive or specialized equipment: tent, camping stove, high-end camera',
    'Keep shared items lightweight and distribute them fairly among travelers',
    'Communicate with your group about what shared items are needed before adding them',
    'After the trip, review shared items to see what was actually useful for future trip planning'
  ];

  commonIssues = [
    {
      problem: 'Items were added to my trip own items instead of shared items',
      solution: 'Make sure you selected "Trip Shared Items" as your target before clicking add. You can move items between own and shared later, or delete and re-add them to the correct location.'
    },
    {
      problem: 'Other travelers can\'t see the shared items I added',
      solution: 'Make sure the items are in "Shared Items" not "Trip Own Items". Refresh the page. If still not visible, contact the trip admin.'
    },
    {
      problem: 'I don\'t have permission to add shared items',
      solution: 'You may not have the right role. Ask your trip admin to either grant you permission or add the items for you.'
    },
    {
      problem: 'I want to add the same shared items to future trips',
      solution: 'After creating shared items, take note of them. For future trips, use the AI recommendations again with a similar description, or manually add the same items.'
    },
    {
      problem: 'Multiple people added the same shared item',
      solution: 'Review the shared items list and delete duplicates. Coordinate with your travel group to assign responsibilities for shared items.'
    }
  ];

  goodSharedItems = [
    {
      category: 'Shelter & Sleep',
      examples: ['Tent', 'Sleeping bag', 'Camping pad', 'Air mattress', 'Tarp', 'Rope']
    },
    {
      category: 'Cooking & Food',
      examples: ['Camp stove', 'Cooler', 'Cooking utensils', 'Plates/Bowls', 'Group snacks', 'Communal beverages']
    },
    {
      category: 'Safety & Health',
      examples: ['First aid kit', 'Map/GPS', 'Flashlights', 'Whistle', 'Sunscreen (group size)', 'Insect repellent']
    },
    {
      category: 'Entertainment',
      examples: ['Games', 'Camera', 'Portable speaker', 'Books/E-reader', 'Sports equipment']
    },
    {
      category: 'Group Tools',
      examples: ['Multi-tool', 'Knife', 'Rope', 'Tape', 'Batteries', 'Repair kit']
    }
  ];
}
