import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FilterOption {
  filter: string;
  description: string;
  values?: string[];
  example: string;
}

interface SortOption {
  sortBy: string;
  description: string;
  order: string;
  useCase: string;
}

interface UseCase {
  scenario: string;
  howTo: string;
  tips?: string[];
}

interface Combination {
  name: string;
  filters: string;
  sorts: string;
  result: string;
}

@Component({
  selector: 'app-filter-sort-trips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-sort-trips.component.html',
  styleUrls: ['./filter-sort-trips.component.scss']
})
export class FilterSortTripsComponent {
  mainHeading = 'Filter and Sort Trips';
  intro = 'As your trip collection grows, filtering and sorting becomes essential for finding what you need quickly. Whether you want to see only upcoming trips, review completed journeys, or organize by destination, these tools keep your trips list manageable and useful.';

  filterOptions: FilterOption[] = [
    {
      filter: 'By Status',
      description: 'View trips in specific stages of your travel lifecycle.',
      values: ['Planning', 'Active', 'Completed', 'Archived', 'Cancelled'],
      example: 'Filter to "Planning" to see only upcoming trips you\'re still preparing for.'
    },
    {
      filter: 'By Date Range',
      description: 'Show trips within a specific time period.',
      values: ['This Week', 'This Month', 'This Year', 'Custom Range'],
      example: 'Filter to "This Year" to review all trips planned or completed in the current year.'
    },
    {
      filter: 'By Destination',
      description: 'Find trips going to a specific place or region.',
      example: 'Filter by "Italy" to see all your Italian trips, past and planned.'
    },
    {
      filter: 'By Participant',
      description: 'Show trips where a specific person is traveling.',
      example: 'Filter by "Sarah" to see all trips where Sarah is a participant.'
    },
    {
      filter: 'By Start Date',
      description: 'Trips starting on or after a specific date.',
      example: 'Filter trips starting from July 2026 onwards.'
    },
    {
      filter: 'By End Date',
      description: 'Trips ending on or before a specific date.',
      example: 'Filter trips ending by December 2025.'
    },
    {
      filter: 'Show Only Current Trip',
      description: 'Display just the trip marked as your current focus.',
      example: 'Quickly access the trip you\'re actively working on or traveling for.'
    }
  ];

  sortOptions: SortOption[] = [
    {
      sortBy: 'Start Date',
      description: 'Order trips by departure date.',
      order: 'Ascending (earliest first) or Descending (latest first)',
      useCase: 'Default sort. See upcoming trips at the top (ascending) or recent trips first (descending).'
    },
    {
      sortBy: 'End Date',
      description: 'Order trips by return date.',
      order: 'Ascending or Descending',
      useCase: 'Useful for seeing which trips end soonest or reviewing recently completed trips.'
    },
    {
      sortBy: 'Trip Name',
      description: 'Alphabetical order by trip name.',
      order: 'A-Z or Z-A',
      useCase: 'Find a specific trip by name when you have many trips with similar dates.'
    },
    {
      sortBy: 'Date Created',
      description: 'Order by when the trip was added to Plantour.',
      order: 'Newest first or Oldest first',
      useCase: 'Review recently added trips or find the first trips you ever created.'
    },
    {
      sortBy: 'Status',
      description: 'Group trips by their current status.',
      order: 'Grouped by Planning, Active, Completed, etc.',
      useCase: 'See all Planning trips together, then Active, then Completed.'
    },
    {
      sortBy: 'Destination',
      description: 'Alphabetical order by destination.',
      order: 'A-Z or Z-A',
      useCase: 'Group trips by location to compare journeys to the same place.'
    }
  ];

