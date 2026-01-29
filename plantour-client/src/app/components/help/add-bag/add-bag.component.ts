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

interface CommonBag {
  category: string;
  examples: string[];
}

interface Issue {
  problem: string;
  solution: string;
}

@Component({
  selector: 'app-add-bag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-bag.component.html',
  styleUrls: ['./add-bag.component.scss']
})
export class AddBagComponent {
  mainHeading = 'How to Add a Bag';
  intro = 'Adding bags to your Plantour trip is essential for organizing your packing. Once you create your bags, you can start assigning items to them and track what\'s packed where. This guide walks you through creating bags efficiently.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to Your Trip',
      description: 'From your dashboard, open the trip you want to add bags to.',
      details: [
        'Click on "Trips" in the main navigation',
        'Select the specific trip from your trips list',
        'Make sure you\'re viewing the trip details or packing section'
      ],
      note: 'You must have a trip created before you can add bags. Bags are always associated with a specific trip.'
    },
    {
      stepNumber: 2,
      title: 'Open the Bags Section',
      description: 'Navigate to the bags or packing area within your trip.',
      details: [
        'Look for a "Bags", "Packages", or "Luggage" tab or section',
        'You might see a list of existing bags (if any)',
        'Find the "Add Bag" or "New Bag" button (usually marked with a + icon)'
      ]
    },
    {
      stepNumber: 3,
      title: 'Click "Add Bag" or "New Bag"',
      description: 'Start the bag creation process by clicking the add button.',
      details: [
        'A form or dialog will appear',
        'This form will ask for bag details'
      ]
    },
    {
      stepNumber: 4,
      title: 'Enter Bag Name',
      description: 'Give your bag a clear, descriptive name that helps you identify it easily.',
      details: [
        'Use names like "Main Suitcase", "John\'s Backpack", or "Carry-on"',
        'Be specific if you have multiple similar bags ("Red Suitcase" vs "Blue Suitcase")',
        'Names must be unique within your trip'
      ],
      note: 'Good naming makes it much easier to find items later, especially on longer trips with many bags.'
    },
    {
      stepNumber: 5,
      title: 'Select the Owner/Traveler',
      description: 'Choose which traveler owns this bag.',
      details: [
        'Select from the list of travelers in your trip',
        'The owner is typically the person whose belongings are in the bag',
        'This helps with organization when traveling in groups'
      ]
    },
    {
      stepNumber: 6,
      title: 'Assign a Responsible Person (Optional)',
      description: 'If someone other than the owner will carry or be responsible for the bag, specify them here.',
      details: [
        'By default, the owner is responsible',
        'Useful for scenarios like parents carrying children\'s bags',
        'Or when one person handles all check-in luggage'
      ],
      note: 'This field is optional and defaults to the owner if not specified.'
    },
    {
      stepNumber: 7,
      title: 'Add Notes (Optional)',
      description: 'Include any additional information about the bag.',
      details: [
        'Examples: "Check-in only", "Keep with me", "Fragile items inside"',
        'Note special handling instructions',
        'Add color or physical descriptions for easy identification'
      ]
    },
    {
      stepNumber: 8,
      title: 'Save the Bag',
      description: 'Click "Save", "Create", or "Add" to create your new bag.',
      details: [
        'The bag will appear in your bags list',
        'It will initially be empty (no items packed yet)',
        'You can now start adding items to this bag'
      ],
      note: 'After creating the bag, you can edit its details or add items to it at any time.'
    }
  ];

  quickAddTips: QuickTip[] = [
    {
      tip: 'Create Bags Before Packing',
      description: 'Set up all your bags first, then assign items to them. This gives you a complete overview of your luggage structure.'
    },
    {
      tip: 'Use Consistent Naming',
      description: 'Develop a naming convention for your bags that works across trips. For example, always use "Main Suitcase", "Cabin Bag", etc.'
    },
    {
      tip: 'Think About Real Containers',
      description: 'Create a bag in Plantour for each physical container you\'ll actually use. Don\'t forget smaller bags like toiletries kits or tech pouches.'
    },
    {
      tip: 'Consider Accessibility',
      description: 'Name bags in a way that indicates how accessible they are during travel (e.g., "Check-in Suitcase" vs "Carry-on").'
    }
  ];

  commonBags: CommonBag[] = [
    {
      category: 'Main Luggage',
      examples: ['Main Suitcase', 'Large Suitcase', 'Check-in Luggage', 'Rolling Bag']
    },
    {
      category: 'Carry-On',
      examples: ['Cabin Bag', 'Backpack', 'Carry-on Suitcase', 'Personal Item']
    },
    {
      category: 'Specialty Bags',
      examples: ['Toiletries Kit', 'Tech Bag', 'Camera Bag', 'First Aid Kit']
    },
    {
      category: 'Personal Items',
      examples: ['Purse', 'Wallet', 'Day Bag', 'Hip Pack']
    },
    {
      category: 'Shared/Family',
      examples: ['Cooler', 'Kids Toys Bag', 'Snacks Bag', 'Family Suitcase']
    },
    {
      category: 'Activity-Specific',
      examples: ['Beach Bag', 'Hiking Pack', 'Sports Equipment', 'Ski Bag']
    }
  ];

  tips: string[] = [
    'Start with fewer bags and add more if needed. It\'s easier than managing too many bags.',
    'If you\'re unsure about ownership, assign bags to yourself initially and adjust later.',
    'Create bags that match your actual physical luggage - this makes packing day easier.',
    'For group trips, have each person create their own bags for clarity.',
    'Use notes to add identifying details like "Navy blue with red ribbon" for easy spotting at baggage claim.',
    'Consider creating a "Not Packed Yet" or "To Buy" virtual bag for items you still need to handle.'
  ];

  commonIssues: Issue[] = [
    {
      problem: 'I can\'t add a bag - the button is disabled',
      solution: 'Make sure you have at least one traveler added to your trip. Bags must be assigned to travelers.'
    },
    {
      problem: 'I get an error saying "Bag with the same name already exists"',
      solution: 'Each bag name must be unique within your trip. Try adding a number or description to make it unique (e.g., "Backpack 1" and "Backpack 2").'
    },
    {
      problem: 'I don\'t see the traveler I want in the owner list',
      solution: 'Go back to the trip settings and add that traveler to the trip first. Only travelers who are participants in the trip can own bags.'
    },
    {
      problem: 'I accidentally created a bag I don\'t need',
      solution: 'You can delete bags from the bags list. Look for a delete or trash icon next to the bag. If items are packed in it, you\'ll need to remove them first.'
    }
  ];
}
