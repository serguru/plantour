import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CategorySection {
  title: string;
  content: string;
}

interface CategoryBenefit {
  benefit: string;
  description: string;
}

interface CategoryStrategy {
  strategy: string;
  description: string;
  examples: string[];
}

@Component({
  selector: 'app-using-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './using-categories.component.html',
  styleUrls: ['./using-categories.component.scss']
})
export class UsingCategoriesComponent {
  mainHeading = 'Using Item Categories';
  intro = 'Categories help you organize your items into logical groups, making it easier to find what you need and ensuring you don\'t forget anything when packing. A well-organized category system can transform your packing experience from chaotic to streamlined.';

  whatAreCategories: CategorySection[] = [
    {
      title: 'Definition',
      content: 'Categories are organizational groups that let you classify your items by type, purpose, or any system that makes sense to you. Think of them as labeled boxes where you store similar items together.'
    },
    {
      title: 'Purpose',
      content: 'They provide structure to your items library, making it easier to browse, search, and ensure complete packing. When you pack for a trip, you can work through categories systematically rather than scrolling through a long, unorganized list.'
    },
    {
      title: 'Flexibility',
      content: 'You can create as many or as few categories as you need. Some users prefer broad categories (Clothing, Toiletries, Electronics), while others like more granular organization (Summer Clothes, Winter Clothes, Accessories).'
    },
    {
      title: 'Customization',
      content: 'Categories are typically customizable. You can create, rename, reorder, and delete categories to match your personal packing style and travel preferences.'
    }
  ];

  benefits: CategoryBenefit[] = [
    {
      benefit: 'Faster item discovery',
      description: 'Finding specific items is much quicker when you know which category they belong to'
    },
    {
      benefit: 'Complete packing',
      description: 'Going through categories one by one helps ensure you don\'t forget anything important'
    },
    {
      benefit: 'Mental organization',
      description: 'Categories mirror how you think about packing, reducing cognitive load'
    },
    {
      benefit: 'Batch operations',
      description: 'Add or remove entire categories at once when building trip packing lists'
    },
    {
      benefit: 'Systematic packing',
      description: 'Pack your physical bags in the same order as your categories for consistency'
    },
    {
      benefit: 'Easy maintenance',
      description: 'Reviewing and updating items category by category is more manageable than tackling your entire library at once'
    }
  ];

  commonCategories = [
    {
      category: 'Clothing',
      examples: ['T-shirts', 'Pants', 'Underwear', 'Socks', 'Jackets', 'Shoes'],
      notes: 'Can be split into subcategories like "Summer Clothes" and "Winter Clothes"'
    },
    {
      category: 'Toiletries',
      examples: ['Toothbrush', 'Toothpaste', 'Shampoo', 'Deodorant', 'Sunscreen', 'Medications'],
      notes: 'Consider separating medications into their own category if you travel with many'
    },
    {
      category: 'Electronics',
      examples: ['Phone', 'Chargers', 'Laptop', 'Camera', 'Headphones', 'Power bank'],
      notes: 'Include cables and accessories to avoid forgetting them'
    },
    {
      category: 'Documents',
      examples: ['Passport', 'ID', 'Travel insurance', 'Tickets', 'Hotel confirmations', 'Credit cards'],
      notes: 'Critical category - review carefully before every trip'
    },
    {
      category: 'Travel Gear',
      examples: ['Backpack', 'Luggage locks', 'Travel pillow', 'Eye mask', 'Earplugs', 'Water bottle'],
      notes: 'Items that are specifically for traveling rather than everyday use'
    },
    {
      category: 'First Aid',
      examples: ['Band-aids', 'Pain relievers', 'Antiseptic', 'Allergy medication', 'Prescription meds'],
      notes: 'Keep this organized for quick access in emergencies'
    },
    {
      category: 'Entertainment',
      examples: ['Books', 'Magazines', 'Games', 'Kindle', 'Journal', 'Playing cards'],
      notes: 'Optional but valuable for long trips or downtime'
    },
    {
      category: 'Food & Snacks',
      examples: ['Protein bars', 'Trail mix', 'Tea bags', 'Instant coffee', 'Gum', 'Supplements'],
      notes: 'Especially useful for long flights or areas with limited food options'
    }
  ];

