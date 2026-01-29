import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TemplateFeature {
  icon: string;
  title: string;
  description: string;
}

interface TemplateBenefit {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-understanding-templates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './understanding-templates.component.html',
  styleUrl: './understanding-templates.component.scss'
})
export class UnderstandingTemplatesComponent {
  features: TemplateFeature[] = [
    {
      icon: 'pi pi-clone',
      title: 'Pre-Built Item Lists',
      description: 'Ready-made collections of items for various trips and activities'
    },
    {
      icon: 'pi pi-filter',
      title: 'Smart Filtering',
      description: 'Find templates by temperature range, age, activity, and categories'
    },
    {
      icon: 'pi pi-send',
      title: 'Quick Import',
      description: 'Add items from templates to your Trip Items or Items Dictionary'
    },
    {
      icon: 'pi pi-users',
      title: 'Two Template Types',
      description: 'Personal templates you manage and public templates curated for common scenarios'
    }
  ];

  benefits: TemplateBenefit[] = [
    {
      icon: 'pi pi-clock',
      title: 'Save Time',
      description: 'Skip creating item lists from scratch - start with proven templates'
    },
    {
      icon: 'pi pi-check-circle',
      title: 'Complete Coverage',
      description: 'Comprehensive item lists ensure you don\'t forget essential gear'
    },
    {
      icon: 'pi pi-refresh',
      title: 'Reusable',
      description: 'Import template items to multiple trips without recreating them'
    }
  ];

  templateTypes = [
    {
      type: 'Item Templates',
      icon: 'pi pi-user',
      description: 'Personal templates you create and manage',
      capabilities: [
        'Create your own custom templates',
        'Add items from your templates to any trip',
        'Target trip items, shared items, or your dictionary',
        'Filter by temperature, age, activity, category'
      ]
    },
    {
      type: 'Public Templates',
      icon: 'pi pi-globe',
      description: 'Pre-made templates curated for common scenarios',
      capabilities: [
        'Browse professionally curated packing lists',
        'View-only access (for non-authenticated users)',
        'Filter by destination type, weather, age group',
        'Get inspiration for your own trips'
      ]
    }
  ];

  howItWorks = [
    'Choose between Item Templates (yours) or Public Templates (curated)',
    'Use filters to find the right template: temperature, age, activity, category',
    'Select your target: Trip Items, Shared Items, or Items Dictionary',
    'Click items to add them individually, or use bulk actions',
    'Items are imported with names and categories, ready to customize'
  ];

  keyPoints = [
    'Templates help you start quickly with proven item lists',
    'Filter by temperature range, age range, activities, and categories',
    'Add items to your current trip or your personal Items Dictionary',
    'Item Templates are yours; Public Templates are curated and read-only (for guests)',
    'Imported items can be customized after adding to your trip or dictionary'
  ];
}
