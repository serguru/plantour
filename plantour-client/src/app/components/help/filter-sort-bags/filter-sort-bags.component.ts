import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FilterOption {
  name: string;
  description: string;
  examples?: string[];
}

interface SortOption {
  name: string;
  description: string;
  bestFor: string;
}

interface UseCaseScenario {
  scenario: string;
  filterAction: string;
  sortAction?: string;
}

interface Issue {
  problem: string;
  solution: string;
}

@Component({
  selector: 'app-filter-sort-bags',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-sort-bags.component.html',
  styleUrls: ['./filter-sort-bags.component.scss']
})
export class FilterSortBagsComponent {
  mainHeading = 'Filter and Sort Bags';
  intro = 'When you have many bags for a complex trip, finding specific ones can be challenging. Plantour\'s filter and sort features help you quickly locate bags, organize your view, and focus on what matters most at any given moment.';

  filterOptions: FilterOption[] = [
    {
      name: 'By Traveler/Owner',
      description: 'Show only bags belonging to a specific traveler.',
      examples: [
        'View all of John\'s bags',
        'See bags owned by children',
        'Check what luggage a specific person is responsible for'
      ]
    },
    {
      name: 'By Responsible Person',
      description: 'Display bags based on who\'s carrying or managing them.',
      examples: [
        'See all bags Mom is responsible for',
        'Check what Dad needs to carry',
        'View bags assigned to the trip leader'
      ]
    },
    {
      name: 'By Packing Status',
      description: 'Filter bags based on how complete their packing is.',
      examples: [
        'Show only empty bags',
        'Display bags that are fully packed',
        'Find partially packed bags that need attention'
      ]
    },
    {
      name: 'By Bag Type/Category',
      description: 'Group bags by their type or purpose (if supported).',
      examples: [
        'Show only checked luggage',
        'Display carry-on bags',
        'View personal items only'
      ]
    },
    {
      name: 'By Search Term',
      description: 'Find bags by typing part of their name.',
      examples: [
        'Type "backpack" to find all backpacks',
        'Search "red" to find the red suitcase',
        'Enter a traveler\'s name to find their bags'
      ]
    }
  ];

  sortOptions: SortOption[] = [
    {
      name: 'Alphabetical (A-Z)',
      description: 'Sort bags by name in alphabetical order.',
      bestFor: 'Quick lookups when you know the bag name'
    },
    {
      name: 'By Owner',
      description: 'Group bags by traveler, with each person\'s bags together.',
      bestFor: 'Managing group trips and assigning responsibilities'
    },
    {
      name: 'By Items Count',
      description: 'Order bags by how many items are packed in them.',
      bestFor: 'Identifying which bags need more attention or are overpacked'
    },
    {
      name: 'By Creation Date',
      description: 'Sort by when bags were added to the trip.',
      bestFor: 'Tracking what was added recently or finding your oldest bags'
    },
    {
      name: 'By Last Modified',
      description: 'Show most recently edited bags first.',
      bestFor: 'Continuing work on bags you were just working on'
    },
    {
      name: 'Custom Order',
      description: 'Manually drag and drop bags into your preferred sequence.',
      bestFor: 'Organizing bags by priority or physical location'
    }
  ];

  useCaseScenarios: UseCaseScenario[] = [
    {
      scenario: 'You need to check what\'s in all of Sarah\'s bags',
      filterAction: 'Filter by Owner: Sarah',
      sortAction: 'Sort by Name (A-Z) for easy navigation'
    },
    {
      scenario: 'Finding which bags are ready for check-in',
      filterAction: 'Filter by Packing Status: Fully Packed',
      sortAction: 'Sort by Items Count (highest first) to see fullest bags'
    },
    {
      scenario: 'You want to see all bags Dad is carrying',
      filterAction: 'Filter by Responsible Person: Dad'
    },
    {
      scenario: 'Locating your main suitcase quickly',
      filterAction: 'Search: "main suitcase" or "suitcase"'
    },
    {
      scenario: 'Organizing bags by who owns them for a family trip',
      filterAction: 'No filter (show all)',
      sortAction: 'Sort by Owner - this groups each person\'s bags together'
    },
    {
      scenario: 'Finding bags that still need packing attention',
      filterAction: 'Filter by Packing Status: Empty or Partially Packed',
      sortAction: 'Sort by Last Modified to see which you worked on recently'
    },
    {
      scenario: 'Preparing carry-on bags for flight',
      filterAction: 'Filter by Type: Carry-on (if available)',
      sortAction: 'Sort by Owner to ensure everyone has their carry-on ready'
    }
  ];