  strategies: CategoryStrategy[] = [
    {
      strategy: 'Keep it simple at first',
      description: 'Start with 5-8 broad categories. You can always refine and split them later as your needs become clearer.',
      examples: ['Clothing', 'Toiletries', 'Electronics', 'Documents', 'Miscellaneous']
    },
    {
      strategy: 'Match your packing style',
      description: 'Organize categories the way you actually pack. If you pack by outfit, create outfit-based categories. If you pack by function, use functional categories.',
      examples: ['By outfit: "Day Outfits", "Evening Wear", "Exercise Clothes"', 'By function: "Sun Protection", "Cold Weather", "Rain Gear"']
    },
    {
      strategy: 'Create trip-type categories',
      description: 'If you take different types of trips, consider categories specific to those trips.',
      examples: ['Beach Trips: "Swimwear", "Beach Gear"', 'Business Travel: "Professional Attire", "Presentation Materials"', 'Camping: "Camping Gear", "Cooking Equipment"']
    },
    {
      strategy: 'Use priority-based categories',
      description: 'Some users organize by importance rather than type.',
      examples: ['"Essentials" (can\'t travel without)', '"Important" (strongly prefer to have)', '"Nice to Have" (if there\'s room)']
    },
    {
      strategy: 'Seasonal organization',
      description: 'Separate items by season if you travel year-round to different climates.',
      examples: ['"Summer Items"', '"Winter Items"', '"All-Season Items"']
    },
    {
      strategy: 'Activity-based categories',
      description: 'Group items by the activities you do during travel.',
      examples: ['"Hiking", "Swimming", "Photography", "Work", "Fitness"']
    }
  ];

  categoryManagement = [
    {
      task: 'Creating categories',
      howTo: 'Look for a "Manage Categories" or "Settings" option in your Items section. Add new categories with clear, descriptive names.',
      tip: 'Use names that immediately make sense to you - you\'ll be seeing them often'
    },
    {
      task: 'Renaming categories',
      howTo: 'Edit category names if you find they\'re not clear or if your organizational system evolves.',
      tip: 'Don\'t be afraid to rename - better clarity now saves confusion later'
    },
    {
      task: 'Reordering categories',
      howTo: 'Arrange categories in the order you typically think about or pack them. Many systems allow drag-and-drop reordering.',
      tip: 'Put your most-used categories at the top for quick access'
    },
    {
      task: 'Deleting categories',
      howTo: 'Remove categories you no longer use. Items in deleted categories may move to "Uncategorized" or require reassignment.',
      tip: 'Before deleting, check how many items are in that category'
    },
    {
      task: 'Assigning items to categories',
      howTo: 'When creating or editing an item, select the appropriate category from a dropdown or picker.',
      tip: 'If an item fits multiple categories, choose the one you\'d most naturally look for it in'
    }
  ];

  bestPractices = [
    'Don\'t create too many categories - 8-12 is usually plenty for most travelers',
    'Use consistent naming - all plural (Shoes, Jackets) or all singular (Shoe, Jacket)',
    'Review your categories after a few trips and adjust based on actual usage',
    'Create a "Miscellaneous" or "Other" category for items that don\'t fit elsewhere',
    'Consider creating a "Pre-Trip" category for last-minute items you add right before leaving',
    'Group related items together even if they\'re different types (sunscreen with sunglasses in "Sun Protection")',
    'Use emojis in category names if your system supports it for visual distinction (👕 Clothing, 🔌 Electronics)',
    'Keep categories action-oriented if it helps ("Things to Wear", "Things to Charge")'
  ];

  commonMistakes = [
    {
      mistake: 'Too many granular categories',
      problem: 'Having 30+ ultra-specific categories makes browsing harder, not easier',
      solution: 'Consolidate similar categories. "Socks", "Underwear", "Shirts" can just be "Clothing"'
    },
    {
      mistake: 'Ambiguous category names',
      problem: 'Vague names like "Stuff" or "Things" don\'t help you find items',
      solution: 'Be specific and descriptive. What kind of stuff? Name it clearly.'
    },
    {
      mistake: 'Inconsistent categorization',
      problem: 'Similar items in different categories creates confusion',
      solution: 'Establish rules: all cables go in Electronics, all bottles go in Toiletries, etc.'
    },
    {
      mistake: 'Never reviewing or updating',
      problem: 'Categories created for one trip type don\'t work for others',
      solution: 'Reassess your category system periodically and adapt to your current travel patterns'
    },
    {
      mistake: 'Forgetting about filters',
      problem: 'Categories are only useful if you actually use them to filter and organize',
      solution: 'When packing for trips, filter by category to work through your list systematically'
    }
  ];
}
