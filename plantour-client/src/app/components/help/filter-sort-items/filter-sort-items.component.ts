import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FilterOption {
  name: string;
  description: string;
  useCase: string;
}

interface SortOption {
  name: string;
  description: string;
  bestFor: string;
}

interface Scenario {
  situation: string;
  filters: string[];
  sorts: string[];
  result: string;
}

@Component({
  selector: 'app-filter-sort-items',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-sort-items.component.html',
  styleUrls: ['./filter-sort-items.component.scss']
})
export class FilterSortItemsComponent {
  mainHeading = 'Filter and Sort Items';
  intro = 'With a large items library, finding what you need quickly is essential. Filtering narrows down your list to show only specific items, while sorting arranges them in a particular order. Together, these tools help you navigate your items efficiently and build packing lists faster.';

  filterOptions: FilterOption[] = [
    {
      name: 'By Category',
      description: 'Show only items from selected categories (e.g., only Clothing, or only Electronics).',
      useCase: 'When you want to focus on packing one type of item at a time or review specific categories.'
    },
    {
      name: 'By Search Term',
      description: 'Find items whose names contain specific keywords (e.g., search for "rain" to see rain jacket, rain cover, etc.).',
      useCase: 'When you know part of the item name but don\'t want to scroll through the entire list.'
    },
    {
      name: 'By Quantity',
      description: 'Filter items based on their default quantity (e.g., items with quantity > 1).',
      useCase: 'To identify items you typically pack multiples of, or items with no quantity set.'
    },
    {
      name: 'By Usage/Frequency',
      description: 'Some systems track how often items are used and let you filter by most/least used.',
      useCase: 'Find your go-to items quickly, or identify items you never use and might want to delete.'
    },
    {
      name: 'By Trip Type',
      description: 'Filter items associated with specific trip types (business, leisure, adventure, etc.).',
      useCase: 'When planning a specific type of trip and you want to see relevant items only.'
    },
    {
      name: 'By Custom Tags',
      description: 'If your system supports tags (e.g., "essential", "optional", "seasonal"), filter by these tags.',
      useCase: 'Quickly find all essential items, or all seasonal items, without browsing manually.'
    },
    {
      name: 'By Status',
      description: 'Filter by item status such as "active", "archived", or "needs updating".',
      useCase: 'Manage your library by reviewing archived items or items flagged for updates.'
    }
  ];

  sortOptions: SortOption[] = [
    {
      name: 'Alphabetically (A-Z)',
      description: 'Sort items by name from A to Z.',
      bestFor: 'Finding items quickly when you know the name, or creating organized printed lists.'
    },
    {
      name: 'Alphabetically (Z-A)',
      description: 'Sort items by name from Z to A.',
      bestFor: 'Less common, but useful if you need reverse alphabetical order.'
    },
    {
      name: 'By Category',
      description: 'Group items by their categories, then alphabetically within each category.',
      bestFor: 'Viewing items organized by type, making it easier to pack systematically.'
    },
    {
      name: 'By Date Added',
      description: 'Sort items by when they were created, newest or oldest first.',
      bestFor: 'Finding recently added items, or reviewing your oldest items for cleanup.'
    },
    {
      name: 'By Date Modified',
      description: 'Sort by when items were last edited.',
      bestFor: 'Identifying items you recently updated or items that haven\'t been reviewed in a long time.'
    },
    {
      name: 'By Usage Frequency',
      description: 'Sort by how often items have been used in trips.',
      bestFor: 'Prioritizing your most-used items, or identifying rarely-used items to archive or delete.'
    },
    {
      name: 'By Quantity',
      description: 'Sort items by their default quantity (high to low or low to high).',
      bestFor: 'Seeing which items you pack in bulk, or items with no quantity set that need updating.'
    },
    {
      name: 'Custom Order',
      description: 'Manually drag and drop items to arrange them in your preferred order.',
      bestFor: 'Creating a personalized packing sequence that matches your specific packing routine.'
    }
  ];

  combinedFiltersScenarios: Scenario[] = [
    {
      situation: 'Packing for a beach vacation',
      filters: ['Category: Swimwear, Beach Gear, Sun Protection', 'Tags: Summer'],
      sorts: ['By Category'],
      result: 'See all beach-related items organized by category, making it easy to add them all to your trip.'
    },
    {
      situation: 'Finding waterproof items for a rainy destination',
      filters: ['Search: "waterproof" or "rain"'],
      sorts: ['By Category'],
      result: 'All items with "waterproof" or "rain" in the name, grouped by category (rain jacket in Clothing, rain cover in Gear, etc.).'
    },
    {
      situation: 'Planning a business trip',
      filters: ['Category: Professional Attire, Documents, Electronics', 'Trip Type: Business'],
      sorts: ['By Usage Frequency'],
      result: 'Your most-used business items appear first, ensuring you don\'t forget the essentials.'
    },
    {
      situation: 'Reviewing items you never use',
      filters: ['Usage: Never or Rarely Used'],
      sorts: ['By Date Added (oldest first)'],
      result: 'See items you created long ago but never actually pack - candidates for deletion or archiving.'
    },
    {
      situation: 'Quickly adding your essentials to a new trip',
      filters: ['Tags: Essential'],
      sorts: ['By Category'],
      result: 'All essential items organized by category for systematic packing.'
    },
    {
      situation: 'Finding items that need quantity updates',
      filters: ['Quantity: 0 or not set'],
      sorts: ['Alphabetically'],
      result: 'All items missing quantity information, sorted for easy review and updating.'
    }
  ];

