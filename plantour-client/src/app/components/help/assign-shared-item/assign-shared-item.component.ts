import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AssignStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface AssignmentOption {
  title: string;
  description: string;
}

@Component({
  selector: 'app-assign-shared-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assign-shared-item.component.html',
  styleUrl: './assign-shared-item.component.scss'
})
export class AssignSharedItemComponent {
  steps: AssignStep[] = [
    {
      number: 1,
      title: 'Navigate to Shared Items',
      description: 'Go to your trip and open the Shared Items section.',
      icon: 'pi pi-map'
    },
    {
      number: 2,
      title: 'Select the Item',
      description: 'Find and open the shared item you want to assign to participants.',
      icon: 'pi pi-search'
    },
    {
      number: 3,
      title: 'Open Assignment Dialog',
      description: 'Click the "Assign" or assignment button to open the assignment interface.',
      icon: 'pi pi-user-plus'
    },
    {
      number: 4,
      title: 'Select Participants',
      description: 'Choose which participants you want to assign this item to. You can select multiple.',
      icon: 'pi pi-users'
    },
    {
      number: 5,
      title: 'Confirm Assignment',
      description: 'Click Assign or Save to send the assignment to selected participants.',
      icon: 'pi pi-check'
    }
  ];

  assignmentOptions: AssignmentOption[] = [
    {
      title: 'Single Participant',
      description: 'One participant is fully responsible for packing this item.'
    },
    {
      title: 'Multiple Participants',
      description: 'Share responsibility among several participants who will coordinate packing the item.'
    },
    {
      title: 'Group Assignment',
      description: 'Assign to all active trip participants for collective responsibility.'
    }
  ];

  tips: string[] = [
    'Only trip admins can assign shared items to participants',
    'Participants must be already added to the trip before you can assign items to them',
    'When assigning to multiple people, they will see each other\'s responses',
    'Participants can accept or reject assignments after they receive them',
    'You can reassign items to different participants if plans change',
    'Consider workload balance when distributing shared items among participants'
  ];

  bestPractices: string[] = [
    'Assign shared items based on participant capabilities and availability',
    'Communicate why items are shared and why specific people are assigned',
    'Distribute shared items fairly across all trip participants',
    'For group items, clearly define coordination responsibilities',
    'Give participants reasonable time to accept or reject assignments before the trip'
  ];
}
