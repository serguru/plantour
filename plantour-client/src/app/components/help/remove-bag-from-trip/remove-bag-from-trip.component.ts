import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RemoveStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface Consideration {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-remove-bag-from-trip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './remove-bag-from-trip.component.html',
  styleUrl: './remove-bag-from-trip.component.scss'
})
export class RemoveBagFromTripComponent {
  steps: RemoveStep[] = [
    {
      number: 1,
      title: 'Navigate to Trip Bags',
      description: 'Go to your trip and select the Trip Bags section.',
      icon: 'pi pi-map'
    },
    {
      number: 2,
      title: 'Locate the Bag',
      description: 'Find the trip bag you want to remove from the list.',
      icon: 'pi pi-search'
    },
    {
      number: 3,
      title: 'Click Remove/Delete',
      description: 'Click the remove or delete icon next to the trip bag.',
      icon: 'pi pi-trash'
    },
    {
      number: 4,
      title: 'Confirm Removal',
      description: 'Confirm that you want to remove the bag from the trip.',
      icon: 'pi pi-exclamation-triangle'
    },
    {
      number: 5,
      title: 'Bag Removed',
      description: 'The bag is removed from the trip but remains in your Bags module.',
      icon: 'pi pi-check'
    }
  ];

  considerations: Consideration[] = [
    {
      title: 'Bag Still Exists',
      description: 'Removing a bag from a trip does not delete the bag itself - it only removes the trip association.',
      icon: 'pi pi-info-circle'
    },
    {
      title: 'Items May Be Affected',
      description: 'If items are assigned to this trip bag, they may need to be reassigned to other bags.',
      icon: 'pi pi-box'
    },
    {
      title: 'Can Be Re-added',
      description: 'You can always add the same bag back to the trip later if needed.',
      icon: 'pi pi-replay'
    },
    {
      title: 'No Impact on Other Trips',
      description: 'Removing a bag from one trip does not affect its use in other trips.',
      icon: 'pi pi-map'
    }
  ];

  tips: string[] = [
    'Always check if items are assigned to the bag before removing it',
    'Consider reassigning items to other bags before removal',
    'You cannot undo removal, but you can re-add the bag if needed',
    'The physical bag remains in your Bags module and can be used in other trips',
    'Communicate with trip participants before removing shared luggage'
  ];

  alternativesTitle = 'Alternatives to Removing';
  alternatives: string[] = [
    'Reassign the bag to a different traveler instead of removing it',
    'Keep the bag in the trip as a backup option for additional luggage',
    'Edit the bag in the Bags module if you need to change its properties'
  ];
}