  howToFilter = [
    'Look for a search bar or filter icon (usually a funnel shape) at the top of your items list',
    'Click on the filter button to reveal filtering options',
    'Select one or more filters to apply (category, tags, search terms, etc.)',
    'Multiple filters usually work together (AND logic) - items must match all filters',
    'To clear filters, look for a "Clear All" or "Reset" button, or click the X on individual filters',
    'Some systems remember your last filters, others reset when you leave the page'
  ];

  howToSort = [
    'Look for a sort dropdown or sort icon (usually arrows pointing up and down)',
    'Click to reveal available sort options',
    'Select your preferred sort method',
    'Some systems allow reverse sorting (ascending/descending) - look for toggle arrows',
    'Sorting works with filters - you can filter first, then sort the filtered results',
    'Custom sorting (drag and drop) may require enabling a specific mode or view'
  ];

  tips = [
    'Start broad, then narrow: Begin with category filters, then add search terms if needed',
    'Combine search with category: Search within a specific category for faster results',
    'Use sort to prioritize: After filtering, sort by frequency to see most-used items first',
    'Save common filter combinations: If your system supports it, save frequent filter sets as presets',
    'Clear filters when done: Don\'t forget to reset filters, or you might wonder why items are "missing"',
    'Sort by date added after importing: Quickly review newly imported items',
    'Use alphabetical sort for printouts: Create organized paper packing lists',
    'Filter by "no category" to find uncategorized items that need organization'
  ];

  advancedFeatures = [
    {
      feature: 'Saved filter presets',
      description: 'Save commonly used filter combinations for one-click access (e.g., "Beach Essentials", "Winter Trips", "Business Travel").'
    },
    {
      feature: 'Multi-select categories',
      description: 'Select multiple categories at once to see items from several categories together (e.g., Clothing + Shoes + Accessories).'
    },
    {
      feature: 'Exclude filters',
      description: 'Show everything EXCEPT certain categories or tags (e.g., show all items except Winter items for a summer trip).'
    },
    {
      feature: 'Date range filters',
      description: 'Filter items added or modified within a specific date range (e.g., "items added in the last 30 days").'
    },
    {
      feature: 'Smart suggestions',
      description: 'Some systems suggest filters based on your current trip or past behavior (e.g., "Show items you used on similar trips").'
    },
    {
      feature: 'Bulk actions on filtered results',
      description: 'After filtering, perform actions on all filtered items at once (e.g., add all filtered items to a trip, or bulk delete).'
    }
  ];

  commonIssues = [
    {
      problem: 'Items seem to be missing',
      solution: 'Check if you have filters applied that are hiding items. Look for active filter indicators and clear all filters to see everything.'
    },
    {
      problem: 'Sort doesn\'t seem to work',
      solution: 'Sorting only arranges visible items. If you have filters active, you\'re only sorting the filtered results. Try clearing filters first.'
    },
    {
      problem: 'Can\'t find the filter/sort options',
      solution: 'Look for a funnel icon (filter), magnifying glass (search), or up/down arrows (sort) near the top of your items list. On mobile, these might be in a menu.'
    },
    {
      problem: 'Filters reset every time',
      solution: 'Some systems don\'t persist filters across sessions. This is normal behavior. Use saved presets if available, or check settings for "remember filters" option.'
    },
    {
      problem: 'Multiple categories selected but showing no items',
      solution: 'Check if your filter uses AND logic (items must be in ALL selected categories) vs OR logic (items in ANY selected category). Usually it\'s OR, but verify.'
    },
    {
      problem: 'Search finds too many irrelevant results',
      solution: 'Make your search terms more specific. Use quotes for exact phrases if supported. Combine search with category filters to narrow results.'
    }
  ];

  quickStartGuide = [
    {
      task: 'Find a specific item',
      steps: ['Use the search bar', 'Type part of the item name', 'Item appears in results instantly']
    },
    {
      task: 'View only one category',
      steps: ['Click the filter button', 'Select a single category', 'Only items in that category are shown']
    },
    {
      task: 'See your most-used items',
      steps: ['Clear all filters', 'Sort by "Usage Frequency" or "Most Used"', 'Top items are your go-to essentials']
    },
    {
      task: 'Organize by type',
      steps: ['Clear search and filters', 'Sort by "Category"', 'Items are grouped by their categories']
    },
    {
      task: 'Review recent additions',
      steps: ['Sort by "Date Added"', 'Select "Newest First"', 'Recently added items appear at the top']
    }
  ];
}
