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
  selector: 'app-add-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent {
  mainHeading = 'How to Add an Item';
  intro = 'Adding items to your Plantour library is the foundation of efficient packing. Once you build your master list of items, you can quickly add them to any trip. This guide walks you through creating items that you\'ll use again and again.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to the Items Module',
      description: 'From your dashboard or main navigation, click on "Items" or "Things" to open the Items module.',
      details: [
        'Look for the Items icon in the sidebar (usually a shopping bag or list icon)',
        'You\'ll see your existing items library',
        'Use search or filters if you have many items already'
      ]
    },
    {
      stepNumber: 2,
      title: 'Click the "Add Item" Button',
      description: 'Locate and click the button to create a new item.',
      details: [
        'Usually found in the top-right corner labeled "Add Item" or "New Item"',
        'May be represented by a "+" icon',
        'Opens a form to enter item details'
      ]
    },
    {
      stepNumber: 3,
      title: 'Enter the Item Name',
      description: 'Give your item a clear, descriptive name that you\'ll recognize later.',
      details: [
        'Be specific: "Winter jacket" is better than just "Jacket"',
        'Include relevant details: "Black hiking boots" vs. "Boots"',
        'Use terms you\'ll remember when packing',
        'This is the only required field'
      ],
      note: 'The item name is the only required field. All other information is optional but helpful.'
    },
    {
      stepNumber: 4,
      title: 'Select a Category',
      description: 'Choose the category that best fits this item to help with organization.',
      details: [
        'Common categories: Clothing, Toiletries, Electronics, Documents',
        'Categories help you filter and sort items later',
        'If no category fits, choose "Miscellaneous" or create a custom one',
        'You can change the category later if needed'
      ]
    },
    {
      stepNumber: 5,
      title: 'Add Optional Details',
      description: 'Fill in additional information to make the item more useful.',
      details: [
        'Description: Add notes like size, color, or specific requirements',
        'Default quantity: How many you typically need (can be adjusted per trip)',
        'Notes: Special reminders or instructions',
        'Tags: Custom labels for advanced organization (if available)'
      ],
      note: 'The more detail you add now, the easier it is to reuse this item on future trips.'
    },
    {
      stepNumber: 6,
      title: 'Save the Item',
      description: 'Click "Save", "Create", or "Add Item" to add it to your library.',
      details: [
        'The item appears in your Items list immediately',
        'You\'ll see a confirmation message',
        'The item is now available to add to any trip'
      ]
    },
    {
      stepNumber: 7,
      title: 'Verify and Continue',
      description: 'Check that the item was created correctly.',
      details: [
        'Find it in your Items list',
        'Edit if you need to make changes',
        'Add more items to build your library',
        'Use search or filter to find items quickly'
      ]
    }
  ];

  quickAddTips = [
    {
      tip: 'Batch Adding',
      description: 'Creating several items at once? Keep the form open and add multiple items in sequence without returning to the list.'
    },
    {
      tip: 'Start Simple',
      description: 'Don\'t worry about adding every possible item at once. Build your library gradually as you plan trips and think of things you need.'
    },
    {
      tip: 'Copy from Trips',
      description: 'After completing a trip, review what you actually used and add those items to your master list for next time.'
    },
    {
      tip: 'Seasonal Lists',
      description: 'Create season-specific items like "Winter coat" and "Summer sandals" to make seasonal trip planning easier.'
    }
  ];

  commonItems = [
    {
      category: 'Clothing',
      examples: ['T-shirts', 'Jeans', 'Underwear', 'Socks', 'Jacket', 'Shoes', 'Pajamas', 'Swimsuit']
    },
    {
      category: 'Toiletries',
      examples: ['Toothbrush', 'Toothpaste', 'Shampoo', 'Soap', 'Deodorant', 'Sunscreen', 'Razor', 'Medications']
    },
    {
      category: 'Electronics',
      examples: ['Phone charger', 'Laptop', 'Camera', 'Headphones', 'Power bank', 'Adapters', 'E-reader']
    },
    {
      category: 'Documents',
      examples: ['Passport', 'ID', 'Tickets', 'Insurance cards', 'Hotel confirmations', 'Maps', 'Itinerary']
    },
    {
      category: 'Accessories',
      examples: ['Sunglasses', 'Hat', 'Watch', 'Backpack', 'Water bottle', 'Umbrella', 'Wallet']
    }
  ];

  tips = [
    'Use descriptive names: Include color, type, or size if you have multiple similar items',
    'Start with essentials: Focus on items you always pack before getting creative',
    'Think categories: Proper categorization makes finding items much easier later',
    'Add descriptions: Note sizes, preferences, or special instructions in the description field',
    'Don\'t duplicate: Search your existing items before adding to avoid duplicates',
    'Review and refine: After trips, update or add items based on what you actually needed'
  ];

  commonIssues = [
    {
      problem: 'Duplicate items',
      solution: 'Use the search feature before adding to check if the item already exists. If you find a duplicate, edit the existing item instead.'
    },
    {
      problem: 'Can\'t find the right category',
      solution: 'Use "Miscellaneous" for now, or create a custom category if your system allows it. You can always recategorize later.'
    },
    {
      problem: 'Form won\'t save',
      solution: 'Make sure the item name is filled in (it\'s required). Check for error messages near specific fields and correct any issues.'
    },
    {
      problem: 'Not sure what to add',
      solution: 'Start with the basics you always pack. Check our "Common Items" list above for inspiration.'
    }
  ];
}
