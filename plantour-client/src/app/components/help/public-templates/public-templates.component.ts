import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PublicTemplateStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-public-templates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-templates.component.html',
  styleUrl: './public-templates.component.scss'
})
export class PublicTemplatesComponent {
  steps: PublicTemplateStep[] = [
    {
      number: 1,
      title: 'Access Public Templates',
      description: 'Visit the Public Templates page from the landing page or via the "Packing List Generator" link. No account required for browsing.',
      icon: 'pi pi-globe'
    },
    {
      number: 2,
      title: 'Choose Filter Type',
      description: 'Select a filter type from the dropdown: Search, Activity, Age Range, Temperature, or Category.',
      icon: 'pi pi-sliders-h'
    },
    {
      number: 3,
      title: 'Apply Filters',
      description: 'Use the selected filter to narrow down templates. For Search, type keywords; for others, select from dropdown options.',
      icon: 'pi pi-filter'
    },
    {
      number: 4,
      title: 'Browse Templates',
      description: 'Scroll through filtered template groups. Each shows the activity, temperature/age ranges, and item count.',
      icon: 'pi pi-eye'
    },
    {
      number: 5,
      title: 'View Template Details',
      description: 'Click a template card to see the complete list of items organized by categories.',
      icon: 'pi pi-info-circle'
    },
    {
      number: 6,
      title: 'Use Template Ideas',
      description: 'Note down items or create an account to import templates directly into your trips.',
      icon: 'pi pi-user-plus'
    }
  ];

  filterTypes = [
    {
      name: 'Search',
      icon: 'pi pi-search',
      description: 'Type keywords to search template names, item names, or activities',
      howToUse: 'Enter text in the search box - results update as you type',
      examples: ['beach', 'winter', 'camping', 'business trip']
    },
    {
      name: 'Activity',
      icon: 'pi pi-map',
      description: 'Filter by trip type or destination activity',
      howToUse: 'Select from dropdown list of available activities',
      examples: ['Beach Vacation', 'Hiking & Camping', 'Business Travel', 'Skiing', 'City Tour']
    },
    {
      name: 'Age Range',
      icon: 'pi pi-users',
      description: 'Find templates suitable for specific age groups',
      howToUse: 'Select from dropdown list of age ranges',
      examples: ['Infants (0-2 years)', 'Children (3-12)', 'Teens (13-17)', 'Adults (18+)', 'Seniors (65+)']
    },
    {
      name: 'Temperature',
      icon: 'pi pi-sun',
      description: 'Filter by expected weather and temperature conditions',
      howToUse: 'Select from dropdown list of temperature ranges',
      examples: ['Cold (< 0°C)', 'Cool (0-15°C)', 'Moderate (15-25°C)', 'Warm (25-35°C)', 'Hot (> 35°C)']
    },
    {
      name: 'Category',
      icon: 'pi pi-tag',
      description: 'Browse templates containing items from specific categories',
      howToUse: 'Select from dropdown list of item categories',
      examples: ['Clothing', 'Electronics', 'Toiletries', 'Sports Equipment', 'Documents']
    }
  ];

  templateInfo = [
    {
      title: 'Activity Type',
      icon: 'pi pi-flag',
      description: 'Shows the primary trip activity (e.g., Beach, Hiking, Business)'
    },
    {
      title: 'Temperature Range',
      icon: 'pi pi-sun',
      description: 'Indicates expected weather conditions with temperature range'
    },
    {
      title: 'Age Range',
      icon: 'pi pi-users',
      description: 'Suggests suitable age group for the template items'
    },
    {
      title: 'Item Count',
      icon: 'pi pi-shopping-bag',
      description: 'Total number of items in the template'
    },
    {
      title: 'Categories',
      icon: 'pi pi-th-large',
      description: 'Item categories included (Clothing, Electronics, etc.)'
    }
  ];

  tips = [
    'Public templates are view-only - create an account to import items into your trips',
    'Combine filters for precise results (e.g., "Beach" + "Hot" + "Adults")',
    'Templates are professionally curated for common travel scenarios',
    'Use the "Clear Filters" button to reset and start a new search',
    'Temperature and age information helps match templates to your specific trip'
  ];

  guestVsAuthenticated = [
    {
      feature: 'Browse Templates',
      guest: 'Yes - Full access',
      authenticated: 'Yes - Full access',
      icon: 'pi pi-eye'
    },
    {
      feature: 'Filter & Search',
      guest: 'Yes - All filters available',
      authenticated: 'Yes - All filters available',
      icon: 'pi pi-filter'
    },
    {
      feature: 'View Template Details',
      guest: 'Yes - View all items',
      authenticated: 'Yes - View all items',
      icon: 'pi pi-list'
    },
    {
      feature: 'Import to Trips',
      guest: 'No - Sign up required',
      authenticated: 'Yes - Direct import',
      icon: 'pi pi-download'
    },
    {
      feature: 'Create Templates',
      guest: 'No - Account required',
      authenticated: 'Yes - Via Item Templates',
      icon: 'pi pi-plus-circle'
    }
  ];

  bestPractices = [
    'Start with Activity filter to find templates matching your trip type',
    'Add Temperature filter to ensure items match expected weather',
    'Use Age Range to get age-appropriate item suggestions',
    'Search by keywords for quick access to specific template types',
    'Review complete item lists before deciding to import',
    'Create an account to save time by importing templates directly'
  ];
}
