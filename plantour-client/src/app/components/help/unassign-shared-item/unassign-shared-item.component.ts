import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UnassignStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface UnassignScenario {
  title: string;
  description: string;
}

@Component({
  selector: 'app-unassign-shared-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unassign-shared-item.component.html',
  styleUrl: './unassign-shared-item.component.scss'
})
export class UnassignSharedItemComponent {
  steps: UnassignStep[] = [
    {
      number: 1,
      title: 'Navigate to Shared Items',
      description: 'Go to your trip and open the Shared Items section.',
      icon: 'pi pi-map'
    },
    {
      number: 2,
      title: 'Find the Assignment',
      description: 'Locate the shared item assignment you want to remove.',
      icon: 'pi pi-search'
    },
    {
      number: 3,
      title: 'Open Assignment Details',
      description: 'Click on the item or the assignment details to see who it is assigned to.',
      icon: 'pi pi-eye'
    },
    {
      number: 4,
      title: 'Remove Participant',
      description: 'Click the remove or unassign button next to the participant\'s name.',
      icon: 'pi pi-user-minus'
    },
    {
      number: 5,
      title: 'Confirm Unassignment',
      description: 'Click Confirm or Save to remove the assignment.',
      icon: 'pi pi-check'
    }
  ];

  scenarios: UnassignScenario[] = [
    {
      title: 'Participant Cannot Help',
      description: 'A participant is unable to take on the responsibility and you need to unassign them.'
    },
    {
      title: 'Item No Longer Needed',
      description: 'The item is no longer required and should be unassigned from all participants.'
    },
    {
      title: 'Workload Adjustment',
      description: 'You want to redistribute responsibilities due to changing trip circumstances.'
    },
    {
      title: 'Reassignment',
      description: 'You want to assign the item to different participants instead.'
    }
  ];

  tips: string[] = [
    'Only trip admins can unassign shared items from participants',
    'Unassigning does not delete the shared item - it just removes the participant assignment',
    'Participants will see that they are no longer responsible for the item',
    'The shared item can be assigned to other participants after unassignment',
    'Consider communicating with participants before unassigning them',
    'If a participant has already accepted the assignment, they should be notified of the change'
  ];

  relatedActions: string[] = [
    'Edit the shared item to change details or reassign to different participants',
    'Delete the shared item entirely if it is no longer needed',
    'Accept or reject assignments from the participant perspective'
  ];
}
