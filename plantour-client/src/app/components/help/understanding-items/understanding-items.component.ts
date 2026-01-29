import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ContentSection {
  title: string;
  paragraphs: string[];
  list?: string[];
  subsections?: {
    title: string;
    paragraphs: string[];
    list?: string[];
  }[];
}

@Component({
  selector: 'app-understanding-items',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './understanding-items.component.html',
  styleUrls: ['./understanding-items.component.scss']
})
export class UnderstandingItemsComponent {
  mainHeading = 'Understanding Items in Plantour';
  intro = 'Items (also called "Things") are at the heart of Plantour\'s packing system. They represent everything you need to bring on your trips - from clothing and toiletries to documents and electronics. Understanding how items work will help you pack efficiently and never forget anything important.';

  sections: ContentSection[] = [
    {
      title: 'What Are Items?',
      paragraphs: [
        'In Plantour, "Items" (sometimes referred to as "Things") are individual objects or tasks you need to pack or prepare for a trip. Each item represents something physical you\'ll bring along or an action you need to take before departure.',
        'Items are stored in your personal Items module, creating a reusable library of things you commonly pack. Once you add an item, you can quickly add it to any trip without re-entering the details.'
      ],
      subsections: [
        {
          title: 'Key Characteristics',
          paragraphs: [],
          list: [
            'Each item has a name and optional description',
            'Items can be organized into categories (clothing, toiletries, electronics, etc.)',
            'You can specify quantity for each item',
            'Items can be assigned to specific travelers',
            'Items persist across trips - create once, use everywhere',
            'Track packing status (packed/unpacked) when assigned to trips'
          ]
        },
        {
          title: 'Examples of Items',
          paragraphs: [
            'Anything you might pack can be an item:'
          ],
          list: [
            'Clothing: T-shirts, pants, jacket, shoes, underwear',
            'Toiletries: Toothbrush, shampoo, sunscreen, medications',
            'Electronics: Phone charger, laptop, camera, headphones',
            'Documents: Passport, tickets, insurance cards, maps',
            'Accessories: Sunglasses, hat, backpack, water bottle',
            'Tasks: Book hotel, confirm flights, arrange pet care'
          ]
        }
      ]
    },
    {
      title: 'Items vs. Trip Items: Understanding the Difference',
      paragraphs: [
        'This distinction is important for efficient trip planning in Plantour:'
      ],
      subsections: [
        {
          title: 'Items (Master List)',
          paragraphs: [
            'Items in your Items module are your personal packing library - templates you can reuse across multiple trips.'
          ],
          list: [
            'Stored permanently in your Items module',
            'Available to add to any trip',
            'Define the basic information (name, category, description)',
            'Not associated with a specific trip until you add them',
            'Think of these as your "packing vocabulary"',
            'Maintain one master list of everything you might ever pack'
          ]
        },
        {
          title: 'Trip Items (Trip-Specific)',
          paragraphs: [
            'When you add an item from your master list to a specific trip, it becomes a "Trip Item" - a copy with trip-specific details.'
          ],
          list: [
            'Linked to a specific trip',
            'Can have trip-specific quantity and assignments',
            'Track packing status (packed/unpacked)',
            'Assign to specific travelers on the trip',
            'Place in specific bags',
            'Mark as shared between travelers'
          ]
        },
        {
          title: 'The Workflow',
          paragraphs: [
            'Example: You create "Hiking Boots" as an item in your master Items list. When planning a camping trip, you add "Hiking Boots" to that trip. Now it exists in two places:',
            '1. Your master Items list (unchanged, ready for future trips)',
            '2. Your camping trip as a Trip Item (with quantity 1, assigned to you, in your main bag, status: unpacked)',
            'Changes to the Trip Item don\'t affect your master item, so each trip can customize as needed.'
          ]
        }
      ]
    },
    {
      title: 'Item Categories',
      paragraphs: [
        'Categories help you organize items into logical groups, making it easier to review your packing list and ensure you haven\'t forgotten anything.'
      ],
      subsections: [
        {
          title: 'Common Categories',
          paragraphs: [],
          list: [
            'Clothing: All garments and footwear',
            'Toiletries: Personal hygiene and grooming items',
            'Electronics: Devices, chargers, and accessories',
            'Documents: Papers, IDs, tickets, and important files',
            'Medications: Prescriptions, first aid, vitamins',
            'Sports/Recreation: Equipment for activities',
            'Baby/Kids: Child-specific items if traveling with family',
            'Miscellaneous: Items that don\'t fit other categories'
          ]
        },
        {
          title: 'Why Categories Matter',
          paragraphs: [],
          list: [
            'Quickly scan your list by category to spot gaps',
            'Filter items by category when planning trips',
            'Organize packing by grouping similar items',
            'Generate category-based checklists',
            'Customize categories for your specific needs'
          ]
        }
      ]
    },
    {
      title: 'Item Quantities',
      paragraphs: [
        'You can specify how many of each item you need. This is especially useful for clothing or consumables.'
      ],
      subsections: [
        {
          title: 'Quantity Guidelines',
          paragraphs: [],
          list: [
            'Default is usually 1 for single items',
            'Specify exact numbers: "3 pairs of socks"',
            'Can be adjusted per trip (bring 1 jacket on weekend trip, 2 on long trip)',
            'Helpful for shared items: "2 phone chargers" (one per person)',
            'Track what\'s packed vs. total needed'
          ]
        }
      ]
    },
    {
      title: 'Target Mode and Items',
      paragraphs: [
        'When working in Target Mode (trip-focused view), you can see and manage items in the context of a specific trip.'
      ],
      subsections: [
        {
          title: 'How Target Mode Affects Items',
          paragraphs: [],
          list: [
            'Filter items to show only those relevant to the target trip',
            'Add items directly to the target trip',
            'See which items are already in the target trip',
            'Quick actions for trip-specific item management',
            'Ideal workflow when actively planning one trip'
          ]
        }
      ]
    },
    {
      title: 'Best Practices',
      paragraphs: [],
      list: [
        'Build your master Items list gradually: Add items as you think of them',
        'Use descriptive names: "Summer hiking boots" vs. just "boots"',
        'Assign categories: Makes filtering and organizing much easier',
        'Add notes for details: Sizes, colors, or special instructions',
        'Create template items: "Weekend toiletries kit" for quick packing',
        'Review after trips: Add items you forgot for next time',
        'Keep it current: Delete items you no longer use or need'
      ]
    },
    {
      title: 'Common Use Cases',
      paragraphs: [],
      list: [
        'Building a complete packing list from scratch',
        'Reusing items from previous trips',
        'Creating seasonal packing templates (summer, winter, etc.)',
        'Managing group packing (who brings what)',
        'Tracking specialty items for specific activities',
        'Ensuring nothing is forgotten with categorized checklists'
      ]
    }
  ];
}
