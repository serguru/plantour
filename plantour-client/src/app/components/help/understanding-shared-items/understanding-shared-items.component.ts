import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SharedItemFeature {
  icon: string;
  title: string;
  description: string;
}

interface SharedItemBenefit {
  title: string;
  description: string;
}

@Component({
  selector: 'app-understanding-shared-items',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './understanding-shared-items.component.html',
  styleUrl: './understanding-shared-items.component.scss'
})
export class UnderstandingSharedItemsComponent {
  features: SharedItemFeature[] = [
    {
      icon: 'pi pi-share-alt',
      title: 'Admin Creates Shared Items',
      description: 'Trip admins can create items that are shared with all participants in the trip.'
    },
    {
      icon: 'pi pi-user-check',
      title: 'Assign to Participants',
      description: 'Assign shared items to specific participants with responsibility for packing them.'
    },
    {
      icon: 'pi pi-thumbs-up',
      title: 'Participant Acceptance',
      description: 'Participants can accept or reject their assigned shared items.'
    },
    {
      icon: 'pi pi-check-circle',
      title: 'Track Packing Status',
      description: 'Participants finish items when packed successfully or mark as failed.'
    }
  ];

  benefits: SharedItemBenefit[] = [
    {
      title: 'Collaborative Planning',
      description: 'Admins and participants work together on shared packing responsibilities.'
    },
    {
      title: 'Clear Accountability',
      description: 'Each participant knows exactly which items they are responsible for packing.'
    },
    {
      title: 'Status Tracking',
      description: 'Monitor which items are accepted, rejected, or successfully packed.'
    },
    {
      title: 'Flexibility',
      description: 'Participants can reject items if they cannot pack them, and items can be reassigned.'
    }
  ];

  workflow: string[] = [
    'Admin creates a shared item and describes what needs to be packed',
    'Admin assigns the shared item to specific participants',
    'Participant receives the assignment and can accept or reject it',
    'If accepted, participant packs the item and marks it as finished',
    'If failed during packing, participant can mark it as incomplete',
    'Admin can see the status of all shared items and their assignments'
  ];

  keyPoints: string[] = [
    'Shared items are trip-specific and only exist within a trip context',
    'Only trip admins can create and assign shared items',
    'Participants can accept, reject, or finish shared items assigned to them',
    'Finishing an item means marking it as successfully packed or failed',
    'Shared items are separate from regular items - they are specifically for collaboration',
    'Multiple participants can be assigned the same shared item'
  ];
}
