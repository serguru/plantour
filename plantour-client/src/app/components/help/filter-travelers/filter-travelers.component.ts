import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FilterOption {
  title: string;
  description: string;
  examples: string[];
}

interface SortOption {
  title: string;
  description: string;
  useCase: string;
}

@Component({
  selector: 'app-filter-travelers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-travelers.component.html',
  styleUrls: ['./filter-travelers.component.scss']
})
export class FilterTravelersComponent {
  mainHeading = 'How to Filter and Sort Travelers';
  intro = 'As your list of travelers grows, finding specific people quickly becomes important. Plantour provides powerful filtering and sorting tools to help you organize and locate travelers efficiently. This guide will show you how to use these features to manage your travelers list effectively.';

  filterOptions: FilterOption[] = [
    {
      title: 'Search by Name',
      description: 'Quickly find travelers by typing their name in the search box.',
      examples: [
        'Type "John" to find all travelers with "John" in their name',
        'Search is usually case-insensitive',
        'Partial names work (e.g., "Smi" will find "Smith")',
        'Clear the search box to see all travelers again'
      ]
    },
    {
      title: 'Filter by Email Status',
      description: 'Show only travelers who have or don\'t have email addresses on file.',
      examples: [
        'Filter to "Has Email" to see travelers you can invite to trips',
        'Filter to "No Email" to identify travelers missing contact info',
        'Useful when preparing to send trip invitations'
      ]
    },
    {
      title: 'Filter by Phone Status',
      description: 'Display travelers based on whether they have phone numbers recorded.',
      examples: [
        'Find travelers with phone numbers for emergency contacts',
        'Identify travelers missing phone information',
        'Organize contact information updates'
      ]
    },
    {
      title: 'Filter by Role/Category',
      description: 'If you\'ve assigned roles to travelers (adult, child, etc.), filter by these categories.',
      examples: [
        'Show only adults for planning age-appropriate activities',
        'Filter children to plan family-friendly accommodations',
        'View specific groups for targeted trip planning'
      ]
    },
    {
      title: 'Filter by Trip Assignment',
      description: 'See which travelers are assigned to specific trips or find unassigned travelers.',
      examples: [
        'Show travelers assigned to "Summer Vacation 2026"',
        'Find travelers not yet assigned to any trips',
        'Identify frequent travel companions'
      ]
    }
  ];

  sortOptions: SortOption[] = [
    {
      title: 'Sort by Name (A-Z)',
      description: 'Alphabetically sort travelers by first name or last name.',
      useCase: 'Best for quickly finding someone when you know their name. Default sorting option in most systems.'
    },
    {
      title: 'Sort by Name (Z-A)',
      description: 'Reverse alphabetical sorting.',
      useCase: 'Useful if you\'re looking for travelers at the end of the alphabet or want a different view of your list.'
    },
    {
      title: 'Sort by Date Added',
      description: 'Show travelers in the order they were added to your list.',
      useCase: 'Find recently added travelers or see who you\'ve been working with lately. Newest first or oldest first.'
    },
    {
      title: 'Sort by Most Recently Used',
      description: 'Display travelers based on when they were last assigned to a trip or updated.',
      useCase: 'Quickly access your active travel companions. Great for ongoing trip planning.'
    },
    {
      title: 'Sort by Number of Trips',
      description: 'Order travelers by how many trips they\'re assigned to.',
      useCase: 'Identify frequent travel companions or find travelers who might be overcommitted.'
    }
  ];

  howToUse = [
    {
      step: 1,
      title: 'Access the Travelers Module',
      description: 'Navigate to the Travelers section from your main dashboard.'
    },
    {
      step: 2,
      title: 'Locate the Filter/Sort Controls',
      description: 'Look for filter icons, dropdown menus, or a toolbar at the top of the travelers list. Common locations include above the list or in a sidebar.'
    },
    {
      step: 3,
      title: 'Choose Your Filter or Sort Option',
      description: 'Click on the desired filter or sorting option. You can often apply multiple filters simultaneously.'
    },
    {
      step: 4,
      title: 'View Filtered/Sorted Results',
      description: 'The travelers list updates immediately to show only matching results or re-ordered entries.'
    },
    {
      step: 5,
      title: 'Clear Filters When Done',
      description: 'Use the "Clear Filters" or "Reset" button to return to the full, unfiltered list.'
    }
  ];

  tips = [
    'Combine filters: Use multiple filters together for precise results (e.g., "Has Email" + "Assigned to Trip X").',
    'Save time with search: The search box is often the fastest way to find a specific person.',
    'Use sorting for organization: Sort by name when browsing, by date added when reviewing recent changes.',
    'Clear filters regularly: Don\'t forget to clear filters when switching tasks to avoid confusion.',
    'Mobile-friendly: Most filter and sort features work on mobile devices with touch-friendly controls.',
    'Remember filter state: Some systems remember your last filter settings when you return to the page.'
  ];

  commonScenarios = [
    {
      scenario: 'Preparing to send trip invitations',
      solution: 'Filter to show only travelers with email addresses, then sort by name to review the list systematically.'
    },
    {
      scenario: 'Finding a specific person quickly',
      solution: 'Use the search box and type their name - much faster than scrolling through a long list.'
    },
    {
      scenario: 'Reviewing recently added travelers',
      solution: 'Sort by "Date Added" with newest first to see who you\'ve added most recently.'
    },
    {
      scenario: 'Planning a family trip',
      solution: 'Filter by role/category to show only family members or a specific group you travel with regularly.'
    },
    {
      scenario: 'Identifying missing information',
      solution: 'Filter to "No Email" or "No Phone" to find travelers who need updated contact details.'
    },
    {
      scenario: 'Finding frequent travel companions',
      solution: 'Sort by "Number of Trips" to see who you travel with most often.'
    }
  ];

  advancedFeatures = [
    'Multi-select filters: Apply several filters at once to narrow down results precisely.',
    'Custom filter combinations: Create and save your own filter presets for repeated use.',
    'Quick filter shortcuts: Some systems offer one-click filters for common scenarios.',
    'Filter by custom tags: If you\'ve added tags or labels to travelers, filter by these custom categories.',
    'Export filtered lists: Download or print only the filtered results for offline reference.'
  ];
}