  useCases: UseCase[] = [
    {
      scenario: 'Find Upcoming Trips',
      howTo: 'Filter by status "Planning" and sort by start date (ascending). Trips departing soonest appear first.',
      tips: [
        'This is your "what\'s next" view',
        'Helps prioritize which trips need preparation',
        'Combine with date range filter (next 30 days) for immediate focus'
      ]
    },
    {
      scenario: 'Review Past Adventures',
      howTo: 'Filter by status "Completed" and sort by end date (descending). Your most recent trips show first.',
      tips: [
        'Great for reminiscing or planning similar trips',
        'Use to find packing lists from previous journeys',
        'Combine with destination filter to find specific past trips'
      ]
    },
    {
      scenario: 'See Current Trip Only',
      howTo: 'Use the "Show Only Current Trip" filter. Your active, focused trip appears isolated.',
      tips: [
        'Eliminates distractions during travel',
        'Quickly access packing lists and trip details',
        'Switch current trip as needed for multi-trip scenarios'
      ]
    },
    {
      scenario: 'Compare Multiple Trips to Same Place',
      howTo: 'Filter by destination (e.g., "Paris") and sort by start date. See all Paris trips chronologically.',
      tips: [
        'Compare packing lists across similar trips',
        'Identify patterns or forgotten items',
        'Learn from past trips to improve future planning'
      ]
    },
    {
      scenario: 'Clean Up Old Trips',
      howTo: 'Filter by status "Completed", sort by end date (ascending). Oldest completed trips appear first for archiving.',
      tips: [
        'Archive trips you no longer need in active view',
        'Keep recent completed trips accessible',
        'Don\'t delete - archive instead for historical reference'
      ]
    },
    {
      scenario: 'See Trips with a Specific Person',
      howTo: 'Filter by participant name. Only trips where that person is included will show.',
      tips: [
        'Useful for family or group travel coordinators',
        'Review shared packing responsibilities',
        'Plan future trips based on past collaborations'
      ]
    }
  ];

  combinations: Combination[] = [
    {
      name: 'Next Month\'s Trips',
      filters: 'Status = Planning, Date Range = Next 30 days',
      sorts: 'Start Date (Ascending)',
      result: 'All upcoming trips in the next month, soonest first.'
    },
    {
      name: 'All European Trips',
      filters: 'Destination contains "Europe" or specific countries',
      sorts: 'Start Date (Descending)',
      result: 'European trips, most recent first. Great for reviewing past European adventures.'
    },
    {
      name: 'Family Trips This Year',
      filters: 'Participant = Family Member, Date Range = This Year',
      sorts: 'Start Date (Ascending)',
      result: 'All trips with family this year, chronologically ordered.'
    },
    {
      name: 'Completed Trips to Archive',
      filters: 'Status = Completed, End Date before 1 year ago',
      sorts: 'End Date (Ascending)',
      result: 'Old completed trips, oldest first. Ready to archive for cleanup.'
    }
  ];

  tips: string[] = [
    'Combine multiple filters for precise results. Example: Status = Planning AND Destination = Italy.',
    'Save common filter/sort combinations as favorites if your system allows.',
    'Clear filters regularly to see all trips - it\'s easy to forget filters are active.',
    'Use ascending date sorts for "what\'s coming up" and descending for "what just happened".',
    'Filter by participant to coordinate group trips and assign responsibilities.',
    'Sort by date created to find newly added trips or your very first trips.',
    'Use status filters to keep your focus: Planning for prep, Active for travel, Completed for review.',
    'When looking for a specific trip, filter by destination or name, then sort alphabetically.'
  ];

  howToUseFilters: string[] = [
    'Look for a "Filter" button, icon (usually a funnel), or filter panel in your trips list.',
    'Select the filter type (status, date, destination, participant).',
    'Choose the value you want to filter by (e.g., Status = Planning).',
    'Apply the filter. Your trips list updates to show only matching trips.',
    'Add more filters to narrow results further.',
    'Use "Clear Filters" or "Reset" to return to viewing all trips.'
  ];

  howToSort: string[] = [
    'Look for a "Sort" dropdown or column headers in your trips list.',
    'Click on the field you want to sort by (Start Date, Name, Status, etc.).',
    'Choose ascending (A-Z, oldest first) or descending (Z-A, newest first) order.',
    'The trips list reorders immediately.',
    'Click the same header again to reverse the sort order.',
    'Most systems remember your sort preference for future sessions.'
  ];
}
