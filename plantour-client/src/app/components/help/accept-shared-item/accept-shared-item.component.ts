import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AcceptStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface AcceptBenefit {
  title: string;
  description: string;
}

@Component({
  selector: 'app-accept-shared-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accept-shared-item.component.html',
  styleUrl: './accept-shared-item.component.scss'
})
export class AcceptSharedItemComponent {
  steps: AcceptStep[] = [
    {
      number: 1,
      title: 'Check Assignments',
      description: 'Open the Shared Items page for the current trip and review the items assigned to you.',
      icon: 'pi pi-bell'
    },
    {
      number: 2,
      title: 'Review Item Details',
      description: 'Read the item name, category, notes, and deadline information before you decide.',
      icon: 'pi pi-eye'
    },
    {
      number: 3,
      title: 'Assess Your Capacity',
      description: 'Determine if you can realistically pack this item given your availability and resources.',
      icon: 'pi pi-check-circle'
    },
    {
      number: 4,
      title: 'Click Accept',
      description: 'Click the Accept button to confirm you will pack this item for the trip.',
      icon: 'pi pi-thumbs-up'
    },
    {
      number: 5,
      title: 'Confirm Acceptance',
      description: 'You are now responsible for packing this item. The assignment becomes linked to your personal trip item list and the trip admin will see your acceptance.',
      icon: 'pi pi-check'
    }
  ];

  benefits: AcceptBenefit[] = [
    {
      title: 'Clear Responsibility',
      description: 'By accepting, you commit to packing the item for the trip.'
    },
    {
      title: 'Team Coordination',
      description: 'The admin knows you have the item covered and can plan accordingly.'
    },
    {
      title: 'Shared Visibility',
      description: 'Other trip participants see who is handling which shared items.'
    },
    {
      title: 'Progress Tracking',
      description: 'You can mark the item as finished once you have successfully packed it.'
    }
  ];

  tips: string[] = [
    'Only accept if you are confident you can pack the item before the trip',
    'If you cannot handle the assignment, reject it so the admin can reassign it quickly',
    'If circumstances change, you can discuss with the trip admin about reassignment',
    'Accepting is a commitment to your trip teammates',
    'Once accepted, you can mark the item as finished when you pack it',
    'Review all details and instructions carefully before accepting'
  ];

  considerations: string[] = [
    'Do you have the capacity to pack this item?',
    'Do you understand what the item is and what is required?',
    'Are there any special handling or preparation needs?',
    'Will you have access to this item at the right time?',
    'Do you have enough time before the deadline?'
  ];
}
