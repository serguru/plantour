import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-key-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './key-features.component.html',
  styleUrls: ['./key-features.component.scss']
})
export class KeyFeaturesComponent {
  keyFeaturesContent = {
    mainHeading: 'Key Features',
    intro: 'Plantour combines trip planning, packing lists, and collaboration in one place. Here are the core features that make planning fast and organized.',
    highlights: [
      {
        icon: 'pi pi-map',
        title: 'Trip Management',
        description: 'Create trips with dates, destinations, and notes. Track trip status from planning to packed.'
      },
      {
        icon: 'pi pi-list',
        title: 'Packing Lists',
        description: 'Build item lists for each trip, organize by category, and mark items as packed.'
      },
      {
        icon: 'pi pi-briefcase',
        title: 'Bags & Packing',
        description: 'Create bags, assign items to bags, and see what is packed where.'
      },
      {
        icon: 'pi pi-users',
        title: 'Travelers & Roles',
        description: 'Add travelers, set roles, and assign items to specific people.'
      },
      {
        icon: 'pi pi-share-alt',
        title: 'Collaboration',
        description: 'Invite family or teammates to contribute to trip planning and packing.'
      },
      {
        icon: 'pi pi-file-pdf',
        title: 'PDF Exports',
        description: 'Download packing lists and trip summaries for offline use.'
      }
    ],
    workflow: {
      title: 'Typical Workflow',
      steps: [
        'Create a trip and set your dates.',
        'Add travelers and assign roles.',
        'Build your packing list and categorize items.',
        'Create bags and assign items to them.',
        'Download a PDF packing list when you are ready.'
      ]
    },
    tips: {
      title: 'Pro Tips',
      items: [
        'Start with a template or reuse a previous trip for faster setup.',
        'Assign items to travelers early to avoid last-minute confusion.',
        'Use bag assignments to keep packing balanced and organized.'
      ]
    }
  };
}
