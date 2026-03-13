import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FinishStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface FinishStatus {
  status: string;
  icon: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-finish-shared-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finish-shared-item.component.html',
  styleUrl: './finish-shared-item.component.scss'
})
export class FinishSharedItemComponent {
  steps: FinishStep[] = [
    {
      number: 1,
      title: 'Pack the Item',
      description: 'Gather and pack the shared item according to trip requirements.',
      icon: 'pi pi-box'
    },
    {
      number: 2,
      title: 'Open Your Trip Items',
      description: 'Go to your personal Trip Items list and find the accepted assignment there.',
      icon: 'pi pi-list'
    },
    {
      number: 3,
      title: 'Choose Success or Failure',
      description: 'Use the finish status controls on the linked trip item to record the real result.',
      icon: 'pi pi-pencil'
    },
    {
      number: 4,
      title: 'Pick the Correct Result',
      description: 'Choose success when the item is packed and ready, or failure when the assignment could not be completed.',
      icon: 'pi pi-check-circle'
    },
    {
      number: 5,
      title: 'Confirm Finish',
      description: 'The status is updated immediately and the admin can see the completion result in shared-item tracking.',
      icon: 'pi pi-check'
    }
  ];

  statuses: FinishStatus[] = [
    {
      status: 'Success',
      icon: 'pi pi-check-circle',
      description: 'Successfully packed the item and it is ready for the trip.',
      color: 'green'
    },
    {
      status: 'Issue/Failure',
      icon: 'pi pi-exclamation-circle',
      description: 'Encountered a problem while packing (item unavailable, damage, etc.).',
      color: 'orange'
    }
  ];

  successChecklist: string[] = [
    'Item is properly packed and ready for travel',
    'Item is labeled if necessary',
    'Item meets any special requirements mentioned',
    'Item is safely stored and won\'t shift during transport',
    'You have documented or photographed if needed for shared items'
  ];

  issueExamples: string[] = [
    'Item was unavailable or could not be obtained',
    'Item was damaged or defective',
    'Item was lost or misplaced',
    'Unable to pack due to space/capacity constraints',
    'Item did not meet specified requirements'
  ];

  tips: string[] = [
    'Wait until you have actually packed the item before marking it finished',
    'Be honest about the status - success or issue',
    'If an issue occurred, contact the admin to discuss alternatives',
    'Finishing the item notifies other team members and the admin'
  ];

  teamNotification: string[] = [
    'Your trip admin will see that you completed the assignment',
    'Other participants may be notified about the shared item status',
    'If you mark an issue, the admin may reach out to discuss solutions',
    'Your reliability helps the team trust and depend on you for future trips'
  ];
}
