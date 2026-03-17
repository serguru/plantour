import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CreateStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface SharedItemField {
  name: string;
  description: string;
  required: boolean;
}

@Component({
  selector: 'app-create-shared-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-shared-item.component.html',
  styleUrl: './create-shared-item.component.scss'
})
export class CreateSharedItemComponent {
  steps: CreateStep[] = [
    {
      number: 1,
      title: 'Navigate to Trip Shared Items',
      description: 'Go to your trip and select the Shared Items section.',
      icon: 'pi pi-map'
    },
    {
      number: 2,
      title: 'Click Create Shared Item',
      description: 'Click the "Create" or "+" button to open the creation dialog.',
      icon: 'pi pi-plus'
    },
    {
      number: 3,
      title: 'Enter Item Details',
      description: 'Fill in the name, description, quantity, and any other relevant details.',
      icon: 'pi pi-pencil'
    },
    {
      number: 4,
      title: 'Assign to Participants',
      description: 'Select which participants should pack this item. You can assign to multiple people.',
      icon: 'pi pi-users'
    },
    {
      number: 5,
      title: 'Save Shared Item',
      description: 'Click Save to create the shared item and assign it to selected participants.',
      icon: 'pi pi-check'
    }
  ];

  fields: SharedItemField[] = [
    {
      name: 'Item Name',
      description: 'What is the name of the shared item? (e.g., "Tent", "First Aid Kit")',
      required: true
    },
    {
      name: 'Description',
      description: 'Additional details about the item or special packing instructions.',
      required: false
    },
    {
      name: 'Quantity',
      description: 'How many of this item are needed?',
      required: false
    },
    {
      name: 'Assigned Participants',
      description: 'Who is responsible for packing this item?',
      required: false
    }
  ];

  tips: string[] = [
    'Be clear and specific about what the shared item is',
    'Use the description to explain why the item is important or any special packing needs',
    'You can assign one shared item to multiple participants for group responsibility',
    'Only trip admins can create shared items',
    'After creation, participants will see the assignment and can accept or reject it',
    'You can create multiple shared items for different aspects of the trip'
  ];

  examples: string[] = [
    'Group tent that needs to be packed by the camping coordinator',
    'Shared first aid kit assigned to multiple people for safety',
    'Emergency supplies that everyone should help pack',
    'Trip documents that someone needs to bring'
  ];
}
