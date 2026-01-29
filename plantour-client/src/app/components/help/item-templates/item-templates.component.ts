import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ItemTemplateStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-item-templates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-templates.component.html',
  styleUrl: './item-templates.component.scss'
})
export class ItemTemplatesComponent {
  steps: ItemTemplateStep[] = [
    {
      number: 1,
      title: 'Navigate to Templates',
      description: 'Click on "Templates" in the main navigation menu to access your Item Templates.',
      icon: 'pi pi-compass'
    },
    {
      number: 2,
      title: 'Select Your Target',
      description: 'Choose where to add items: Trip Items (for specific trip), Shared Items (for trip participants), or Items Dictionary (your personal catalog).',
      icon: 'pi pi-map-marker'
    },
    {
      number: 3,
      title: 'Apply Filters (Optional)',
      description: 'Use filters to find the right template: Temperature Range, Age Range, Activity, Category, or search by name.',
      icon: 'pi pi-filter'
    },
    {
      number: 4,
      title: 'Select Items',
      description: 'Click individual items to toggle selection, or use "Add All" to select all visible items from the template.',
      icon: 'pi pi-check-square'
    },
    {
      number: 5,
      title: 'Add to Target',
      description: 'Click the "Add" button in the actions bar to import selected items to your chosen destination.',
      icon: 'pi pi-plus-circle'
    },
    {
      number: 6,
      title: 'Customize Imported Items',
      description: 'Navigate to your target location (Trip Items/Shared Items/Items Dictionary) to customize the imported items.',
      icon: 'pi pi-pencil'
    }
  ];

  filteringOptions = [
    {
      filter: 'Temperature Range',
      icon: 'pi pi-sun',
      description: 'Find templates for specific weather conditions',
      examples: ['Cold (< 0°C)', 'Cool (0-15°C)', 'Warm (15-25°C)', 'Hot (> 25°C)']
    },
    {
      filter: 'Age Range',
      icon: 'pi pi-users',
      description: 'Filter by traveler age groups',
      examples: ['Infants (0-2)', 'Children (3-12)', 'Teens (13-17)', 'Adults (18+)']
    },
    {
      filter: 'Activity',
      icon: 'pi pi-flag',
      description: 'Select templates by activity type',
      examples: ['Beach', 'Hiking', 'Business', 'Camping', 'Skiing']
    },
    {
      filter: 'Category',
      icon: 'pi pi-tag',
      description: 'Browse by item category',
      examples: ['Clothing', 'Electronics', 'Toiletries', 'Documents', 'Sports Gear']
    },
    {
      filter: 'Template Name',
      icon: 'pi pi-search',
      description: 'Search templates by name',
      examples: ['Weekend Beach Trip', 'Winter Sports', 'Business Conference']
    }
  ];

  targetDestinations = [
    {
      name: 'Trip Items (Own)',
      icon: 'pi pi-shopping-bag',
      description: 'Add items to your personal items in the current trip',
      whenToUse: 'For items you\'ll pack yourself in the trip'
    },
    {
      name: 'Shared Items',
      icon: 'pi pi-share-alt',
      description: 'Add items to trip shared items that can be assigned to participants',
      whenToUse: 'For items that need to be distributed among trip participants (Admin only)'
    },
    {
      name: 'Items Dictionary',
      icon: 'pi pi-book',
      description: 'Add items to your personal catalog for reuse across trips',
      whenToUse: 'For items you want to save and reuse in future trips'
    }
  ];

  tips = [
    'Use multiple filters together to narrow down results (e.g., "Beach" + "Hot" + "Adults")',
    'The "Lower Text" toggle shows/hides additional item details',
    'Items imported from templates can be fully customized after adding',
    'Remove items from your target by clicking them again (they become unselected)',
    'Templates show which items are already in your target destination'
  ];

  bestPractices = [
    'Start with broad filters and narrow down as needed',
    'Review all template items before bulk adding',
    'Customize imported items to match your specific trip needs',
    'Create your own templates by organizing items in your dictionary',
    'Use Temperature and Age filters for trip-specific accuracy'
  ];
}
