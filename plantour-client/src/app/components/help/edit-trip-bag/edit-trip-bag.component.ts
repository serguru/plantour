import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EditStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface EditableField {
  name: string;
  description: string;
  canEdit: boolean;
}

@Component({
  selector: 'app-edit-trip-bag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-trip-bag.component.html',
  styleUrl: './edit-trip-bag.component.scss'
})
export class EditTripBagComponent {
  steps: EditStep[] = [
    {
      number: 1,
      title: 'Navigate to Trip Bags',
      description: 'Go to your trip and select the Trip Bags section.',
      icon: 'pi pi-map'
    },
    {
      number: 2,
      title: 'Find the Bag',
      description: 'Locate the trip bag you want to edit in the list.',
      icon: 'pi pi-search'
    },
    {
      number: 3,
      title: 'Open Edit Dialog',
      description: 'Click the edit icon or button next to the trip bag.',
      icon: 'pi pi-pencil'
    },
    {
      number: 4,
      title: 'Update Information',
      description: 'Change the traveler assignment or other editable fields.',
      icon: 'pi pi-user'
    },
    {
      number: 5,
      title: 'Save Changes',
      description: 'Click Save to update the trip bag with your changes.',
      icon: 'pi pi-check'
    }
  ];

  editableFields: EditableField[] = [
    {
      name: 'Assigned Traveler',
      description: 'Change which traveler owns or carries this bag',
      canEdit: true
    },
    {
      name: 'Bag Selection',
      description: 'The bag itself cannot be changed - remove and re-add if needed',
      canEdit: false
    }
  ];

  tips: string[] = [
    'You can reassign bags between travelers at any time during trip planning',
    'If you need to change which bag is used, remove the trip bag and add a different one',
    'Only travelers who are participants in the trip can be assigned bags',
    'Changing the traveler assignment helps coordinate luggage responsibilities',
    'The underlying bag details (name, color, capacity) are edited in the Bags module'
  ];

  commonScenarios: string[] = [
    'Reassigning luggage when travelers change their packing arrangements',
    'Updating bag ownership when trip plans or participants change',
    'Coordinating who brings which bags for group travel'
  ];
}
