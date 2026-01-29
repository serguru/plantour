import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RejectStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface RejectionReason {
  title: string;
  description: string;
}

@Component({
  selector: 'app-reject-shared-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reject-shared-item.component.html',
  styleUrl: './reject-shared-item.component.scss'
})
export class RejectSharedItemComponent {
  steps: RejectStep[] = [
    {
      number: 1,
      title: 'Check Assignments',
      description: 'Navigate to your shared items to see assignments that need your response.',
      icon: 'pi pi-bell'
    },
    {
      number: 2,
      title: 'Review Item Details',
      description: 'Read the item information and assess whether you can truly commit to it.',
      icon: 'pi pi-eye'
    },
    {
      number: 3,
      title: 'Decide to Reject',
      description: 'If you cannot pack this item, decide to reject the assignment.',
      icon: 'pi pi-times-circle'
    },
    {
      number: 4,
      title: 'Click Reject',
      description: 'Click the Reject button to decline responsibility for this item.',
      icon: 'pi pi-thumbs-down'
    },
    {
      number: 5,
      title: 'Provide Optional Reason',
      description: 'Optionally explain why you cannot take on this responsibility (helps the admin understand).',
      icon: 'pi pi-comment'
    },
    {
      number: 6,
      title: 'Confirm Rejection',
      description: 'The admin will be notified and can reassign the item to someone else.',
      icon: 'pi pi-check'
    }
  ];

  reasons: RejectionReason[] = [
    {
      title: 'Capacity Issue',
      description: 'You don\'t have the space, resources, or luggage capacity for this item.'
    },
    {
      title: 'Availability Conflict',
      description: 'You won\'t be able to get or prepare the item before the trip departure.'
    },
    {
      title: 'Special Requirements',
      description: 'The item requires special handling or expertise you don\'t have.'
    },
    {
      title: 'Workload Concerns',
      description: 'You already have too many shared item assignments and can\'t take more.'
    },
    {
      title: 'Unexpected Circumstances',
      description: 'Your situation has changed and you can no longer commit to packing this item.'
    }
  ];

  tips: string[] = [
    'It\'s better to reject early than to accept and fail to deliver',
    'Be honest about your capacity and limitations',
    'Consider providing a brief explanation to help the admin understand',
    'If possible, suggest an alternative solution or someone else who might help',
    'The admin can still assign you other items that better fit your capacity',
    'Rejection doesn\'t hurt your reputation - being reliable does'
  ];

  etiquette: string[] = [
    'Reject as soon as you know you cannot accept the responsibility',
    'If possible, offer an explanation to the trip admin',
    'Suggest who else might be able to take on the item',
    'Be respectful in your communication with the trip team',
    'Thank the admin for understanding and for assigning the item to you'
  ];
}