  howToFilter: { step: string; instruction: string }[] = [
    {
      step: '1',
      instruction: 'Navigate to your bags list in the trip you\'re working on.'
    },
    {
      step: '2',
      instruction: 'Look for a "Filter" button, icon (usually a funnel), or dropdown menu near the bags list.'
    },
    {
      step: '3',
      instruction: 'Click the filter control to open filter options.'
    },
    {
      step: '4',
      instruction: 'Select the filter criteria you want (by owner, status, etc.).'
    },
    {
      step: '5',
      instruction: 'Choose the specific value (e.g., select "John" if filtering by owner).'
    },
    {
      step: '6',
      instruction: 'Your bags list updates to show only matching bags.'
    },
    {
      step: '7',
      instruction: 'To clear filters, look for "Clear All" or "Reset Filters" button.'
    }
  ];

  howToSort: { step: string; instruction: string }[] = [
    {
      step: '1',
      instruction: 'Go to your bags list view.'
    },
    {
      step: '2',
      instruction: 'Find the "Sort" button, dropdown, or column header (if in table view).'
    },
    {
      step: '3',
      instruction: 'Click to open sort options.'
    },
    {
      step: '4',
      instruction: 'Select your preferred sorting method (alphabetical, by owner, etc.).'
    },
    {
      step: '5',
      instruction: 'If available, choose sort direction (ascending/descending).'
    },
    {
      step: '6',
      instruction: 'The bags list reorders immediately according to your selection.'
    }
  ];

  combinationTips: string[] = [
    'Combine filtering and sorting for powerful results. Example: Filter by "John" and sort by "Items Count" to see John\'s bags from fullest to emptiest.',
    'Use filters to narrow down, then sort to organize what remains.',
    'Save time by filtering out bags you don\'t need to see at the moment.',
    'When preparing for departure, filter by "Fully Packed" and sort by "Owner" to verify everyone\'s bags are ready.',
    'Use search filters for quick one-off lookups when you know exactly what you\'re looking for.'
  ];

  tips: string[] = [
    'Familiarize yourself with available filters early in your trip planning - it saves time later.',
    'If your system supports it, save commonly used filter combinations as presets.',
    'Clear filters when you\'re done with a specific task to avoid confusion later.',
    'Remember that filtering hides bags temporarily - they\'re not deleted, just out of view.',
    'Sort orders often persist until you change them, so set a default that works for your workflow.',
    'For large trips, filter by packing status regularly to track progress.',
    'Use alphabetical sorting when sharing screen with others - it\'s the most predictable.'
  ];

  commonIssues: Issue[] = [
    {
      problem: 'I can\'t find the filter options',
      solution: 'Look for a funnel icon, "Filter" button, or dropdown menu at the top of your bags list. On mobile, it might be in a menu (three dots or hamburger icon). Not all views support filtering - make sure you\'re in the main bags list view.'
    },
    {
      problem: 'My filter isn\'t showing any bags',
      solution: 'You may have selected criteria with no matches (e.g., filtering by a traveler who has no bags). Check your filter settings and try broadening them. Or clear all filters and start over.'
    },
    {
      problem: 'The sort order seems wrong',
      solution: 'Check if you\'re sorting ascending vs. descending - you might need to reverse it. Some sort options might use different criteria than expected (e.g., sorting by "last modified" vs "creation date").'
    },
    {
      problem: 'Filters aren\'t "sticking" between sessions',
      solution: 'Most systems reset filters when you leave and return to avoid confusion. This is intentional behavior. Set filters fresh each time you need them.'
    },
    {
      problem: 'I filtered but I think I\'m missing bags',
      solution: 'Clear all filters to see the complete list again. You may have accidentally applied multiple filters that are too restrictive.'
    }
  ];

  advancedNote = 'Advanced Tip: Some systems allow multiple simultaneous filters (e.g., filter by both owner AND packing status). Experiment with combining filters to create very specific views of your bags.';
}
